/**
 * ============================================================================
 * ELO - MOTOR PRINCIPAL DE LÓGICA, ESTADO E ACESSIBILIDADE (Vanilla JS)
 * Fases 1, 2 e 3 integradas
 * ============================================================================
 */

// ============================================================================
// BANCO DE DADOS LOCAL DE USUÁRIOS (DATABASE ENGINE E AUTH)
// Explicação para a banca:
// Camada de persistência local simulando um Backend as a Service (Supabase/Firebase)
// permitindo login individual, múltiplos trabalhadores e persistência de dados.
// ============================================================================
const BancoUsuariosPadrao = {
  "carlos@elo.com": {
    nome: "Carlos Silva",
    email: "carlos@elo.com",
    senha: "123456",
    perfil: "trabalhador",
    rota: "Rota 14 - Bairro Ipiranga",
    pontosElos: 340,
    checkins: 12,
    alongamentos: 8,
    alertas: 4,
    vouchers: [
      { titulo: "Café com Pão na Chapa", local: "Padaria Estrela do Ipiranga", codigo: "ELO-7492", status: "Pronto para Usar", icone: "☕" },
      { titulo: "Sessão de Fisioterapia", local: "Clínica Integrada São Camilo", codigo: "SPSC-1104", status: "Agendado", icone: "🏥" }
    ]
  },
  "mariana@elo.com": {
    nome: "Mariana Souza",
    email: "mariana@elo.com",
    senha: "123456",
    perfil: "morador",
    rota: "Rua dos Patriotas - Ipiranga",
    pontosElos: 80,
    checkins: 4,
    alongamentos: 2,
    alertas: 3,
    vouchers: []
  }
};

// Carrega ou inicializa o banco no LocalStorage
let BancoUsuarios = JSON.parse(localStorage.getItem('elo_banco_usuarios')) || BancoUsuariosPadrao;

function salvarBancoUsuarios() {
  localStorage.setItem('elo_banco_usuarios', JSON.stringify(BancoUsuarios));
}

// Estado Global da Aplicação
const EstadoApp = {
  usuarioLogado: JSON.parse(localStorage.getItem('elo_usuario_sessao')) || BancoUsuarios["carlos@elo.com"],
  perfilAtual: localStorage.getItem('elo_perfil') || 'trabalhador',
  pontosElos: 340,
  telaAtual: 'screen-splash',
  checkinDoDia: {
    humor: null,
    dor: null
  },
  mensagensComunidade: JSON.parse(localStorage.getItem('elo_mensagens')) || [
    {
      autor: "🏡 Moradora - Bairro Ipiranga",
      texto: "Muito obrigada pelo trabalho duro de vocês! Deixei uma garrafa de água gelada no portão hoje. Vocês são heróis!",
      apoios: 24,
      hora: "Hoje, 08:30"
    },
    {
      autor: "👨‍👩‍👧 Família do Carlos",
      texto: "Pai, muito orgulho do seu trabalho! Volta logo pra casa, cuide da coluna! Te amamos.",
      apoios: 12,
      hora: "Ontem"
    }
  ]
};

// Sincroniza dados do usuário logado na inicialização
if (EstadoApp.usuarioLogado) {
  EstadoApp.pontosElos = EstadoApp.usuarioLogado.pontosElos || 340;
  EstadoApp.perfilAtual = EstadoApp.usuarioLogado.perfil || 'trabalhador';
}

/* --------------------------------------------------------------------------
   1. ACESSIBILIDADE POR VOZ INTERATIVA (VERDE = FALANDO | VERMELHO = SEM FALA)
   -------------------------------------------------------------------------- */
const suporteVoz = 'speechSynthesis' in window;

const EstadoVoz = {
  estaFalando: false,
  inicioFalaMs: 0,
  estadoVisual: 'idle', // 'idle' | 'speaking' (verde) | 'stopped' (vermelho)
  timerEstimado: null
};

function atualizarVisualBotoesVoz(estado) {
  EstadoVoz.estadoVisual = estado;

  // 1. Atualiza botões principais de topo (#btn-global-voice e #btn-admin-voice)
  const botoesToggle = document.querySelectorAll('.btn-voice-toggle');
  botoesToggle.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    const icone = btn.querySelector('.voice-icon');
    const texto = btn.querySelector('.voice-text');

    if (estado === 'speaking') {
      btn.classList.add('voice-speaking');
      if (icone) icone.textContent = '🔊';
      if (texto) texto.textContent = 'Falando...';
      btn.title = 'Falando agora! Toque novamente para parar o áudio.';
    } else if (estado === 'stopped') {
      btn.classList.add('voice-stopped');
      if (icone) icone.textContent = '🔇';
      if (texto) texto.textContent = 'Sem fala';
      btn.title = 'Áudio parado. Toque para ouvir novamente.';
    } else {
      if (icone) icone.textContent = '🔊';
      if (texto) texto.textContent = 'Ouvir';
      btn.title = 'Ler tela em voz alta';
    }
  });

  // 2. Atualiza botões circulares (.btn-voice-inline) em todas as telas
  const botoesInline = document.querySelectorAll('.btn-voice-inline');
  botoesInline.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    if (estado === 'speaking') {
      btn.classList.add('voice-speaking');
      btn.textContent = '🔊';
      btn.title = 'Falando... Toque para parar';
    } else if (estado === 'stopped') {
      btn.classList.add('voice-stopped');
      btn.textContent = '🔇';
      btn.title = 'Sem fala. Toque para ouvir';
    } else {
      btn.textContent = '🔊';
      btn.title = 'Ouvir tela';
    }
  });

  // 3. Atualiza botões de recados e guia de vídeo (.btn-speak-msg e .btn-guide-audio)
  const botoesMsg = document.querySelectorAll('.btn-speak-msg');
  botoesMsg.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    if (estado === 'speaking') {
      btn.classList.add('voice-speaking');
      btn.innerHTML = '🔊 Falando...';
    } else if (estado === 'stopped') {
      btn.classList.add('voice-stopped');
      btn.innerHTML = '🔇 Sem fala';
    } else {
      btn.innerHTML = '🔊 Ouvir';
    }
  });

  const botoesGuia = document.querySelectorAll('.btn-guide-audio');
  botoesGuia.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    if (estado === 'speaking') {
      btn.classList.add('voice-speaking');
      btn.innerHTML = '🔊 Falando... (Toque p/ Parar)';
    } else if (estado === 'stopped') {
      btn.classList.add('voice-stopped');
      btn.innerHTML = '🔇 Sem fala (Toque p/ Ouvir)';
    } else {
      btn.innerHTML = '🔊 Ouvir Instruções em Voz Alta';
    }
  });
}

function pararFalaUsuario() {
  if (EstadoVoz.timerEstimado) {
    clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.timerEstimado = null;
  }
  EstadoVoz.estaFalando = false;
  if (suporteVoz) {
    window.speechSynthesis.cancel();
  }
  atualizarVisualBotoesVoz('stopped');
}

