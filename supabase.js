/**
 * ============================================================================
 * ELO - CLIENTE DE CONEXÃO E SERVIÇOS DO SUPABASE (PostgreSQL + Auth)
 * Conectado ao projeto: https://aqpyldkevktfkdhmhiai.supabase.co
 * ============================================================================
 */

const SUPABASE_CONFIG = {
  url: "https://aqpyldkevktfkdhmhiai.supabase.co",
  anonKey: "sb_publishable_nK76_Lkfin4DNcP-bqYTwA_vJvYrGBv"
};

let supabaseClient = null;
let supabaseConectado = false;

// Inicialização do cliente Supabase via CDN
function inicializarSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      supabaseConectado = true;
      console.log("✔ Supabase conectado com sucesso ao projeto:", SUPABASE_CONFIG.url);
    } catch (err) {
      console.warn("Falha ao inicializar Supabase. Usando modo de persistência local resiliente.", err);
      supabaseConectado = false;
    }
  } else {
    console.log("ℹ Supabase em modo híbrido/resiliente.");
    supabaseConectado = false;
  }
}

/**
 * Converte um registro vindo do PostgreSQL (snake_case) para o formato do App (camelCase)
 */
function normalizarPerfilSupabase(row, fallbackUser = {}) {
  if (!row) return fallbackUser;
  return {
    id: row.id,
    nome: row.nome || fallbackUser.nome || "Trabalhador ELO",
    email: row.email || fallbackUser.email,
    senha: fallbackUser.senha || "123456",
    perfil: row.perfil || fallbackUser.perfil || "trabalhador",
    rota: row.rota_ou_bairro || fallbackUser.rota || "Rota Central",
    pontosElos: typeof row.pontos_elos === 'number' ? row.pontos_elos : (fallbackUser.pontosElos || 50),
    checkins: typeof row.total_checkins === 'number' ? row.total_checkins : (fallbackUser.checkins || 0),
    alongamentos: typeof row.total_alongamentos === 'number' ? row.total_alongamentos : (fallbackUser.alongamentos || 0),
    alertas: typeof row.total_alertas === 'number' ? row.total_alertas : (fallbackUser.alertas || 0),
    vouchers: fallbackUser.vouchers || []
  };
}

