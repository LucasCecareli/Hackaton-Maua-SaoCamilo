/**
 * ============================================================================
 * ELO - CLIENTE DE CONEXÃO E SERVIÇOS DO SUPABASE (PostgreSQL + Auth)
 * ============================================================================
 */

// 1. CONFIGURAÇÃO DAS CHAVES DO SEU PROJETO SUPABASE:
// Você pega esses valores no menu: Project Settings > API do seu Supabase Dashboard
const SUPABASE_CONFIG = {
  url: "https://SEU_PROJETO.supabase.co", // Substitua pela URL do seu projeto
  anonKey: "SUA_CHAVE_ANON_PUBLICA_AQUI" // Substitua pela sua anon public key
};

// Variável do cliente Supabase
let supabaseClient = null;
let supabaseConectado = false;

// Inicialização do cliente Supabase via CDN
function inicializarSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url !== "https://SEU_PROJETO.supabase.co") {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      supabaseConectado = true;
      console.log("✔ Supabase conectado com sucesso ao PostgreSQL na nuvem!");
    } catch (err) {
      console.warn("Falha ao inicializar Supabase. Usando modo de persistência local resiliente.", err);
      supabaseConectado = false;
    }
  } else {
    console.log("ℹ Supabase em modo híbrido/resiliente (usando banco local até inserir as chaves).");
    supabaseConectado = false;
  }
}

// --------------------------------------------------------------------------
// SERVIÇOS DO SUPABASE PARA O APLICATIVO ELO
// --------------------------------------------------------------------------
const SupabaseService = {

  // Login de Usuário
  async login(email, senha) {
    if (supabaseConectado) {
      // Autenticação oficial do Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      
      // Busca os dados do perfil na tabela PostgreSQL
      const { data: perfilData } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      return perfilData || data.user;
    } else {
      // Fallback para o banco local resiliente
      const user = BancoUsuarios[email];
      if (!user) throw new Error("Usuário não encontrado.");
      if (user.senha !== senha) throw new Error("Senha incorreta.");
      return user;
    }
  },

  // Cadastro de Novo Usuário (Gari ou Morador)
  async cadastrar(dadosUsuario) {
    if (supabaseConectado) {
      // 1. Cria usuário no Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha
      });
      if (authError) throw authError;

      // 2. Insere dados na tabela PostgreSQL 'profiles'
      const { data: profileData, error: profError } = await supabaseClient
        .from('profiles')
        .insert([{
          email: dadosUsuario.email,
          nome: dadosUsuario.nome,
          perfil: dadosUsuario.perfil,
          rota_ou_bairro: dadosUsuario.rota,
          pontos_elos: 50
        }])
        .select()
        .single();

      if (profError) throw profError;
      return profileData;
    } else {
      // Salva no banco local
      BancoUsuarios[dadosUsuario.email] = {
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
      salvarBancoUsuarios();
      return BancoUsuarios[dadosUsuario.email];
    }
  },

  // Atualizar Saldo de ELOs do Trabalhador
  async atualizarPontos(email, novosPontos) {
    if (supabaseConectado) {
      await supabaseClient
        .from('profiles')
        .update({ pontos_elos: novosPontos })
        .eq('email', email);
    }
  },

  // Registrar Check-in no Banco de Dados
  async registrarCheckin(email, humor, nivelDor) {
    if (supabaseConectado) {
      await supabaseClient
        .from('checkins_saude')
        .insert([{
          user_email: email,
          humor: humor,
          nivel_dor: nivelDor
        }]);

      // Incrementa contador no perfil
      await supabaseClient.rpc('increment_checkins', { user_email_param: email });
    }
  },

  // Registrar Denúncia / Ocorrência de Risco (Vidro Quebrado)
  async salvarOcorrencia(ocorrencia) {
    if (supabaseConectado) {
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

      if (error) console.error("Erro ao salvar ocorrência no Supabase:", error);
      return data;
    }
  },

  // Salvar Novo Voucher Conquistado
  async salvarVoucher(email, voucher) {
    if (supabaseConectado) {
      await supabaseClient
        .from('vouchers')
        .insert([{
          user_email: email,
          titulo: voucher.titulo,
          local_parceiro: voucher.local,
          codigo: voucher.codigo,
          status: voucher.status
        }]);
    }
  }
};

// Tenta inicializar ao carregar o script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarSupabase);
} else {
  inicializarSupabase();
}