function falarTexto(texto, forcarNovaFala = false) {
  // Se já estiver falando (Verde) e o usuário apertar novamente no botão de áudio,
  // interrompe a fala imediatamente e muda para Vermelho ("Sem fala")!
  if (EstadoVoz.estaFalando && !forcarNovaFala) {
    pararFalaUsuario();
    return;
  }

  if (EstadoVoz.timerEstimado) {
    clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.timerEstimado = null;
  }

  EstadoVoz.estaFalando = true;
  EstadoVoz.inicioFalaMs = Date.now();
  atualizarVisualBotoesVoz('speaking');

  // Tempo estimado de leitura caso o navegador não dispare onend real (ex: Chromium sem placa de som)
  const duracaoEstimadaMs = Math.max(3000, Math.min(14000, texto.length * 65));
  EstadoVoz.timerEstimado = setTimeout(() => {
    if (EstadoVoz.estaFalando) {
      EstadoVoz.estaFalando = false;
      atualizarVisualBotoesVoz('idle');
    }
  }, duracaoEstimadaMs);

  if (!suporteVoz) {
    console.warn("Navegador sem suporte a síntese de voz.");
    return;
  }

  window.speechSynthesis.cancel(); // Para áudios anteriores
  const locucao = new SpeechSynthesisUtterance(texto);
  locucao.lang = 'pt-BR';
  locucao.rate = 1.0;
  locucao.pitch = 1.0;

  locucao.onend = () => {
    // Ignora disparo instantâneo (<800ms) que ocorre em ambientes sem sintetizador de voz instalado
    if (EstadoVoz.estaFalando && (Date.now() - EstadoVoz.inicioFalaMs > 800)) {
      EstadoVoz.estaFalando = false;
      if (EstadoVoz.timerEstimado) clearTimeout(EstadoVoz.timerEstimado);
      atualizarVisualBotoesVoz('idle');
    }
  };

  window.speechSynthesis.speak(locucao);
}

function lerTelaAtual() {
  const tela = EstadoApp.telaAtual;
  if (tela === 'screen-splash') {
    falarTexto("Aplicativo ELO: Juntos por uma cidade melhor. Conectando quem cuida da cidade. Saúde, cuidado e reconhecimento para quem faz a diferença todos os dias. Toque no botão Começar.");
  } else if (tela === 'screen-auth') {
    falarTexto("Tela de acesso ao ELO. Entre com seu e-mail ou use os botões de acesso rápido abaixo para demonstração.");
  } else if (tela === 'screen-roles') {
    falarTexto("Escolha o seu perfil: Sou Morador, Sou Trabalhador da coleta ou Painel Web da Concessionária e Prefeitura.");
  } else if (tela === 'screen-home-worker') {
    falarTexto(`Olá Carlos! Você tem ${EstadoApp.pontosElos} ELOs. Escolha uma das opções: Meu Bem-Estar, Minha Saúde, Aprender, Meus ELOs, Mapa da Rota 14 ou Minha Comunidade.`);
  } else if (tela === 'screen-worker-profile') {
    falarTexto(`Perfil de Carlos Silva. Você possui ${EstadoApp.pontosElos} ELOs acumulados e dois vouchers prontos para uso na padaria e na clínica São Camilo.`);
  } else if (tela === 'screen-wellbeing') {
    falarTexto("Tela de Meu Bem-Estar. Conte como você está se sentindo e se sente dores no corpo depois do trabalho.");
  } else if (tela === 'screen-health') {
    falarTexto("Minha Saúde: Exercícios rápidos de alongamento para coluna, ombros e pernas.");
  } else if (tela === 'screen-video-player') {
    narrarPassosVideo();
  } else if (tela === 'screen-rewards') {
    falarTexto(`Seus ELOs: Você possui ${EstadoApp.pontosElos} pontos. Troque por recargas, lanche na padaria ou consultas de fisioterapia e psicologia.`);
  } else if (tela === 'screen-community') {
    falarTexto("Minha Comunidade: Mensagens de carinho e apoio enviadas pelos moradores do bairro para a sua equipe.");
  } else if (tela === 'screen-home-morador') {
    falarTexto("Olá Mariana! Escolha uma das opções: Meu Bairro, Denúncias de resíduos perigosos, Aprenda sobre descarte ou Valorize a equipe da coleta.");
  } else if (tela === 'screen-reports') {
    falarTexto("Tela de Denúncias. Informe a localização, marque se há resíduos perigosos como caco de vidro solto e envie para a equipe.");
  } else if (tela === 'screen-neighborhood') {
    falarTexto("Mapa do Bairro ao vivo: acompanhe o caminhão da coleta na Rota 14 pelo Ipiranga, veja o ponto de apoio da São Camilo e os alertas de vidro quebrado.");
  } else if (tela === 'screen-learn') {
    falarTexto("Aprenda: Guia de saúde e prevenção. Saiba como evitar dengue, leptospirose e como embalar vidros com segurança.");
  } else if (tela === 'screen-appreciate') {
    falarTexto("Valorize: Digite uma mensagem de incentivo para os coletores. Seu recado será lido em áudio para a equipe da sua rua.");
  } else if (tela === 'screen-admin-dashboard') {
    falarTexto("Painel Executivo Web da Concessionária e Prefeitura. Índice de bem-estar da frota em 89 por cento, com redução de 34 por cento nos afastamentos e monitoramento em tempo real pelo Supabase.");
  }
}

/* --------------------------------------------------------------------------
   2. ROTEAMENTO SPA (TROCA DE TELAS)
   -------------------------------------------------------------------------- */
function navegarPara(idTelaDestino) {
  // Ao trocar de tela, encerra qualquer áudio pendente da tela anterior
  if (EstadoVoz.estaFalando) {
    if (EstadoVoz.timerEstimado) clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.estaFalando = false;
    if (suporteVoz) window.speechSynthesis.cancel();
    atualizarVisualBotoesVoz('idle');
  }

  const todasTelas = document.querySelectorAll('.screen');
  todasTelas.forEach(tela => tela.classList.remove('active'));

  const frame = document.querySelector('.mobile-frame');
  if (frame) {
    if (idTelaDestino === 'screen-admin-dashboard') {
      frame.classList.add('desktop-mode');
    } else {
      frame.classList.remove('desktop-mode');
    }
  }

  const telaDestino = document.getElementById(idTelaDestino);
  if (telaDestino) {
    telaDestino.classList.add('active');
    EstadoApp.telaAtual = idTelaDestino;

    const container = document.querySelector('.screens-container');
    if (container) container.scrollTop = 0;

    // Se abriu a tela do Mapa (Meu Bairro), inicializa ou atualiza o Leaflet
    if (idTelaDestino === 'screen-neighborhood') {
      setTimeout(() => {
        inicializarMapaLeaflet();
      }, 120);
    }
  }

  // Atualiza a barra de navegação inferior
  const bottomNav = document.getElementById('bottom-navbar');
  if (bottomNav) {
    if (
      idTelaDestino === 'screen-splash' ||
      idTelaDestino === 'screen-roles' ||
      idTelaDestino === 'screen-auth' ||
      idTelaDestino === 'screen-admin-dashboard'
    ) {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
      atualizarItensNav(idTelaDestino);
    }
  }
}

function atualizarItensNav(idTela) {
  // Detecta se deve exibir a barra inferior do Morador ou do Trabalhador
  const navTrab = document.getElementById('nav-group-trabalhador');
  const navMorador = document.getElementById('nav-group-morador');

  if (idTela === 'screen-home-morador' || idTela === 'screen-reports' || idTela === 'screen-appreciate') {
    EstadoApp.perfilAtual = 'morador';
  } else if (idTela === 'screen-home-worker' || idTela === 'screen-wellbeing' || idTela === 'screen-health' || idTela === 'screen-rewards' || idTela === 'screen-worker-profile') {
    EstadoApp.perfilAtual = 'trabalhador';
  }

  if (EstadoApp.perfilAtual === 'morador') {
    if (navTrab) navTrab.style.display = 'none';
    if (navMorador) navMorador.style.display = 'flex';
  } else {
    if (navTrab) navTrab.style.display = 'flex';
    if (navMorador) navMorador.style.display = 'none';
  }

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  // Marca aba ativa do Trabalhador
  if (idTela === 'screen-home-worker') {
    document.getElementById('nav-inicio-trab')?.classList.add('active');
  } else if (idTela === 'screen-wellbeing' || idTela === 'screen-health') {
    document.getElementById('nav-saude')?.classList.add('active');
  } else if (idTela === 'screen-rewards') {
    document.getElementById('nav-elos')?.classList.add('active');
  } else if (idTela === 'screen-community') {
    document.getElementById('nav-comunidade')?.classList.add('active');
  }

  // Marca aba ativa do Morador
  if (idTela === 'screen-home-morador') {
    document.getElementById('nav-inicio-morador')?.classList.add('active');
  } else if (idTela === 'screen-neighborhood') {
    document.getElementById('nav-mapa-morador')?.classList.add('active');
  } else if (idTela === 'screen-reports') {
    document.getElementById('nav-denuncias-morador')?.classList.add('active');
  } else if (idTela === 'screen-learn') {
    document.getElementById('nav-aprenda-morador')?.classList.add('active');
  } else if (idTela === 'screen-appreciate') {
    document.getElementById('nav-valorize-morador')?.classList.add('active');
  }
}