// --------------------------------------------------------------------------
// SERVIÇOS DO SUPABASE PARA O APLICATIVO ELO
// --------------------------------------------------------------------------
const SupabaseService = {

  // Login de Usuário (PostgreSQL + Auth com fallback resiliente)
  async login(email, senha) {
    if (supabaseConectado) {
      try {
        // 1. Busca o perfil direto na tabela PostgreSQL 'profiles'
        const { data: perfilData, error: perfilErr } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        // Busca também os vouchers salvos no Supabase para esse e-mail
        let vouchersBanco = [];
        const { data: vData } = await supabaseClient
          .from('vouchers')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false });

        if (vData && vData.length > 0) {
          vouchersBanco = vData.map(v => ({
            titulo: v.titulo,
            local: v.local_parceiro,
            codigo: v.codigo,
            status: v.status,
            icone: v.titulo.includes("Café") ? "☕" : v.titulo.includes("Celular") ? "📱" : "🏥"
          }));
        }

        if (perfilData) {
          const fallback = BancoUsuarios[email] || { senha, vouchers: vouchersBanco };
          if (vouchersBanco.length > 0) fallback.vouchers = vouchersBanco;
          const usuarioNormalizado = normalizarPerfilSupabase(perfilData, fallback);
          BancoUsuarios[email] = usuarioNormalizado;
          salvarBancoUsuarios();
          return usuarioNormalizado;
        }
      } catch (err) {
        console.warn("Aviso ao consultar tabela profiles no Supabase (usando cache local):", err.message);
      }
    }

    // Fallback para o banco local caso a tabela ainda não tenha o usuário
    const user = BancoUsuarios[email];
    if (!user) throw new Error("E-mail não encontrado. Clique na aba 'Criar Conta' para se cadastrar!");
    if (user.senha && user.senha !== senha) throw new Error("Senha incorreta.");
    return user;
  },

  // Cadastro de Novo Usuário (Gari ou Morador)
  async cadastrar(dadosUsuario) {
    const novoObjetoLocal = {
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      senha: dadosUsuario.senha,
      perfil: dadosUsuario.perfil,
      rota: dadosUsuario.rota,
      pontosElos: 50,
      checkins: 0,
      alongamentos: 0,
      alertas: 0,
      vouchers: []
    };

    // Salva localmente primeiro para resposta imediata
    BancoUsuarios[dadosUsuario.email] = novoObjetoLocal;
    salvarBancoUsuarios();

    if (supabaseConectado) {
      try {
        // 1. Registra no Supabase Auth (opcional/não-bloqueante caso confirmação de e-mail esteja ativa)
        await supabaseClient.auth.signUp({
          email: dadosUsuario.email,
          password: dadosUsuario.senha
        }).catch(() => {});

        // 2. Insere na tabela PostgreSQL 'profiles'
        const { data: profileData, error: profError } = await supabaseClient
          .from('profiles')
          .upsert([{
            email: dadosUsuario.email,
            nome: dadosUsuario.nome,
            perfil: dadosUsuario.perfil,
            rota_ou_bairro: dadosUsuario.rota,
            pontos_elos: 50,
            total_checkins: 0,
            total_alongamentos: 0,
            total_alertas: 0
          }], { onConflict: 'email' })
          .select()
          .single();

        if (!profError && profileData) {
          return normalizarPerfilSupabase(profileData, novoObjetoLocal);
        } else if (profError) {
          console.warn("Aviso ao inserir em profiles no Supabase:", profError.message);
        }
      } catch (err) {
        console.warn("Erro de rede ao cadastrar no Supabase, mantendo registro local:", err);
      }
    }

    return novoObjetoLocal;
  },

  // Atualizar Saldo de ELOs do Trabalhador
  async atualizarPontos(email, novosPontos) {
    if (supabaseConectado && email) {
      try {
        await supabaseClient
          .from('profiles')
          .update({ pontos_elos: novosPontos })
          .eq('email', email);
      } catch (e) {
        console.warn("Erro ao sincronizar pontos com Supabase:", e);
      }
    }
  },

  // Registrar Check-in no Banco de Dados
  async registrarCheckin(email, humor, nivelDor, novoTotalCheckins) {
    if (supabaseConectado && email) {
      try {
        await supabaseClient
          .from('checkins_saude')
          .insert([{
            user_email: email,
            humor: humor || 'Bem',
            nivel_dor: nivelDor || 'Sem dores'
          }]);

        if (typeof novoTotalCheckins === 'number') {
          await supabaseClient
            .from('profiles')
            .update({ total_checkins: novoTotalCheckins })
            .eq('email', email);
        }
      } catch (e) {
        console.warn("Erro ao salvar check-in no Supabase:", e);
      }
    }
  },

  // Salvar Mensagem no Mural da Comunidade
  async salvarMensagemMural(autor, texto) {
    if (supabaseConectado) {
      try {
        await supabaseClient
          .from('mural_mensagens')
          .insert([{
            autor: autor,
            texto: texto,
            apoios: 1
          }]);
      } catch (e) {
        console.warn("Erro ao salvar mensagem no mural do Supabase:", e);
      }
    }
  },

  // Registrar Denúncia / Ocorrência de Risco (Vidro Quebrado)
  async salvarOcorrencia(ocorrencia) {
    if (supabaseConectado) {
      try {
        const { data, error } = await supabaseClient
          .from('ocorrencias')
          .insert([{
            protocolo: ocorrencia.protocolo,
            tipo_problema: ocorrencia.tipoProblema,
            endereco: ocorrencia.endereco,
            descricao: ocorrencia.descricao,
            is_risco_cortante: ocorrencia.tipoProblema.includes('Perigoso') || ocorrencia.tipoProblema.includes('Vidro')
          }])
          .select();

        if (error) console.warn("Aviso ao salvar ocorrência no Supabase:", error.message);
        return data;
      } catch (e) {
        console.warn("Erro ao conectar ao Supabase para salvar ocorrência:", e);
      }
    }
  },

  // Salvar Novo Voucher Conquistado
  async salvarVoucher(email, voucher) {
    if (supabaseConectado && email) {
      try {
        await supabaseClient
          .from('vouchers')
          .insert([{
            user_email: email,
            titulo: voucher.titulo,
            local_parceiro: voucher.local,
            codigo: voucher.codigo,
            status: voucher.status
          }]);
      } catch (e) {
        console.warn("Erro ao salvar voucher no Supabase:", e);
      }
    }
  }
};

// Inicializa imediatamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarSupabase);
} else {
  inicializarSupabase();
}