function alternarDetalheAprendizado(cardEl, textoFala) {
  if (cardEl) {
    cardEl.classList.toggle('expanded');
  }
  if (textoFala) {
    falarTexto(textoFala);
  }
}

function selecionarPerfil(tipoPerfil) {
  EstadoApp.perfilAtual = tipoPerfil;
  localStorage.setItem('elo_perfil', tipoPerfil);

  if (tipoPerfil === 'trabalhador') {
    falarTexto("Bem-vindo Carlos! Espaço de saúde e benefícios da sua rota.");
    navegarPara('screen-home-worker');
  } else {
    falarTexto("Bem-vinda Mariana! Vamos cuidar do nosso bairro juntos.");
    navegarPara('screen-home-morador');
  }
}

function irParaHome() {
  if (EstadoApp.perfilAtual === 'trabalhador') {
    navegarPara('screen-home-worker');
  } else if (EstadoApp.perfilAtual === 'morador') {
    navegarPara('screen-home-morador');
  } else {
    navegarPara('screen-splash');
  }
}

/* --------------------------------------------------------------------------
   3. AUTENTICAÇÃO COM E-MAIL (LOGIN & CADASTRO)
   -------------------------------------------------------------------------- */
function alternarAbaAuth(aba) {
  const btnLogin = document.getElementById('tab-auth-login');
  const btnCad = document.getElementById('tab-auth-register');
  const formLogin = document.getElementById('form-auth-login');
  const formCad = document.getElementById('form-auth-register');

  if (aba === 'login') {
    btnLogin.classList.add('active');
    btnCad.classList.remove('active');
    formLogin.style.display = 'flex';
    formCad.style.display = 'none';
    falarTexto("Aba de Login selecionada. Digite seu e-mail e senha cadastrados.");
  } else {
    btnCad.classList.add('active');
    btnLogin.classList.remove('active');
    formLogin.style.display = 'none';
    formCad.style.display = 'flex';
    falarTexto("Aba de Cadastro selecionada. Preencha seu nome, perfil e e-mail.");
  }
}

async function executarLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value.trim();

  if (!email || !senha) {
    alert("Por favor, preencha seu e-mail e sua senha.");
    return;
  }

  try {
    // Tenta autenticar pelo Supabase (com fallback local transparente)
    const usuario = await SupabaseService.login(email, senha);
    logarUsuario(usuario);
  } catch (err) {
    console.warn("Erro no login:", err);
    alert(err.message || "E-mail ou senha incorretos.");
    falarTexto("Não foi possível entrar. Verifique os dados.");
  }
}

async function executarCadastro() {
  const nome = document.getElementById('cad-nome').value.trim();
  const perfil = document.getElementById('cad-tipo-perfil').value;
  const rota = document.getElementById('cad-rota').value.trim() || "Rota Central";
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const senha = document.getElementById('cad-senha').value.trim();

  if (!nome || !email || !senha) {
    alert("Por favor, preencha Nome, E-mail e Senha para continuar.");
    return;
  }

  try {
    const dados = { nome, perfil, rota, email, senha };
    const novoUsuario = await SupabaseService.cadastrar(dados);

    alert(`🎉 Cadastro realizado com sucesso no Supabase!\n\nBem-vindo(a), ${nome}!\nVocê ganhou um bônus de boas-vindas de +50 ELOs!`);
    falarTexto(`Bem-vindo ao ELO, ${nome}! Você ganhou 50 pontos bônus de boas-vindas.`);

    logarUsuario(novoUsuario);
  } catch (err) {
    console.error("Erro no cadastro:", err);
    alert(err.message || "Erro ao realizar cadastro.");
  }
}

function preencherLoginDemo(email, tipo) {
  const usuario = BancoUsuarios[email];
  if (usuario) {
    document.getElementById('login-email').value = usuario.email;
    document.getElementById('login-senha').value = usuario.senha;
    logarUsuario(usuario);
  }
}

function logarUsuario(usuario) {
  EstadoApp.usuarioLogado = usuario;
  EstadoApp.perfilAtual = usuario.perfil;
  EstadoApp.pontosElos = usuario.pontosElos;

  localStorage.setItem('elo_usuario_sessao', JSON.stringify(usuario));
  localStorage.setItem('elo_perfil', usuario.perfil);

  atualizarDadosInterfaceUsuario();

  falarTexto(`Olá ${usuario.nome.split(' ')[0]}! Acesso confirmado. Você tem ${usuario.pontosElos} ELOs acumulados.`);

  if (usuario.perfil === 'trabalhador') {
    navegarPara('screen-home-worker');
  } else {
    navegarPara('screen-home-morador');
  }
}

function executarLogout() {
  localStorage.removeItem('elo_usuario_sessao');
  EstadoApp.usuarioLogado = null;
  alert("Você saiu da sua conta com sucesso!");
  falarTexto("Sessão finalizada. Até logo!");
  navegarPara('screen-splash');
}

function atualizarDadosInterfaceUsuario() {
  const u = EstadoApp.usuarioLogado;
  if (!u) return;

  // Header Trabalhador
  const hNome = document.getElementById('worker-header-nome');
  const hRota = document.getElementById('worker-header-rota');
  if (hNome) hNome.textContent = `Olá, ${u.nome.split(' ')[0]}!`;
  if (hRota) hRota.textContent = `Trabalhador da coleta • ${u.rota} ❯`;

  // Tela de Perfil e Progresso
  const pNome = document.getElementById('perfil-nome');
  const pEmail = document.getElementById('perfil-email');
  const pRota = document.getElementById('perfil-rota');
  const pCheckins = document.getElementById('perfil-checkins');
  const pAlongamentos = document.getElementById('perfil-alongamentos');
  const pAlertas = document.getElementById('perfil-alertas');

  if (pNome) pNome.textContent = u.nome;
  if (pEmail) pEmail.textContent = u.email;
  if (pRota) pRota.textContent = u.rota;
  if (pCheckins) pCheckins.textContent = u.checkins || 0;
  if (pAlongamentos) pAlongamentos.textContent = u.alongamentos || 0;
  if (pAlertas) pAlertas.textContent = u.alertas || 0;

  // Renderizar Vouchers do Usuário
  renderizarVouchersUsuario();

  // Atualizar pontos
  atualizarDisplaysPontos();
}

function renderizarVouchersUsuario() {
  const container = document.getElementById('perfil-vouchers-list');
  if (!container || !EstadoApp.usuarioLogado) return;

  const vouchers = EstadoApp.usuarioLogado.vouchers || [];
  if (vouchers.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 14px; color: var(--text-muted); font-size: 0.8rem;">
        Você ainda não resgatou vouchers. Acumule ELOs e troque por benefícios!
      </div>
    `;
    return;
  }

  container.innerHTML = vouchers.map(v => `
    <div class="voucher-card">
      <div class="voucher-icon">${v.icone || '🎟️'}</div>
      <div class="voucher-info">
        <h5>${v.titulo}</h5>
        <p>${v.local} • Código: <strong>${v.codigo}</strong></p>
      </div>
      <span class="badge-voucher-status ${v.status === 'Agendado' ? 'agendado' : ''}">${v.status}</span>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   4. CHECK-IN DE SAÚDE (BEM-ESTAR DO TRABALHADOR)
   -------------------------------------------------------------------------- */
function selecionarHumor(botao, humor) {
  document.querySelectorAll('.emoji-btn').forEach(btn => btn.classList.remove('selected'));
  botao.classList.add('selected');
  EstadoApp.checkinDoDia.humor = humor;
  falarTexto(`Você selecionou: ${humor}`);
}

function selecionarDor(botao, nivelDor) {
  document.querySelectorAll('.pain-btn').forEach(btn => btn.classList.remove('selected'));
  botao.classList.add('selected');
  EstadoApp.checkinDoDia.dor = nivelDor;
  falarTexto(`Nível de dor corporal: ${nivelDor}`);
}

function concluirCheckin() {
  if (!EstadoApp.checkinDoDia.humor && !EstadoApp.checkinDoDia.dor) {
    alert("Por favor, selecione como você está se sentindo e se sente dores no corpo.");
    falarTexto("Por favor, toque em como você está se sentindo antes de confirmar.");
    return;
  }

  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.checkins = (EstadoApp.usuarioLogado.checkins || 0) + 1;
    SupabaseService.registrarCheckin(
      EstadoApp.usuarioLogado.email,
      EstadoApp.checkinDoDia.humor,
      EstadoApp.checkinDoDia.dor,
      EstadoApp.usuarioLogado.checkins
    );
  }

  somarPontos(10, "fazer o check-in de saúde");
  alert("Check-in concluído com sucesso! Você ganhou +10 ELOs.");
  navegarPara('screen-home-worker');
}

/* --------------------------------------------------------------------------
   5. MEUS ELOS & RECOMPENSAS
   -------------------------------------------------------------------------- */
function somarPontos(quantidade, motivo) {
  EstadoApp.pontosElos += quantidade;
  
  // Salva no perfil do usuário logado
  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.pontosElos = EstadoApp.pontosElos;
    BancoUsuarios[EstadoApp.usuarioLogado.email] = EstadoApp.usuarioLogado;
    salvarBancoUsuarios();
    localStorage.setItem('elo_usuario_sessao', JSON.stringify(EstadoApp.usuarioLogado));
    SupabaseService.atualizarPontos(EstadoApp.usuarioLogado.email, EstadoApp.pontosElos);
  }

  localStorage.setItem('elos_saldo', EstadoApp.pontosElos);
  atualizarDisplaysPontos();
  falarTexto(`Parabéns! Você ganhou ${quantidade} ELOs por ${motivo}. Seu saldo é de ${EstadoApp.pontosElos} pontos.`);
}

function atualizarDisplaysPontos() {
  document.querySelectorAll('.valor-elos').forEach(el => {
    el.textContent = EstadoApp.pontosElos;
  });
}

function resgatarRecompensa(custo, itemNome) {
  if (EstadoApp.pontosElos < custo) {
    const falta = custo - EstadoApp.pontosElos;
    alert(`Você precisa de mais ${falta} ELOs para resgatar: ${itemNome}`);
    falarTexto(`Você ainda não tem pontos suficientes. Faltam ${falta} ELOs.`);
    return;
  }

  EstadoApp.pontosElos -= custo;
  
  // Gera código único de voucher
  const codigoVoucher = "ELO-" + Math.floor(1000 + Math.random() * 9000);
  const novoVoucher = {
    titulo: itemNome,
    local: itemNome.includes("Fisioterapia") || itemNome.includes("psicológico") ? "Clínica São Camilo" : "Parceiro da Rota",
    codigo: codigoVoucher,
    status: itemNome.includes("Fisioterapia") ? "Agendado" : "Pronto para Usar",
    icone: itemNome.includes("Café") ? "☕" : itemNome.includes("Celular") ? "📱" : "🏥"
  };

  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.pontosElos = EstadoApp.pontosElos;
    if (!EstadoApp.usuarioLogado.vouchers) EstadoApp.usuarioLogado.vouchers = [];
    EstadoApp.usuarioLogado.vouchers.unshift(novoVoucher);

    BancoUsuarios[EstadoApp.usuarioLogado.email] = EstadoApp.usuarioLogado;
    salvarBancoUsuarios();
    localStorage.setItem('elo_usuario_sessao', JSON.stringify(EstadoApp.usuarioLogado));
    SupabaseService.salvarVoucher(EstadoApp.usuarioLogado.email, novoVoucher);
  }

  localStorage.setItem('elos_saldo', EstadoApp.pontosElos);
  atualizarDisplaysPontos();
  atualizarDadosInterfaceUsuario();

  alert(`🎉 Recompensa resgatada com sucesso!\n\nVocê resgatou: ${itemNome}\nCódigo do Voucher: ${codigoVoucher}\nSeu novo saldo: ${EstadoApp.pontosElos} ELOs\n\nO voucher já está disponível na tela 'Meu Progresso'!`);
  falarTexto(`Parabéns! Recompensa resgatada: ${itemNome}. Código do voucher gerado com sucesso.`);
}

function iniciarExercicio(nomeExercicio) {
  somarPontos(10, `iniciar o exercício de ${nomeExercicio}`);
  alert(`Iniciando guia em áudio: ${nomeExercicio}.\n\nVocê ganhou +10 ELOs!`);
  falarTexto(`Iniciando: ${nomeExercicio}. Respire fundo, relaxe os ombros e siga os movimentos.`);
}

/* --------------------------------------------------------------------------
   5. FASE 3: DENÚNCIAS & RESÍDUOS PERIGOSOS (MORADORA MARIANA)
   -------------------------------------------------------------------------- */
function obterLocalizacaoGPS() {
  const lbl = document.getElementById('label-endereco');
  lbl.textContent = "Buscando localização via GPS...";
  setTimeout(() => {
    lbl.textContent = "Rua dos Patriotas, 482 - Ipiranga (GPS Preciso)";
    falarTexto("Localização atualizada com sucesso: Rua dos Patriotas, número 482.");
  }, 600);
}

function simularUploadFoto() {
  const placeholder = document.getElementById('photo-preview-placeholder');
  const img = document.getElementById('photo-preview-img');
  
  // Simulação de foto de lixo com vidro
  placeholder.style.display = 'none';
  img.style.display = 'block';
  img.src = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=400&q=80';
  img.style.width = '100%';
  img.style.height = '140px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '8px';

  falarTexto("Foto anexada à ocorrência.");
}

function enviarOcorrencia() {
  const tipoProblemaEl = document.querySelector('input[name="tipo-problema"]:checked');
  const tipoProblema = tipoProblemaEl ? tipoProblemaEl.value : "Lixo acumulado";
  const descricao = document.getElementById('input-descricao-denuncia').value.trim();
  const endereco = document.getElementById('label-endereco')?.textContent || "Rua dos Patriotas, 482 - Ipiranga";

  const protocolo = "ELO-" + Math.floor(100000 + Math.random() * 900000);

  // Envia ocorrência para o Supabase PostgreSQL
  SupabaseService.salvarOcorrencia({
    protocolo: protocolo,
    tipoProblema: tipoProblema,
    endereco: endereco,
    descricao: descricao
  });

  // Adiciona também um novo pino real no Mapa Interativo do Ipiranga
  const ehPerigoso = tipoProblema.includes("Perigoso") || tipoProblema.includes("Vidro");
  const novoPontoMapa = {
    id: protocolo,
    lat: -23.5862 + (Math.random() - 0.5) * 0.004,
    lng: -46.6075 + (Math.random() - 0.5) * 0.004,
    titulo: `${endereco.split('-')[0].trim()}: ${ehPerigoso ? 'Caco de Vidro / Cortante' : tipoProblema}`,
    descricao: descricao || (ehPerigoso ? "Alerta de resíduo perfurocortante emitido para proteger os coletores da Rota 14." : "Ocorrência registrada pelo morador via app ELO."),
    status: ehPerigoso ? "Risco Crítico" : "Em análise",
    cor: ehPerigoso ? "red" : "yellow",
    icone: ehPerigoso ? "⚠️" : "🗑️",
    categoria: "ocorrencia"
  };
  PontosMapaBairro.unshift(novoPontoMapa);
  ultimoPontoSelecionadoMapa = novoPontoMapa;

  let mensagemAlerta = `Ocorrência registrada no Supabase com sucesso!\nProtocolo: ${protocolo}\nProblema: ${tipoProblema}`;
  
  if (ehPerigoso) {
    mensagemAlerta += `\n\n⚠️ ALERTA DE SEGURANÇA EMITIDO: Os coletores do caminhão da rota receberão aviso imediato no mapa GPS sobre perfurocortantes nesta rua!`;
    falarTexto("Alerta crítico emitido! Obrigado por avisar sobre o vidro quebrado. O pino vermelho já está no mapa da equipe.");
  } else {
    falarTexto("Ocorrência enviada e adicionada ao mapa do bairro com sucesso.");
  }

  alert(mensagemAlerta);
  document.getElementById('input-descricao-denuncia').value = '';
  navegarPara('screen-neighborhood');
}

/* --------------------------------------------------------------------------
   6. FASE 3: MEU BAIRRO & MAPA REAL INTERATIVO (LEAFLET + OPENSTREETMAP)
   -------------------------------------------------------------------------- */
let mapaLeaflet = null;
let marcadorCaminhao = null;
let linhaRotaColeta = null;
let camadaMarcadores = null;
let indiceRotaCaminhao = 0;
let timerCaminhaoMapa = null;

// Trajeto real da Rota 14 pelas ruas do Ipiranga (Av. Nazaré -> Rua dos Patriotas -> Rua Silva Bueno -> Rua Bom Pastor)
const CoordenadasRotaIpiranga = [
  { lat: -23.5918, lng: -46.6067, trecho: "Av. Nazaré (Próx. Campus São Camilo)" },
  { lat: -23.5892, lng: -46.6072, trecho: "Av. Nazaré, 1100 • Subindo sentido Museu" },
  { lat: -23.5868, lng: -46.6079, trecho: "Esquina Av. Nazaré c/ Rua dos Patriotas" },
  { lat: -23.5864, lng: -46.6058, trecho: "Rua dos Patriotas, 482 • Coleta em andamento" },
  { lat: -23.5849, lng: -46.6039, trecho: "Cruzamento Rua dos Patriotas c/ Rua Silva Bueno" },
  { lat: -23.5872, lng: -46.6032, trecho: "Rua Silva Bueno, 310 • Atenção a Resíduo Cortante" },
  { lat: -23.5895, lng: -46.6048, trecho: "Rua Bom Pastor • Retorno ao circuito Ipiranga" }
];

// Pontos monitorados reais no Bairro Ipiranga (São Paulo)
const PontosMapaBairro = [
  {
    id: "ELO-849201",
    lat: -23.5872,
    lng: -46.6032,
    titulo: "Rua Silva Bueno, 310 • Caco de Vidro Solto",
    descricao: "Morador alertou garrafa quebrada dentro de saco plástico. Equipe Carlos avisada para usar luva anticorte de kevlar.",
    status: "Risco Crítico",
    cor: "red",
    icone: "⚠️",
    categoria: "ocorrencia"
  },
  {
    id: "ELO-731940",
    lat: -23.5864,
    lng: -46.6058,
    titulo: "Rua dos Patriotas, 482 • Lixo Acumulado",
    descricao: "Sacos acumulados próximos à árvore da calçada. Caminhão Compactador Rota 14 a 4 minutos do local.",
    status: "Em atendimento",
    cor: "yellow",
    icone: "🗑️",
    categoria: "ocorrencia"
  },
  {
    id: "ELO-610422",
    lat: -23.5892,
    lng: -46.6072,
    titulo: "Av. Nazaré, 1020 • Coleta Finalizada",
    descricao: "Via limpa e vidros descartados corretamente em caixa de papelão identificada pela moradora.",
    status: "Resolvida",
    cor: "green",
    icone: "✅",
    categoria: "ocorrencia"
  },
  {
    id: "SPSC-APOIO",
    lat: -23.5918,
    lng: -46.6067,
    titulo: "Centro Universitário São Camilo (Av. Nazaré, 1501)",
    descricao: "Ponto Oficial de Apoio em Saúde e Fisioterapia Ocupacional para os coletores da Rota 14 (Hidratação, Alongamento e Triagem).",
    status: "Apoio Saúde",
    cor: "blue",
    icone: "🏥",
    categoria: "apoio"
  }
];

let ultimoPontoSelecionadoMapa = PontosMapaBairro[0];

function inicializarMapaLeaflet() {
  const container = document.getElementById('elo-leaflet-map');
  if (!container) return;

  // Atualiza contador da aba e lista abaixo do mapa
  renderizarListaPontosMapa();

  // Caso a biblioteca Leaflet não tenha carregado (ex: sem internet), exibe fallback amigável
  if (typeof L === 'undefined') {
    container.innerHTML = `<div style="padding:30px;text-align:center;color:#475569;font-size:0.85rem;">🗺️ Mapa Interativo Ipiranga ativo.<br>Selecione um ponto na lista abaixo para ouvir os detalhes.</div>`;
    return;
  }

  // Se o mapa já foi criado, apenas recalcula o tamanho e sincroniza os pinos
  if (mapaLeaflet) {
    mapaLeaflet.invalidateSize();
    sincronizarMarcadoresMapa();
    return;
  }

  // Inicializa o Mapa Real centrado no Bairro Ipiranga (São Paulo)
  mapaLeaflet = L.map('elo-leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([-23.5880, -46.6056], 15);

  // Camada de Ruas Reais OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(mapaLeaflet);

  // Desenha a Polilinha da Rota 14 (Circuito de Coleta no Ipiranga)
  const latLngsRota = CoordenadasRotaIpiranga.map(p => [p.lat, p.lng]);
  // Fecha o circuito voltando ao ponto inicial
  latLngsRota.push([CoordenadasRotaIpiranga[0].lat, CoordenadasRotaIpiranga[0].lng]);

  linhaRotaColeta = L.polyline(latLngsRota, {
    color: '#059669',
    weight: 5,
    opacity: 0.85,
    dashArray: '10, 8',
    lineJoin: 'round'
  }).addTo(mapaLeaflet);

  // Grupo de marcadores para facilitar atualização
  camadaMarcadores = L.layerGroup().addTo(mapaLeaflet);

  // Cria o marcador animado do Caminhão da Coleta (Equipe Carlos)
  const iconeCaminhao = L.divIcon({
    className: '',
    html: `<div class="elo-custom-pin pin-bg-truck" title="Caminhão Rota 14 - Ao Vivo">🚛</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });

  const posInicial = CoordenadasRotaIpiranga[indiceRotaCaminhao];
  marcadorCaminhao = L.marker([posInicial.lat, posInicial.lng], { icon: iconeCaminhao, zIndexOffset: 1000 })
    .addTo(mapaLeaflet)
    .on('click', () => {
      const passoAtual = CoordenadasRotaIpiranga[indiceRotaCaminhao];
      selecionarPontoNoMapa({
        id: "ROTA-14",
        lat: passoAtual.lat,
        lng: passoAtual.lng,
        titulo: "🚛 Caminhão Compactador • Equipe Carlos (Rota 14)",
        descricao: `Localização atual via GPS: ${passoAtual.trecho}. Equipe com 3 coletores ativos e alerta de vidro sincronizado.`,
        status: "Ao Vivo no GPS",
        cor: "green"
      });
    });

  // Renderiza todos os marcadores de ocorrências e apoio
  sincronizarMarcadoresMapa();

  // Inicia simulação em tempo real do caminhão percorrendo as ruas do Ipiranga
  if (!timerCaminhaoMapa) {
    timerCaminhaoMapa = setInterval(() => {
      indiceRotaCaminhao = (indiceRotaCaminhao + 1) % CoordenadasRotaIpiranga.length;
      const proxPos = CoordenadasRotaIpiranga[indiceRotaCaminhao];
      if (marcadorCaminhao) {
        marcadorCaminhao.setLatLng([proxPos.lat, proxPos.lng]);
      }
      const subEl = document.getElementById('telemetry-truck-sub');
      if (subEl) {
        subEl.textContent = `${proxPos.trecho} • Atualizado agora`;
      }
    }, 3500);
  }
}

function sincronizarMarcadoresMapa(filtro = 'todos') {
  if (!camadaMarcadores || typeof L === 'undefined') return;
  camadaMarcadores.clearLayers();

  PontosMapaBairro.forEach(ponto => {
    if (filtro === 'ocorrencias' && ponto.categoria !== 'ocorrencia') return;

    const classeCor =
      ponto.cor === 'red' ? 'pin-bg-red' :
      ponto.cor === 'yellow' ? 'pin-bg-yellow' :
      ponto.cor === 'blue' ? 'pin-bg-blue' : 'pin-bg-green';

    const iconePin = L.divIcon({
      className: '',
      html: `<div class="elo-custom-pin ${classeCor}">${ponto.icone}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([ponto.lat, ponto.lng], { icon: iconePin });
    marker.on('click', () => {
      selecionarPontoNoMapa(ponto, true);
    });
    marker.addTo(camadaMarcadores);
  });
}

function selecionarPontoNoMapa(ponto, falar = false) {
  ultimoPontoSelecionadoMapa = ponto;

  // Move suavemente a câmera do mapa até o ponto clicado
  if (mapaLeaflet && ponto.lat && ponto.lng) {
    mapaLeaflet.flyTo([ponto.lat, ponto.lng], 16, { duration: 0.6 });
  }

  // Atualiza o Card de Detalhes abaixo do mapa
  const card = document.getElementById('map-selected-card');
  const badge = document.getElementById('map-detail-badge');
  const title = document.getElementById('map-detail-title');
  const desc = document.getElementById('map-detail-desc');

  if (badge) {
    badge.textContent = `${ponto.icone || '📍'} ${ponto.status.toUpperCase()}`;
    if (ponto.cor === 'red') {
      badge.style.background = '#fee2e2';
      badge.style.color = '#991b1b';
      if (card) card.style.borderLeftColor = '#ef4444';
    } else if (ponto.cor === 'yellow') {
      badge.style.background = '#fef3c7';
      badge.style.color = '#92400e';
      if (card) card.style.borderLeftColor = '#f59e0b';
    } else if (ponto.cor === 'blue') {
      badge.style.background = '#dbeafe';
      badge.style.color = '#1e40af';
      if (card) card.style.borderLeftColor = '#2563eb';
    } else {
      badge.style.background = '#dcfce7';
      badge.style.color = '#166534';
      if (card) card.style.borderLeftColor = '#10b981';
    }
  }

  if (title) title.textContent = ponto.titulo;
  if (desc) desc.textContent = ponto.descricao;

  if (falar) {
    falarTexto(`${ponto.titulo}. Status: ${ponto.status}. ${ponto.descricao}`);
  }
}

function ouvirDetalhePinAtual() {
  if (!ultimoPontoSelecionadoMapa) return;
  falarTexto(`${ultimoPontoSelecionadoMapa.titulo}. ${ultimoPontoSelecionadoMapa.descricao}`);
}

function centralizarCaminhaoMapa() {
  const passoAtual = CoordenadasRotaIpiranga[indiceRotaCaminhao];
  selecionarPontoNoMapa({
    id: "ROTA-14",
    lat: passoAtual.lat,
    lng: passoAtual.lng,
    titulo: "🚛 Caminhão Compactador • Equipe Carlos (Rota 14)",
    descricao: `Em trânsito agora: ${passoAtual.trecho}. Previsão de passagem na Rua dos Patriotas às 19:30.`,
    status: "Caminhão em Rota",
    cor: "green",
    icone: "🚛"
  }, true);
}

function focarPontoSaoCamilo() {
  const pontoSC = PontosMapaBairro.find(p => p.id === "SPSC-APOIO") || PontosMapaBairro[PontosMapaBairro.length - 1];
  selecionarPontoNoMapa(pontoSC, true);
}

function renderizarListaPontosMapa() {
  const badgeCount = document.getElementById('map-badge-count');
  const qtdOcorrencias = PontosMapaBairro.filter(p => p.categoria === 'ocorrencia').length;
  if (badgeCount) badgeCount.textContent = qtdOcorrencias;

  const listaEl = document.getElementById('map-occurrences-list');
  if (!listaEl) return;

  listaEl.innerHTML = PontosMapaBairro.map((ponto, idx) => {
    const bgIcone =
      ponto.cor === 'red' ? '#fee2e2' :
      ponto.cor === 'yellow' ? '#fef3c7' :
      ponto.cor === 'blue' ? '#dbeafe' : '#dcfce7';

    const corTextoStatus =
      ponto.cor === 'red' ? '#991b1b' :
      ponto.cor === 'yellow' ? '#92400e' :
      ponto.cor === 'blue' ? '#1e40af' : '#166534';

    return `
      <div class="map-occurrence-item" onclick="selecionarPontoPorIndice(${idx})">
        <div class="map-occ-icon" style="background: ${bgIcone};">${ponto.icone}</div>
        <div class="map-occ-info">
          <h5>${ponto.titulo}</h5>
          <p>${ponto.descricao.substring(0, 72)}...</p>
        </div>
        <span class="map-occ-status" style="background: ${bgIcone}; color: ${corTextoStatus};">${ponto.status}</span>
      </div>
    `;
  }).join('');
}

function selecionarPontoPorIndice(idx) {
  const ponto = PontosMapaBairro[idx];
  if (ponto) {
    selecionarPontoNoMapa(ponto, true);
  }
}

function alternarAbaBairro(aba) {
  const btnRotas = document.getElementById('tab-rotas');
  const btnOcorrencias = document.getElementById('tab-ocorrencias');

  if (aba === 'rotas') {
    if (btnRotas) btnRotas.classList.add('active');
    if (btnOcorrencias) btnOcorrencias.classList.remove('active');
    if (linhaRotaColeta && mapaLeaflet) linhaRotaColeta.setStyle({ opacity: 0.9, weight: 5 });
    sincronizarMarcadoresMapa('todos');
    centralizarCaminhaoMapa();
  } else {
    if (btnOcorrencias) btnOcorrencias.classList.add('active');
    if (btnRotas) btnRotas.classList.remove('active');
    if (linhaRotaColeta && mapaLeaflet) linhaRotaColeta.setStyle({ opacity: 0.35, weight: 3 });
    sincronizarMarcadoresMapa('ocorrencias');
    if (PontosMapaBairro.length > 0) {
      selecionarPontoNoMapa(PontosMapaBairro[0], true);
    }
  }
}

function detalharPin(local, status) {
  selecionarPontoNoMapa({
    titulo: local,
    descricao: `Ponto monitorado pela equipe ELO no bairro Ipiranga.`,
    status: status,
    cor: status.includes('análise') ? 'red' : status.includes('atendimento') ? 'yellow' : 'green',
    icone: '📍'
  }, true);
}

/* --------------------------------------------------------------------------
   7. FASE 3: VALORIZAÇÃO & MURAL DA COMUNIDADE
   -------------------------------------------------------------------------- */
function inserirChip(texto) {
  const textarea = document.getElementById('input-mensagem-morador');
  textarea.value = texto;
}

function enviarMensagemMorador() {
  const textarea = document.getElementById('input-mensagem-morador');
  const texto = textarea.value.trim();

  if (!texto) {
    alert("Por favor, escreva uma mensagem de carinho ou escolha uma das sugestões.");
    return;
  }

  // Cria o novo card de mensagem
  const novaMsg = {
    autor: "🏡 Mariana (Moradora - Rua dos Patriotas)",
    texto: `"${texto}"`,
    apoios: 1,
    hora: "Agora mesmo"
  };

  EstadoApp.mensagensComunidade.unshift(novaMsg);
  localStorage.setItem('elo_mensagens', JSON.stringify(EstadoApp.mensagensComunidade));
  SupabaseService.salvarMensagemMural(novaMsg.autor, novaMsg.texto);
  renderizarMensagens();

  alert("💌 Mensagem enviada com sucesso ao Mural dos Trabalhadores!\nEles poderão ouvir seu recado em voz alta.");
  falarTexto("Sua mensagem de carinho foi enviada ao mural da equipe com sucesso!");

  textarea.value = '';
  navegarPara('screen-community');
}

function renderizarMensagens() {
  const container = document.getElementById('messages-list');
  if (!container) return;

  container.innerHTML = EstadoApp.mensagensComunidade.map(msg => `
    <div class="message-card">
      <div class="message-header">
        <span class="user-badge">${msg.autor}</span>
        <button class="btn-speak-msg" onclick="falarTexto('Mensagem de ${msg.autor}: ${msg.texto.replace(/"/g, '')}')">🔊 Ouvir</button>
      </div>
      <p class="message-body">${msg.texto}</p>
      <div class="message-footer">
        <span>❤️ ${msg.apoios} apoios da comunidade</span>
        <span class="time-stamp">${msg.hora}</span>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   8. CATÁLOGO E PLAYER DE VÍDEOS DE ALONGAMENTO (SAÚDE OCUPACIONAL)
   -------------------------------------------------------------------------- */
const CatalogoVideosAlongamento = {
  costas: {
    titulo: "Alongamento para Costas e Ombros",
    subtitulo: "Fisioterapia São Camilo • Alívio de peso e lombar • 5 min",
    categoria: "Alongamento Ocupacional",
    tempoSegundos: 30,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Fique em pé com a postura ereta e os pés alinhados com o quadril.",
      "Puxe o braço direito na frente do peito usando a mão esquerda.",
      "Segure firme por 20 segundos sem prender a respiração.",
      "Troque o braço e repita o movimento com calma."
    ],
    falaPassos: "Alongamento para costas e ombros. Fique em pé, puxe o braço na frente do peito e segure por 20 segundos respirando fundo."
  },
  pernas: {
    titulo: "Relaxamento de Pernas e Panturrilhas",
    subtitulo: "Prevenção de câimbras e cansaço pós-corrida • 4 min",
    categoria: "Membros Inferiores",
    tempoSegundos: 30,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Apoie as mãos na parede ou na traseira do caminhão.",
      "Dê um passo largo para trás com uma perna, mantendo o calcanhar todo no chão.",
      "Sinta a panturrilha alongar e segure por 25 segundos.",
      "Alterne as pernas devagar."
    ],
    falaPassos: "Relaxamento de pernas. Apoie as mãos na parede, estique uma perna para trás com o calcanhar no chão e segure por 25 segundos."
  },
  postura: {
    titulo: "Postura Correta ao Levantar Peso",
    subtitulo: "Ergonomia prática • Proteja sua coluna vertebral • 3 min",
    categoria: "Ergonomia no Trabalho",
    tempoSegundos: 20,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Aproxime-se ao máximo do saco ou tambor de resíduos.",
      "Dobre os joelhos para agachar, mantendo a coluna sempre reta.",
      "Use a força das coxas para subir, nunca puxe com a lombar curvada.",
      "Segure o peso junto ao corpo."
    ],
    falaPassos: "Postura correta: Dobre sempre os joelhos e nunca curve a coluna. Use a força das pernas para erguer o saco de lixo."
  },
  respiracao: {
    titulo: "Respiração e Descompressão Mental",
    subtitulo: "Psicologia São Camilo • Alívio de estresse e fadiga • 3 min",
    categoria: "Saúde Mental",
    tempoSegundos: 30,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Sente-se ou fique em pé em um local com sombra.",
      "Puxe o ar pelo nariz contando até 4.",
      "Segure o ar nos pulmões por 2 segundos.",
      "Solte o ar pela boca bem devagar contando até 6."
    ],
    falaPassos: "Exercício respiratório: Puxe o ar pelo nariz profundamente, segure dois segundos e solte pela boca bem devagar para relaxar a mente."
  }
};

let exercicioAtualId = 'costas';
let timerInterval = null;
let timerSegundosRestantes = 30;
let timerAtivo = false;

function abrirPlayerVideo(idExercicio) {
  const dados = CatalogoVideosAlongamento[idExercicio];
  if (!dados) return;

  exercicioAtualId = idExercicio;

  // Atualiza elementos do player
  document.getElementById('video-titulo').textContent = dados.titulo;
  document.getElementById('video-subtitulo').textContent = dados.subtitulo;
  document.getElementById('video-categoria-badge').textContent = dados.categoria;
  document.getElementById('player-titulo-header').textContent = dados.titulo;

  // Atualiza vídeo
  const video = document.getElementById('video-element');
  const source = document.getElementById('video-source');
  source.src = dados.videoUrl;
  video.poster = dados.poster;
  video.load();

  // Atualiza instruções
  const ol = document.getElementById('video-instrucoes');
  ol.innerHTML = dados.passos.map(passo => `<li>${passo}</li>`).join('');

  // Reseta Timer
  pararTimer();
  timerSegundosRestantes = dados.tempoSegundos;
  document.getElementById('timer-display').textContent = timerSegundosRestantes;

  navegarPara('screen-video-player');

  // Narração acolhedora inicial
  falarTexto(`Iniciando vídeo: ${dados.titulo}. Siga as instruções do vídeo ou aperte o botão para ouvir os passos.`);
}

function fecharPlayerVideo() {
  const video = document.getElementById('video-element');
  if (video) video.pause();
  pararTimer();
  navegarPara('screen-health');
}

function alternarTimer() {
  const btn = document.getElementById('btn-timer-toggle');
  if (timerAtivo) {
    pararTimer();
  } else {
    iniciarTimer();
  }
}

function iniciarTimer() {
  timerAtivo = true;
  const btn = document.getElementById('btn-timer-toggle');
  btn.textContent = "⏸️ Pausar Cronômetro";
  btn.classList.add('running');

  timerInterval = setInterval(() => {
    timerSegundosRestantes--;
    document.getElementById('timer-display').textContent = timerSegundosRestantes;

    if (timerSegundosRestantes <= 0) {
      pararTimer();
      falarTexto("Tempo concluído! Muito bem! Respire e relaxe o corpo.");
      alert("⏱️ Tempo finalizado! Excelente execução!");
      timerSegundosRestantes = CatalogoVideosAlongamento[exercicioAtualId].tempoSegundos;
      document.getElementById('timer-display').textContent = timerSegundosRestantes;
    }
  }, 1000);
}

function pararTimer() {
  timerAtivo = false;
  if (timerInterval) clearInterval(timerInterval);
  const btn = document.getElementById('btn-timer-toggle');
  if (btn) {
    btn.textContent = "⏱️ Iniciar Cronômetro";
    btn.classList.remove('running');
  }
}

function narrarPassosVideo() {
  const dados = CatalogoVideosAlongamento[exercicioAtualId];
  if (dados) {
    falarTexto(dados.falaPassos);
  }
}

function concluirExercicioVideo() {
  const dados = CatalogoVideosAlongamento[exercicioAtualId];
  const video = document.getElementById('video-element');
  if (video) video.pause();
  pararTimer();

  somarPontos(10, `completar o vídeo de ${dados.titulo}`);
  alert(`🎉 Parabéns pelo cuidado com sua saúde!\n\nVocê concluiu: ${dados.titulo}\nVocê ganhou +10 ELOs!`);
  falarTexto(`Parabéns Carlos! Alongamento concluído. Você conquistou mais 10 ELOs.`);

  navegarPara('screen-health');
}

/* Modal de Novo Vídeo */
function abrirModalNovoVideo() {
  document.getElementById('modal-novo-video').style.display = 'flex';
}

function fecharModalNovoVideo() {
  document.getElementById('modal-novo-video').style.display = 'none';
}

function salvarNovoVideo() {
  const titulo = document.getElementById('novo-video-titulo').value.trim();
  const duracao = document.getElementById('novo-video-duracao').value.trim() || "4 min";
  const passos = document.getElementById('novo-video-passos').value.trim() || "Siga a orientação do fisioterapeuta com postura ereta.";

  if (!titulo) {
    alert("Por favor, digite o título do alongamento.");
    return;
  }

  const novoId = "video_" + Date.now();
  CatalogoVideosAlongamento[novoId] = {
    titulo: titulo,
    subtitulo: `Fisioterapia São Camilo • ${duracao}`,
    categoria: "Alongamento Especializado",
    tempoSegundos: 30,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    passos: [passos, "Mantenha a respiração estável durante todo o exercício.", "Repita duas vezes ao dia."],
    falaPassos: `${titulo}. ${passos}`
  };

  // Cria card visual na lista
  const lista = document.getElementById('lista-videos-alongamento');
  const novoCard = document.createElement('div');
  novoCard.className = 'exercise-card';
  novoCard.onclick = () => abrirPlayerVideo(novoId);
  novoCard.innerHTML = `
    <div class="exercise-thumb">✨</div>
    <div class="exercise-details">
      <h4>${titulo}</h4>
      <p>Novo vídeo adicionado • <strong>${duracao}</strong></p>
      <span class="badge-tag">⭐ +10 ELOs</span>
    </div>
    <button class="btn-play">▶</button>
  `;
  lista.prepend(novoCard);

  fecharModalNovoVideo();
  alert(`✅ Novo vídeo cadastrado com sucesso: "${titulo}"!`);
  falarTexto(`Novo vídeo de alongamento cadastrado: ${titulo}.`);
}

function filtrarVideosSaude(categoria, botao) {
  document.querySelectorAll('.health-content .tab-btn').forEach(b => b.classList.remove('active'));
  botao.classList.add('active');
  falarTexto(`Filtrando lista de exercícios por ${categoria}.`);
}

/* --------------------------------------------------------------------------
   9. FASE 4: PAINEL WEB DA CONCESSIONÁRIA / PREFEITURA (B2B & ESG)
   -------------------------------------------------------------------------- */
function abrirPainelGestor() {
  navegarPara('screen-admin-dashboard');
  sincronizarPainelAdmin();
  falarTexto("Painel executivo da Concessionária e Prefeitura aberto. Dados sincronizados com o Supabase PostgreSQL.");
}

function fecharPainelGestor() {
  irParaHome();
}

async function sincronizarPainelAdmin() {
  // 1. Renderiza usuários do banco (Supabase + Local)
  const containerUsers = document.getElementById('admin-users-container');
  let listaPerfis = Object.values(BancoUsuarios);

  if (typeof supabaseConectado !== 'undefined' && supabaseConectado && supabaseClient) {
    try {
      const { data: perfisNuvem } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('pontos_elos', { ascending: false });

      if (perfisNuvem && perfisNuvem.length > 0) {
        listaPerfis = perfisNuvem.map(p => ({
          nome: p.nome,
          email: p.email,
          perfil: p.perfil,
          rota: p.rota_ou_bairro || 'Ipiranga',
          pontosElos: p.pontos_elos,
          checkins: p.total_checkins || 0
        }));
      }

      // 2. Busca ocorrências reais salvas na nuvem
      const { data: ocorrenciasNuvem } = await supabaseClient
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (ocorrenciasNuvem && ocorrenciasNuvem.length > 0) {
        renderizarTabelaOcorrenciasAdmin(ocorrenciasNuvem);
        const totalCortantes = ocorrenciasNuvem.filter(o => o.is_risco_cortante).length;
        const kpiAlertas = document.getElementById('admin-kpi-alertas');
        if (kpiAlertas) kpiAlertas.textContent = 7 + totalCortantes;
      }
    } catch (err) {
      console.warn("Sincronização admin usando cache local:", err);
    }
  }

  if (containerUsers) {
    containerUsers.innerHTML = listaPerfis.map(u => `
      <div class="admin-user-chip">
        <div>
          <strong>${u.perfil === 'trabalhador' ? '👷🏽‍♂️' : '🏡'} ${u.nome}</strong>
          <span>${u.rota || 'Ipiranga'} • ${u.checkins || 0} check-ins</span>
        </div>
        <span class="admin-user-elos">⭐ ${u.pontosElos} ELOs</span>
      </div>
    `).join('');
  }
}

function renderizarTabelaOcorrenciasAdmin(ocorrencias) {
  const tbody = document.getElementById('admin-ocorrencias-tbody');
  if (!tbody) return;

  const linhasNuvem = ocorrencias.map(oc => {
    const isRisco = oc.is_risco_cortante || (oc.tipo_problema && oc.tipo_problema.includes('Vidro'));
    const badgeTipo = isRisco
      ? `<span class="risk-pill">⚠️ ${oc.tipo_problema}</span>`
      : `🗑️ ${oc.tipo_problema}`;

    const stClass = oc.status === 'Resolvida' ? 'st-ok' : oc.status === 'Em atendimento' ? 'st-atend' : 'st-analise';
    const btnAcao = oc.status === 'Resolvida'
      ? `<span class="done-check">✔ Protegido</span>`
      : `<button class="btn-table-act" onclick="avancarStatusOcorrencia(this, '${oc.protocolo}')">Notificar Frota</button>`;

    return `
      <tr>
        <td><strong>${oc.protocolo}</strong></td>
        <td>${oc.endereco}</td>
        <td>${badgeTipo}</td>
        <td><span class="status-pill ${stClass}">${oc.status || 'Em análise'}</span></td>
        <td>${btnAcao}</td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = linhasNuvem;
}

async function avancarStatusOcorrencia(botao, protocolo) {
  const tr = botao.closest('tr');
  if (!tr) return;

  const statusSpan = tr.querySelector('.status-pill');
  let novoStatus = 'Em atendimento';

  if (statusSpan) {
    if (statusSpan.textContent.trim() === 'Em análise') {
      novoStatus = 'Em atendimento';
      statusSpan.textContent = 'Em atendimento';
      statusSpan.className = 'status-pill st-atend';
      botao.textContent = 'Concluir';
      falarTexto("Frota notificada com sucesso. Caminhão da rota alertado sobre o risco.");
    } else {
      novoStatus = 'Resolvida';
      statusSpan.textContent = 'Resolvida';
      statusSpan.className = 'status-pill st-ok';
      botao.outerHTML = '<span class="done-check">✔ Protegido</span>';
      falarTexto("Ocorrência concluída e arquivada com segurança.");
    }
  }

  // Atualiza no Supabase PostgreSQL se houver protocolo
  if (protocolo && typeof supabaseConectado !== 'undefined' && supabaseConectado && supabaseClient) {
    try {
      await supabaseClient
        .from('ocorrencias')
        .update({ status: novoStatus })
        .eq('protocolo', protocolo);
    } catch (e) {
      console.warn("Aviso ao atualizar status no Supabase:", e);
    }
  }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarDadosInterfaceUsuario();
  atualizarDisplaysPontos();
  renderizarMensagens();
  console.log("Sistema ELO completo (Fases 1 a 4 + Supabase PostgreSQL) inicializado.");
});

