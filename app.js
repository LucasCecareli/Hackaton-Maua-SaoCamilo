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
    matricula: "MAT-1042",
    rota: "Rota 14 - Caminhão COMP-04",
    statusSaude: "apto",
    labelStatusSaude: "Apto / Regular",
    queixaClinica: "Sem queixas álgicas relatadas",
    horarioCheckin: "07:30",
    protocoloAcionado: false,
    pontosElos: 340,
    checkins: 12,
    alongamentos: 8,
    alertas: 4,
    vouchers: [
      { titulo: "Café com Pão na Chapa", local: "Padaria Estrela do Ipiranga", codigo: "ELO-7492", status: "Pronto para Usar", icone: "☕" },
      { titulo: "Sessão de Fisioterapia", local: "Clínica Integrada São Camilo", codigo: "SPSC-1104", status: "Agendado", icone: "🏥" }
    ]
  },
  "roberto.lima@elo.com": {
    nome: "Roberto Nascimento Lima",
    email: "roberto.lima@elo.com",
    senha: "123456",
    perfil: "trabalhador",
    matricula: "MAT-3108",
    rota: "Rota 14 - Caminhão COMP-04",
    statusSaude: "critico",
    labelStatusSaude: "Crítico (EVA 8/10)",
    queixaClinica: "Dor lombar intensa (EVA 8) e exaustão física pós-turno",
    horarioCheckin: "13:40",
    protocoloAcionado: false,
    pontosElos: 290,
    checkins: 15,
    alongamentos: 6,
    alertas: 5,
    vouchers: []
  },
  "marcos.oliveira@elo.com": {
    nome: "Marcos Antônio Oliveira",
    email: "marcos.oliveira@elo.com",
    senha: "123456",
    perfil: "trabalhador",
    matricula: "MAT-2891",
    rota: "Rota 09 - Caminhão COMP-02",
    statusSaude: "atencao",
    labelStatusSaude: "Atenção",
    queixaClinica: "Dores moderadas em ombros e fadiga muscular",
    horarioCheckin: "14:05",
    protocoloAcionado: false,
    pontosElos: 210,
    checkins: 9,
    alongamentos: 4,
    alertas: 2,
    vouchers: []
  },
  "joao.santos@elo.com": {
    nome: "João Batista dos Santos",
    email: "joao.santos@elo.com",
    senha: "123456",
    perfil: "trabalhador",
    matricula: "MAT-4190",
    rota: "Rota 12 - Caminhão COMP-07",
    statusSaude: "apto",
    labelStatusSaude: "Apto / Regular",
    queixaClinica: "Sem queixas clínicas • Check-in regular",
    horarioCheckin: "07:50",
    protocoloAcionado: false,
    pontosElos: 410,
    checkins: 18,
    alongamentos: 11,
    alertas: 6,
    vouchers: []
  },
  "mariana@elo.com": {
    nome: "Mariana Souza",
    email: "mariana@elo.com",
    senha: "123456",
    perfil: "morador",
    rota: "Rua dos Patriotas, 482 - Ipiranga",
    pontosElos: 180,
    checkins: 6,
    alongamentos: 5,
    alertas: 3,
    vouchers: [
      { titulo: "Desconto R$ 15 na Conta de Água", local: "Sabesp • Fatura Residencial", codigo: "SABESP-4829", status: "Pronto para Usar", icone: "💧" },
      { titulo: "Desconto R$ 20 na Conta de Energia", local: "Enel • EcoEnergia Residencial", codigo: "ENEL-9104", status: "Pronto para Usar", icone: "⚡" }
    ]
  },
  "gestao@prefeitura.sp.gov.br": {
    nome: "Gestão Subprefeitura Ipiranga",
    email: "gestao@prefeitura.sp.gov.br",
    senha: "123456",
    tokenGestor: "PREF-IPIRANGA",
    perfil: "prefeitura",
    rota: "Subprefeitura Ipiranga • SST & Limpeza Urbana",
    pontosElos: 0,
    checkins: 0,
    alongamentos: 0,
    alertas: 0,
    vouchers: []
  }
};

// Carrega ou inicializa o banco no LocalStorage
let BancoUsuarios = JSON.parse(localStorage.getItem('elo_banco_usuarios')) || BancoUsuariosPadrao;
// Garante que todos os perfis padrão e campos SESMT existam no banco carregado
Object.keys(BancoUsuariosPadrao).forEach(k => {
  if (!BancoUsuarios[k]) {
    BancoUsuarios[k] = BancoUsuariosPadrao[k];
  } else if (BancoUsuariosPadrao[k].perfil === 'trabalhador') {
    if (!BancoUsuarios[k].matricula) BancoUsuarios[k].matricula = BancoUsuariosPadrao[k].matricula;
    if (!BancoUsuarios[k].statusSaude) BancoUsuarios[k].statusSaude = BancoUsuariosPadrao[k].statusSaude;
    if (!BancoUsuarios[k].labelStatusSaude) BancoUsuarios[k].labelStatusSaude = BancoUsuariosPadrao[k].labelStatusSaude;
    if (!BancoUsuarios[k].queixaClinica) BancoUsuarios[k].queixaClinica = BancoUsuariosPadrao[k].queixaClinica;
    if (!BancoUsuarios[k].horarioCheckin) BancoUsuarios[k].horarioCheckin = BancoUsuariosPadrao[k].horarioCheckin;
  }
});
if (BancoUsuarios["mariana@elo.com"]) {
  BancoUsuarios["mariana@elo.com"].vouchers = BancoUsuariosPadrao["mariana@elo.com"].vouchers;
  if (BancoUsuarios["mariana@elo.com"].pontosElos < 100) BancoUsuarios["mariana@elo.com"].pontosElos = 180;
}

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
   1. ACESSIBILIDADE POR VOZ INTERATIVA (SOM LIGADO 🔊 VERDE | MUDO 🔇 VERMELHO)
   -------------------------------------------------------------------------- */
const suporteVoz = 'speechSynthesis' in window;

const EstadoVoz = {
  somLigado: false,       // Começa naturalmente no MUDO (🔇 Vermelho); o usuário liga se quiser
  estaFalando: false,
  inicioFalaMs: 0,
  estadoVisual: 'stopped', // 'speaking' (verde 🔊) | 'stopped' (vermelho 🔇)
  timerEstimado: null,
  generoPreferido: localStorage.getItem('elo_voz_genero') || 'feminina', // 'feminina' | 'masculina'
  listaVozes: []
};

// Carrega as vozes neurais/nativas disponíveis no navegador
function carregarVozesNavegador() {
  if (!suporteVoz) return;
  const vozes = window.speechSynthesis.getVoices();
  if (vozes && vozes.length > 0) {
    EstadoVoz.listaVozes = vozes;
  }
}

if (suporteVoz) {
  carregarVozesNavegador();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = carregarVozesNavegador;
  }
}

function selecionarMelhorVozPtBr(genero = 'feminina') {
  if (!suporteVoz) return { voz: null, pitch: 1.0, rate: 1.04 };
  const todas = EstadoVoz.listaVozes.length > 0 ? EstadoVoz.listaVozes : window.speechSynthesis.getVoices();
  const vozesPt = todas.filter(v => v.lang && (v.lang.toLowerCase().includes('pt-br') || v.lang.toLowerCase().includes('pt_br') || v.lang.toLowerCase().startsWith('pt')));

  if (vozesPt.length === 0) {
    return { voz: null, pitch: genero === 'masculina' ? 0.85 : 1.06, rate: 1.04 };
  }

  if (genero === 'feminina') {
    // Prioridade para vozes Neurais Naturais Femininas (Francisca Natural, Thalita, Google PT-BR, Luciana, Maria)
    const prioridadesFem = ['francisca', 'thalita', 'natural', 'google português', 'google portugues', 'luciana', 'fernanda', 'vitoria', 'vitória', 'maria'];
    for (const termo of prioridadesFem) {
      const encontrada = vozesPt.find(v => v.name.toLowerCase().includes(termo) && !v.name.toLowerCase().includes('antonio') && !v.name.toLowerCase().includes('daniel'));
      if (encontrada) {
        return { voz: encontrada, pitch: 1.04, rate: 1.04 };
      }
    }
    return { voz: vozesPt[0], pitch: 1.06, rate: 1.04 };
  } else {
    // Prioridade para vozes Neurais Naturais Masculinas (Antonio Natural, Donato, Fabio, Daniel, Felipe)
    const prioridadesMasc = ['antonio', 'antônio', 'donato', 'fabio', 'fábio', 'daniel', 'felipe', 'ricardo', 'luca'];
    for (const termo of prioridadesMasc) {
      const encontrada = vozesPt.find(v => v.name.toLowerCase().includes(termo));
      if (encontrada) {
        return { voz: encontrada, pitch: 0.96, rate: 1.03 };
      }
    }
    // Se o navegador só tiver uma voz PT-BR genérica (ex: Google português do Brasil), ajusta o timbre (pitch) para masculino natural
    return { voz: vozesPt[0], pitch: 0.82, rate: 1.01 };
  }
}

function atualizarBotaoGeneroVoz() {
  const btn = document.getElementById('btn-voice-gender');
  if (!btn) return;
  if (EstadoVoz.generoPreferido === 'masculina') {
    btn.innerHTML = '👨🏽 Voz M';
    btn.title = 'Voz Masculina ativa (Toque para mudar para Feminina)';
  } else {
    btn.innerHTML = '👩🏻 Voz F';
    btn.title = 'Voz Feminina Natural ativa (Toque para mudar para Masculina)';
  }
}

function alternarGeneroVoz() {
  EstadoVoz.generoPreferido = EstadoVoz.generoPreferido === 'feminina' ? 'masculina' : 'feminina';
  localStorage.setItem('elo_voz_genero', EstadoVoz.generoPreferido);
  atualizarBotaoGeneroVoz();

  // Se o som estiver ligado, anuncia a nova voz escolhida imediatamente
  if (EstadoVoz.somLigado) {
    const msg = EstadoVoz.generoPreferido === 'feminina'
      ? 'Voz feminina natural selecionada.'
      : 'Voz masculina selecionada.';
    falarTexto(msg);
  }
}

function atualizarVisualBotoesVoz(estado) {
  const ativo = (estado === 'speaking') || (estado === undefined && EstadoVoz.somLigado);
  EstadoVoz.estadoVisual = ativo ? 'speaking' : 'stopped';

  // 1. Atualiza botões principais de topo (#btn-global-voice e #btn-admin-voice) — APENAS ÍCONE
  const botoesToggle = document.querySelectorAll('.btn-voice-toggle');
  botoesToggle.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    const icone = btn.querySelector('.voice-icon');
    const texto = btn.querySelector('.voice-text');
    if (texto) texto.textContent = '';

    if (ativo) {
      btn.classList.add('voice-speaking');
      if (icone) icone.textContent = '🔊';
      else btn.textContent = '🔊';
      btn.title = 'Som ativado (Toque para silenciar)';
    } else {
      btn.classList.add('voice-stopped');
      if (icone) icone.textContent = '🔇';
      else btn.textContent = '🔇';
      btn.title = 'Som desativado (Toque para ativar áudio)';
    }
  });

  // 2. Atualiza botões circulares (.btn-voice-inline) em todas as telas — APENAS ÍCONE
  const botoesInline = document.querySelectorAll('.btn-voice-inline');
  botoesInline.forEach(btn => {
    btn.classList.remove('voice-speaking', 'voice-stopped');
    if (ativo) {
      btn.classList.add('voice-speaking');
      btn.textContent = '🔊';
      btn.title = 'Som ativado (Toque para silenciar)';
    } else {
      btn.classList.add('voice-stopped');
      btn.textContent = '🔇';
      btn.title = 'Som desativado (Toque para ativar áudio)';
    }
  });
}

function pararFalaUsuario() {
  if (EstadoVoz.timerEstimado) {
    clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.timerEstimado = null;
  }
  EstadoVoz.estaFalando = false;
  EstadoVoz.somLigado = false;
  if (suporteVoz) {
    window.speechSynthesis.cancel();
  }
  atualizarVisualBotoesVoz('stopped');
}

function alternarSomGlobal() {
  if (EstadoVoz.somLigado) {
    // Usuário clicou no botão de som para DESLIGAR (Mudo 🔇)
    pararFalaUsuario();
  } else {
    // Usuário clicou no botão de som para LIGAR (Ativo 🔊)
    EstadoVoz.somLigado = true;
    atualizarVisualBotoesVoz('speaking');
    lerTelaAtual(true);
  }
}

function falarTexto(texto, forcarAtivacao = false) {
  // No Painel da Prefeitura (ou aba Prefeitura), o áudio fica totalmente desativado
  const abaPrefAtiva = EstadoApp.telaAtual === 'screen-auth' && document.getElementById('tab-auth-prefeitura')?.classList.contains('active');
  if (EstadoApp.telaAtual === 'screen-admin-dashboard' || abaPrefAtiva) {
    return;
  }

  if (forcarAtivacao) {
    EstadoVoz.somLigado = true;
  }

  // Se o som estiver no mudo (padrão inicial), não fala a menos que o usuário tenha ligado o som
  if (!EstadoVoz.somLigado) {
    atualizarVisualBotoesVoz('stopped');
    return;
  }

  // Se já estava falando um tópico e o usuário clicou em OUTRO tópico,
  // NÃO desliga o microfone/som! Apenas cancela a frase anterior e lê o novo tópico.
  if (EstadoVoz.timerEstimado) {
    clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.timerEstimado = null;
  }

  EstadoVoz.estaFalando = true;
  EstadoVoz.inicioFalaMs = Date.now();
  atualizarVisualBotoesVoz('speaking');

  // Tempo estimado de leitura
  const duracaoEstimadaMs = Math.max(3000, Math.min(14000, texto.length * 65));
  EstadoVoz.timerEstimado = setTimeout(() => {
    EstadoVoz.estaFalando = false;
  }, duracaoEstimadaMs);

  if (!suporteVoz) {
    console.warn("Navegador sem suporte a síntese de voz.");
    return;
  }

  window.speechSynthesis.cancel(); // Interrompe tópico anterior para falar o novo imediatamente
  const locucao = new SpeechSynthesisUtterance(texto);
  locucao.lang = 'pt-BR';

  // Seleciona a voz Neural Natural (Feminina ou Masculina) com ajuste de timbre e fluidez
  const configVoz = selecionarMelhorVozPtBr(EstadoVoz.generoPreferido);
  if (configVoz.voz) {
    locucao.voice = configVoz.voz;
  }
  locucao.rate = configVoz.rate;
  locucao.pitch = configVoz.pitch;

  locucao.onend = () => {
    if (EstadoVoz.estaFalando && (Date.now() - EstadoVoz.inicioFalaMs > 800)) {
      EstadoVoz.estaFalando = false;
      if (EstadoVoz.timerEstimado) clearTimeout(EstadoVoz.timerEstimado);
    }
  };

  window.speechSynthesis.speak(locucao);
}

function lerTelaAtual(forcarAtivacao = false) {
  if (forcarAtivacao) EstadoVoz.somLigado = true;
  const tela = EstadoApp.telaAtual;
  if (tela === 'screen-splash') {
    falarTexto("Aplicativo ELO: Juntos por uma cidade melhor. Conectando quem cuida da cidade. Saúde, cuidado e reconhecimento para quem faz a diferença todos os dias. Toque no botão Começar.");
  } else if (tela === 'screen-auth') {
    falarTexto("Tela de acesso ao ELO. Entre com seu e-mail ou use os botões de acesso rápido abaixo para demonstração.");
  } else if (tela === 'screen-roles') {
    falarTexto("Escolha o seu perfil: Sou Morador, Sou Trabalhador da coleta ou Painel Web da Concessionária e Prefeitura.");
  } else if (tela === 'screen-home-worker') {
    falarTexto(`Olá Carlos! Você tem ${EstadoApp.pontosElos} ELOs. Escolha uma das opções: Meu Bem-Estar, Minha Saúde, Avaliar Rua, Meus ELOs, Mapa da Rota 14 ou Minha Comunidade.`);
  } else if (tela === 'screen-worker-profile') {
    falarTexto(`Perfil de Carlos Silva. Você possui ${EstadoApp.pontosElos} ELOs acumulados e dois vouchers prontos para uso na padaria e na clínica São Camilo.`);
  } else if (tela === 'screen-wellbeing') {
    falarTexto("Tela de Meu Bem-Estar. Conte como você está se sentindo e se sente dores no corpo depois do trabalho.");
  } else if (tela === 'screen-health') {
    falarTexto("Minha Saúde: Vídeos e exercícios rápidos de alongamento para coluna, ombros e pernas.");
  } else if (tela === 'screen-video-player') {
    narrarPassosVideo();
  } else if (tela === 'screen-rewards') {
    falarTexto(`Seus ELOs: Você possui ${EstadoApp.pontosElos} pontos. Troque por benefícios e descontos.`);
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
  } else if (tela === 'screen-evaluate-waste') {
    falarTexto("Avaliar Descarte da Rua. Escolha se o lixo deste endereço estava seguro e bem embalado. Sua aprovação gera pontos para o morador ter desconto na conta de água e luz.");
  }
}

/* --------------------------------------------------------------------------
   2. ROTEAMENTO SPA (TROCA DE TELAS)
   -------------------------------------------------------------------------- */
function navegarPara(idTelaDestino) {
  // Ao trocar de tela, encerra a locução anterior mas mantém a preferência de som (ligado ou mudo)
  if (EstadoVoz.estaFalando) {
    if (EstadoVoz.timerEstimado) clearTimeout(EstadoVoz.timerEstimado);
    EstadoVoz.estaFalando = false;
    if (suporteVoz) window.speechSynthesis.cancel();
  }
  atualizarVisualBotoesVoz(EstadoVoz.somLigado ? 'speaking' : 'stopped');

  const todasTelas = document.querySelectorAll('.screen');
  todasTelas.forEach(tela => tela.classList.remove('active'));

  const frame = document.querySelector('.mobile-frame');
  const headerActions = document.querySelector('#main-header .header-actions');
  if (frame) {
    if (idTelaDestino === 'screen-admin-dashboard') {
      frame.classList.add('desktop-mode');
      pararFalaUsuario();
      if (headerActions) headerActions.style.display = 'none';
    } else {
      frame.classList.remove('desktop-mode');
      const abaPrefAtiva = idTelaDestino === 'screen-auth' && document.getElementById('tab-auth-prefeitura')?.classList.contains('active');
      if (headerActions) headerActions.style.display = abaPrefAtiva ? 'none' : 'flex';
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
  const btnHeaderAdmin = document.getElementById('btn-header-admin');

  if (idTela === 'screen-home-morador' || idTela === 'screen-reports' || idTela === 'screen-appreciate') {
    EstadoApp.perfilAtual = 'morador';
  } else if (idTela === 'screen-home-worker' || idTela === 'screen-wellbeing' || idTela === 'screen-health') {
    EstadoApp.perfilAtual = 'trabalhador';
  }

  // Oculta o botão "Gestão Web" na visão de Morador
  if (btnHeaderAdmin) {
    if (EstadoApp.perfilAtual === 'morador') {
      btnHeaderAdmin.style.display = 'none';
    } else {
      btnHeaderAdmin.style.display = 'inline-flex';
    }
  }

  // Alterna visão da tela de ELOs (Trabalhador vs Morador)
  const rewardsTrab = document.getElementById('rewards-view-trabalhador');
  const rewardsMorador = document.getElementById('rewards-view-morador');
  const rewardsSub = document.getElementById('rewards-subtitle-text');

  if (EstadoApp.perfilAtual === 'morador') {
    if (navTrab) navTrab.style.display = 'none';
    if (navMorador) navMorador.style.display = 'flex';
    if (rewardsTrab) rewardsTrab.style.display = 'none';
    if (rewardsMorador) rewardsMorador.style.display = 'block';
    if (rewardsSub) rewardsSub.textContent = 'Ganhe ELOs aprendendo, valorizando os garis e protegendo sua rua!';
  } else {
    if (navTrab) navTrab.style.display = 'flex';
    if (navMorador) navMorador.style.display = 'none';
    if (rewardsTrab) rewardsTrab.style.display = 'block';
    if (rewardsMorador) rewardsMorador.style.display = 'none';
    if (rewardsSub) rewardsSub.textContent = 'Continue cuidando da sua saúde para conquistar mais benefícios!';
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

  // Marca aba ativa do Morador (Exatamente 3 abas: Início, ELOs e Mural)
  if (
    idTela === 'screen-home-morador' ||
    idTela === 'screen-neighborhood' ||
    idTela === 'screen-reports' ||
    idTela === 'screen-learn' ||
    idTela === 'screen-appreciate' ||
    idTela === 'screen-worker-profile'
  ) {
    document.getElementById('nav-inicio-morador')?.classList.add('active');
  } else if (idTela === 'screen-rewards') {
    document.getElementById('nav-elos-morador')?.classList.add('active');
  } else if (idTela === 'screen-community') {
    document.getElementById('nav-mural-morador')?.classList.add('active');
  }
}

function alternarDetalheAprendizado(cardEl, textoFala) {
  if (cardEl) {
    cardEl.classList.toggle('expanded');
    // Recompensa o morador/usuário com +10 ELOs na primeira vez que estuda cada guia
    if (!cardEl.dataset.aprendido) {
      cardEl.dataset.aprendido = 'true';
      if (EstadoApp.usuarioLogado) {
        EstadoApp.usuarioLogado.checkins = (EstadoApp.usuarioLogado.checkins || 0) + 1;
      }
      somarPontos(10, "estudar o guia de prevenção e descarte correto", true);
    }
  }
  if (textoFala) {
    falarTexto(textoFala);
  }
}

function registrarAvaliacaoEndereco(statusAvaliacao) {
  const selectEl = document.getElementById('eval-endereco-select');
  const valorBruto = selectEl ? selectEl.value : "Rua dos Patriotas, 482 - Ipiranga|mariana@elo.com|Mariana Souza";
  const [endereco, emailMorador, nomeMorador] = valorBruto.split('|');
  const histList = document.getElementById('eval-history-list');

  if (statusAvaliacao === 'aprovado') {
    // 1. Credita +50 ELOs para o morador daquele endereço (para abater na conta de Água/Luz/IPTU)
    if (emailMorador && BancoUsuarios[emailMorador]) {
      BancoUsuarios[emailMorador].pontosElos = (BancoUsuarios[emailMorador].pontosElos || 180) + 50;
      salvarBancoUsuarios();
      SupabaseService.atualizarPontos(emailMorador, BancoUsuarios[emailMorador].pontosElos);
    }

    // 2. Credita +15 ELOs para o Gari avaliador
    somarPontos(15, `validar o descarte seguro em ${endereco}`, true);

    if (histList) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 10px; background:#f0fdf4; border-radius:8px; border-left:4px solid #22c55e;';
      item.innerHTML = `<strong>🟢 ${endereco.split('-')[0].trim()}</strong> (${nomeMorador}) — Descarte Seguro • <em>+50 ELOs p/ conta de Água/Luz do morador!</em>`;
      histList.prepend(item);
    }

    alert(`✅ Descarte Seguro Validado!\n\n📍 Endereço: ${endereco}\n🏡 Morador(a): ${nomeMorador} recebeu +50 ELOs (para desconto na conta de Água/Luz/IPTU)!\n👷🏽‍♂️ Você recebeu +15 ELOs pela avaliação na rota!`);
    falarTexto(`Descarte seguro confirmado em ${endereco}. O morador ganhou 50 ELOs para desconto na conta de água e luz, e você ganhou 15 ELOs!`);
  } else if (statusAvaliacao === 'atencao') {
    somarPontos(10, `registrar orientação educativa em ${endereco}`, true);

    if (histList) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 10px; background:#fefce8; border-radius:8px; border-left:4px solid #eab308;';
      item.innerHTML = `<strong>🟡 ${endereco.split('-')[0].trim()}</strong> — Lixo misturado • <em>Dica educativa enviada ao endereço</em>`;
      histList.prepend(item);
    }

    alert(`🟡 Orientação enviada ao endereço!\n\n📍 ${endereco}\nO morador receberá um aviso educativo sobre como separar e reforçar os sacos.\n👷🏽‍♂️ Você recebeu +10 ELOs!`);
    falarTexto(`Orientação educativa enviada para ${endereco}. Você ganhou 10 ELOs.`);
  } else if (statusAvaliacao === 'perigo') {
    somarPontos(15, `alertar risco de corte em ${endereco}`, true);

    if (histList) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 10px; background:#fef2f2; border-radius:8px; border-left:4px solid #ef4444;';
      item.innerHTML = `<strong>🔴 ${endereco.split('-')[0].trim()}</strong> — Vidro solto / Risco de corte • <em>Bônus bloqueado e alerta no mapa</em>`;
      histList.prepend(item);
    }

    alert(`🔴 Alerta de Risco Registrado!\n\n📍 ${endereco}\nO bônus de desconto deste endereço foi bloqueado hoje e um alerta de cuidado com vidro foi fixado no mapa da equipe.\n👷🏽‍♂️ Você recebeu +15 ELOs!`);
    falarTexto(`Alerta de vidro solto registrado em ${endereco}. Equipe avisada e você ganhou 15 ELOs.`);
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
  const btnPref = document.getElementById('tab-auth-prefeitura');
  const formLogin = document.getElementById('form-auth-login');
  const formCad = document.getElementById('form-auth-register');
  const formPref = document.getElementById('form-auth-prefeitura');

  if (btnLogin) btnLogin.classList.remove('active');
  if (btnCad) btnCad.classList.remove('active');
  if (btnPref) btnPref.classList.remove('active');
  if (formLogin) formLogin.style.display = 'none';
  if (formCad) formCad.style.display = 'none';
  if (formPref) formPref.style.display = 'none';

  const headerActions = document.querySelector('#main-header .header-actions');

  if (aba === 'login') {
    if (btnLogin) btnLogin.classList.add('active');
    if (formLogin) formLogin.style.display = 'flex';
    if (headerActions) headerActions.style.display = 'flex';
    falarTexto("Aba de Login selecionada. Digite seu e-mail e senha cadastrados.");
  } else if (aba === 'prefeitura') {
    if (btnPref) btnPref.classList.add('active');
    if (formPref) formPref.style.display = 'flex';
    pararFalaUsuario();
    if (headerActions) headerActions.style.display = 'none';
  } else {
    if (btnCad) btnCad.classList.add('active');
    if (formCad) formCad.style.display = 'flex';
    if (headerActions) headerActions.style.display = 'flex';
    falarTexto("Aba de Cadastro selecionada. Preencha seu nome, CPF, perfil e e-mail.");
  }
}

async function executarLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value.trim();

  if (!email || !senha) {
    alert("Por favor, preencha seu e-mail e sua senha.");
    return;
  }

  // Se tentar usar e-mail da Prefeitura na aba comum, redireciona para a aba restrita que exige o Token Institucional
  if (email.includes('prefeitura') || (BancoUsuarios[email] && BancoUsuarios[email].perfil === 'prefeitura')) {
    alternarAbaAuth('prefeitura');
    const prefEmailEl = document.getElementById('pref-email');
    const prefSenhaEl = document.getElementById('pref-senha');
    if (prefEmailEl) prefEmailEl.value = email;
    if (prefSenhaEl) prefSenhaEl.value = senha;
    alert("🏛️ Conta Institucional Detectada!\n\nPor segurança, informe também o Código/Token da Subprefeitura (PREF-IPIRANGA) para abrir o Painel Executivo.");
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

function executarLoginPrefeitura() {
  const email = document.getElementById('pref-email')?.value.trim().toLowerCase() || '';
  const senha = document.getElementById('pref-senha')?.value.trim() || '';
  const token = document.getElementById('pref-token')?.value.trim().toUpperCase() || '';

  if (!email || !senha || !token) {
    alert("🔒 Acesso Restrito!\n\nPor favor, preencha o E-mail Corporativo (@prefeitura.sp.gov.br), a Senha e o Token Institucional da Subprefeitura.");
    return;
  }

  const gestor = BancoUsuarios["gestao@prefeitura.sp.gov.br"];
  const emailValido = email === "gestao@prefeitura.sp.gov.br" || email.endsWith("@prefeitura.sp.gov.br");
  const senhaValida = senha === (gestor?.senha || "123456");
  const tokenValido = token === "PREF-IPIRANGA" || token === "ELO-PREF";

  if (!emailValido || !senhaValida || !tokenValido) {
    alert("❌ Credencial Institucional Inválida!\n\nApenas gestores autorizados da Prefeitura com Token válido (PREF-IPIRANGA) têm permissão para visualizar o Painel de Gestão.");
    return;
  }

  const usuarioPref = {
    ...(gestor || BancoUsuariosPadrao["gestao@prefeitura.sp.gov.br"]),
    email: email,
    tokenGestor: token,
    perfil: "prefeitura"
  };

  logarUsuario(usuarioPref);
}

let fotoCadastroTemp = null;
let comprovanteCadastroTemp = null;

function formatarMascaraCPF(inputEl) {
  if (!inputEl) return;
  let v = inputEl.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  inputEl.value = v;
}

function atualizarCamposCadastroPorPerfil() {
  const selectPerfil = document.getElementById('cad-tipo-perfil');
  const lblRotaEnd = document.getElementById('lbl-cad-rota-endereco');
  const inputRotaEnd = document.getElementById('cad-rota');
  const grupoComprovante = document.getElementById('grupo-cad-comprovante');

  const perfil = selectPerfil ? selectPerfil.value : 'trabalhador';

  if (perfil === 'morador') {
    if (lblRotaEnd) lblRotaEnd.textContent = 'Endereço Residencial Completo (Rua, Número e Bairro): *';
    if (inputRotaEnd) inputRotaEnd.placeholder = 'Ex: Rua dos Patriotas, 482 - Ipiranga';
    if (grupoComprovante) grupoComprovante.style.display = 'flex';
  } else {
    if (lblRotaEnd) lblRotaEnd.textContent = 'Rota de Coleta:';
    if (inputRotaEnd) inputRotaEnd.placeholder = 'Ex: Rota 14 - Ipiranga';
    if (grupoComprovante) grupoComprovante.style.display = 'none';
  }
}

function selecionarComprovanteCadastro(inputEl) {
  if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;
  const arquivo = inputEl.files[0];
  comprovanteCadastroTemp = {
    nomeArquivo: arquivo.name,
    tipo: arquivo.type || 'documento',
    dataEnvio: new Date().toLocaleDateString('pt-BR')
  };

  const statusEl = document.getElementById('status-comprovante-cad');
  if (statusEl) {
    statusEl.style.color = '#15803d';
    statusEl.textContent = `✅ Documento anexado: ${arquivo.name}`;
  }
  falarTexto(`Comprovante de endereço ${arquivo.name} anexado com sucesso.`);
}

function converterImagemParaDataUrl(arquivo) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const tam = 220;
        canvas.width = tam;
        canvas.height = tam;
        const ctx = canvas.getContext('2d');
        const menorLado = Math.min(img.width, img.height);
        const sx = (img.width - menorLado) / 2;
        const sy = (img.height - menorLado) / 2;
        ctx.drawImage(img, sx, sy, menorLado, menorLado, 0, 0, tam, tam);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(ev.target.result);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(arquivo);
  });
}

async function selecionarFotoCadastro(inputEl) {
  if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;
  const dataUrl = await converterImagemParaDataUrl(inputEl.files[0]);
  fotoCadastroTemp = dataUrl;
  const preview = document.getElementById('cad-avatar-preview');
  if (preview) {
    preview.innerHTML = `<img src="${dataUrl}" class="avatar-user-img" alt="Foto de Perfil">`;
  }
  falarTexto("Foto de perfil selecionada para o cadastro.");
}

async function atualizarFotoPerfilUsuario(inputEl) {
  if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;
  const dataUrl = await converterImagemParaDataUrl(inputEl.files[0]);

  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.fotoPerfil = dataUrl;
    if (BancoUsuarios[EstadoApp.usuarioLogado.email]) {
      BancoUsuarios[EstadoApp.usuarioLogado.email].fotoPerfil = dataUrl;
      salvarBancoUsuarios();
    }
    localStorage.setItem('elo_usuario_sessao', JSON.stringify(EstadoApp.usuarioLogado));
  }

  atualizarDadosInterfaceUsuario();
  alert("📸 Sua foto de perfil foi atualizada com sucesso!");
  falarTexto("Foto de perfil atualizada com sucesso.");
}

async function executarCadastro() {
  const nome = document.getElementById('cad-nome').value.trim();
  const cpf = document.getElementById('cad-cpf')?.value.trim() || '';
  const perfil = document.getElementById('cad-tipo-perfil').value;
  const rotaOuEndereco = document.getElementById('cad-rota').value.trim();
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const senha = document.getElementById('cad-senha').value.trim();

  if (!nome || !cpf || !email || !senha) {
    alert("Por favor, preencha Nome Completo, CPF, E-mail e Senha para continuar.");
    return;
  }

  if (perfil === 'morador') {
    if (!rotaOuEndereco) {
      alert("Por favor, informe o seu Endereço Residencial Completo (Rua, Número e Bairro).");
      return;
    }
    if (!comprovanteCadastroTemp) {
      alert("⚠️ Comprovante de Endereço Obrigatório!\n\nPara se cadastrar como Morador(a) e receber descontos na conta de Água e Luz, anexe uma foto ou PDF de um comprovante de residência (ex: conta de água ou luz).");
      falarTexto("Por favor, anexe uma foto ou documento da sua conta de água ou luz para comprovar seu endereço.");
      return;
    }
  }

  const rota = rotaOuEndereco || "Rota 14 - Ipiranga";

  try {
    const dados = { nome, cpf, perfil, rota, email, senha };
    const novoUsuario = await SupabaseService.cadastrar(dados);
    novoUsuario.cpf = cpf;

    // Se for Trabalhador (Gari), gera matrícula funcional (ex: MAT-4829) e registra na tabela SESMT em tempo real
    if (perfil === 'trabalhador') {
      const matriculaGerada = "MAT-" + Math.floor(1000 + Math.random() * 9000);
      const agora = new Date();
      const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      novoUsuario.matricula = matriculaGerada;
      novoUsuario.statusSaude = 'apto';
      novoUsuario.labelStatusSaude = 'Aguardando 1º Check-in';
      novoUsuario.queixaClinica = 'Cadastro recém-efetuado • Apto / Regular';
      novoUsuario.horarioCheckin = horaFormatada;
      novoUsuario.protocoloAcionado = false;
    }

    if (comprovanteCadastroTemp) {
      novoUsuario.comprovanteEndereco = comprovanteCadastroTemp.nomeArquivo;
    }
    if (fotoCadastroTemp) {
      novoUsuario.fotoPerfil = fotoCadastroTemp;
    }
    if (BancoUsuarios[email]) {
      BancoUsuarios[email] = { ...BancoUsuarios[email], ...novoUsuario };
      salvarBancoUsuarios();
    } else {
      BancoUsuarios[email] = novoUsuario;
      salvarBancoUsuarios();
    }
    fotoCadastroTemp = null;
    comprovanteCadastroTemp = null;

    if (typeof renderizarTabelaSesmtGari === 'function') {
      renderizarTabelaSesmtGari();
    }

    // Se for morador, adiciona também o endereço na lista do GPS do Gari para avaliação
    if (perfil === 'morador') {
      const selectEnd = document.getElementById('eval-endereco-select');
      if (selectEnd) {
        const opt = document.createElement('option');
        opt.value = `${rota}|${email}|${nome}`;
        opt.textContent = `${rota} (Residência: ${nome})`;
        selectEnd.prepend(opt);
      }
    }

    alert(`🎉 Cadastro realizado com sucesso!\n\nBem-vindo(a), ${nome} (CPF: ${cpf})!\n${perfil === 'morador' ? '📍 Endereço e Comprovante (Conta de Água/Luz) validados!\n' : ''}Você ganhou um bônus de boas-vindas de +50 ELOs!`);
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
    logarUsuario(usuario);
  }
}

function logarUsuario(usuario) {
  EstadoApp.usuarioLogado = usuario;
  EstadoApp.perfilAtual = usuario.perfil;
  EstadoApp.pontosElos = usuario.pontosElos || 0;

  localStorage.setItem('elo_usuario_sessao', JSON.stringify(usuario));
  localStorage.setItem('elo_perfil', usuario.perfil);

  atualizarDadosInterfaceUsuario();

  if (usuario.perfil === 'prefeitura') {
    const sub = document.getElementById('admin-auth-subtitle');
    if (sub) {
      sub.textContent = `🔒 Acesso Autenticado: ${usuario.nome} (${usuario.email} • Token: ${usuario.tokenGestor || 'PREF-IPIRANGA'})`;
    }
    navegarPara('screen-admin-dashboard');
    sincronizarPainelAdmin();
  } else if (usuario.perfil === 'trabalhador') {
    falarTexto(`Olá ${usuario.nome.split(' ')[0]}! Acesso confirmado. Você tem ${usuario.pontosElos} ELOs acumulados.`);
    navegarPara('screen-home-worker');
  } else {
    falarTexto(`Olá ${usuario.nome.split(' ')[0]}! Acesso confirmado. Você tem ${usuario.pontosElos} ELOs acumulados.`);
    navegarPara('screen-home-morador');
  }
}

function executarLogout() {
  const eraPrefeitura = EstadoApp.telaAtual === 'screen-admin-dashboard' || EstadoApp.perfilAtual === 'prefeitura';
  localStorage.removeItem('elo_usuario_sessao');
  EstadoApp.usuarioLogado = null;
  EstadoApp.perfilAtual = null;
  ['login-email', 'login-senha', 'pref-email', 'pref-senha', 'pref-token'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  alert("Você saiu da sua conta com sucesso!");
  if (!eraPrefeitura) {
    falarTexto("Sessão finalizada. Até logo!");
  }
  navegarPara('screen-splash');
}

function renderizarAvatarElemento(el, fotoUrl) {
  if (!el) return;
  if (fotoUrl) {
    el.innerHTML = `<img src="${fotoUrl}" class="avatar-user-img" alt="Foto de Perfil">`;
  } else {
    el.textContent = '📷';
  }
}

function atualizarDadosInterfaceUsuario() {
  const u = EstadoApp.usuarioLogado;
  if (!u) return;

  const primeiroNome = u.nome.split(' ')[0];

  // Header Trabalhador
  const hNome = document.getElementById('worker-header-nome');
  const hRota = document.getElementById('worker-header-rota');
  const hAvatar = document.getElementById('worker-avatar-box');
  if (hNome && u.perfil === 'trabalhador') hNome.textContent = `Olá, ${primeiroNome}!`;
  if (hRota && u.perfil === 'trabalhador') hRota.textContent = `Trabalhador da coleta • ${u.rota} ❯`;
  if (u.perfil === 'trabalhador') renderizarAvatarElemento(hAvatar, u.fotoPerfil);

  // Header Morador
  const mNome = document.getElementById('morador-header-nome');
  const mRota = document.getElementById('morador-header-rota');
  const mAvatar = document.getElementById('morador-avatar-box');
  if (mNome && u.perfil === 'morador') mNome.textContent = `Olá, ${primeiroNome}!`;
  if (mRota && u.perfil === 'morador') mRota.textContent = `Morador(a) • ${u.rota} ❯`;
  if (u.perfil === 'morador') renderizarAvatarElemento(mAvatar, u.fotoPerfil);

  // Tela de Perfil e Progresso (Adaptada para Trabalhador ou Morador)
  const pAvatar = document.getElementById('perfil-avatar-icone');
  const pNome = document.getElementById('perfil-nome');
  const pEmail = document.getElementById('perfil-email');
  const pRota = document.getElementById('perfil-rota');
  const pCheckins = document.getElementById('perfil-checkins');
  const pAlongamentos = document.getElementById('perfil-alongamentos');
  const pAlertas = document.getElementById('perfil-alertas');

  const lblStat1 = document.getElementById('lbl-stat-1');
  const lblStat2 = document.getElementById('lbl-stat-2');
  const lblStat3 = document.getElementById('lbl-stat-3');

  renderizarAvatarElemento(pAvatar, u.fotoPerfil);
  if (pNome) pNome.textContent = u.nome;
  if (pEmail) pEmail.textContent = u.email;
  if (pRota) pRota.textContent = u.rota;
  if (pCheckins) pCheckins.textContent = u.checkins || 0;
  if (pAlongamentos) pAlongamentos.textContent = u.alongamentos || 0;
  if (pAlertas) pAlertas.textContent = u.alertas || 0;

  if (u.perfil === 'morador') {
    if (lblStat1) lblStat1.textContent = 'Guias Lidos';
    if (lblStat2) lblStat2.textContent = 'Valorizações';
    if (lblStat3) lblStat3.textContent = 'Alertas Enviados';
  } else {
    if (lblStat1) lblStat1.textContent = 'Check-ins Feitos';
    if (lblStat2) lblStat2.textContent = 'Alongamentos';
    if (lblStat3) lblStat3.textContent = 'Alertas de Vidro';
  }

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

  const humor = EstadoApp.checkinDoDia.humor || 'Bem';
  const dor = EstadoApp.checkinDoDia.dor || 'Sem dores';
  const agora = new Date();
  const horarioAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Classificação Clínica Automática para a Tabela SESMT da Prefeitura:
  // Vermelho (Crítico): Dor intensa (EVA >= 7) ou exaustão/tristeza intensa
  // Amarelo (Atenção): Cansaço moderado ("Mais ou menos") ou dores leves/moderadas
  // Verde (Apto): Sem queixas ("Sem dores" e "Muito bem" / "Bem")
  let novoStatusSaude = 'apto';
  let novoLabelStatus = 'Apto / Regular';
  let novaQueixaClinica = `Sem queixas álgicas • Estado: ${humor}`;

  if (dor === 'Dores intensas' || humor === 'Muito cansado' || humor === 'Triste') {
    novoStatusSaude = 'critico';
    novoLabelStatus = dor === 'Dores intensas' ? 'Crítico (EVA ≥ 7)' : 'Crítico (Exaustão)';
    novaQueixaClinica = `${dor} • Estado emocional: ${humor}`;
  } else if (dor === 'Dores moderadas' || dor === 'Pequeno desconforto' || humor === 'Mais ou menos') {
    novoStatusSaude = 'atencao';
    novoLabelStatus = 'Atenção';
    novaQueixaClinica = `${dor} • Estado emocional: ${humor}`;
  }

  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.checkins = (EstadoApp.usuarioLogado.checkins || 0) + 1;
    EstadoApp.usuarioLogado.statusSaude = novoStatusSaude;
    EstadoApp.usuarioLogado.labelStatusSaude = novoLabelStatus;
    EstadoApp.usuarioLogado.queixaClinica = novaQueixaClinica;
    EstadoApp.usuarioLogado.horarioCheckin = horarioAtual;
    EstadoApp.usuarioLogado.protocoloAcionado = false;

    if (!EstadoApp.usuarioLogado.matricula) {
      EstadoApp.usuarioLogado.matricula = "MAT-1042";
    }

    if (BancoUsuarios[EstadoApp.usuarioLogado.email]) {
      BancoUsuarios[EstadoApp.usuarioLogado.email] = {
        ...BancoUsuarios[EstadoApp.usuarioLogado.email],
        ...EstadoApp.usuarioLogado
      };
      salvarBancoUsuarios();
    }

    SupabaseService.registrarCheckin(
      EstadoApp.usuarioLogado.email,
      humor,
      dor,
      EstadoApp.usuarioLogado.checkins
    );
  }

  if (typeof renderizarTabelaSesmtGari === 'function') {
    renderizarTabelaSesmtGari();
  }

  somarPontos(10, "fazer o check-in de saúde");
  alert("Check-in concluído com sucesso! Você ganhou +10 ELOs.");
  navegarPara('screen-home-worker');
}

/* --------------------------------------------------------------------------
   5. MEUS ELOS & RECOMPENSAS
   -------------------------------------------------------------------------- */
function somarPontos(quantidade, motivo, silencioso = false) {
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
  atualizarDadosInterfaceUsuario();
  if (!silencioso) {
    falarTexto(`Parabéns! Você ganhou ${quantidade} ELOs por ${motivo}. Seu saldo é de ${EstadoApp.pontosElos} pontos.`);
  }
}

function atualizarDisplaysPontos() {
  document.querySelectorAll('.valor-elos').forEach(el => {
    el.textContent = EstadoApp.pontosElos;
  });
}

function resgatarRecompensa(custo, itemNome, localParceiro, iconeCustom) {
  if (EstadoApp.pontosElos < custo) {
    const falta = custo - EstadoApp.pontosElos;
    alert(`Você precisa de mais ${falta} ELOs para resgatar: ${itemNome}`);
    falarTexto(`Você ainda não tem pontos suficientes. Faltam ${falta} ELOs.`);
    return;
  }

  EstadoApp.pontosElos -= custo;
  
  // Gera código único de voucher
  const codigoVoucher = "ELO-" + Math.floor(1000 + Math.random() * 9000);
  const localFinal = localParceiro || (itemNome.includes("Fisioterapia") || itemNome.includes("psicológico") ? "Clínica São Camilo" : "Parceiro do Bairro");
  const iconeFinal = iconeCustom || (itemNome.includes("Café") ? "☕" : itemNome.includes("Celular") ? "📱" : "🎟️");

  const novoVoucher = {
    titulo: itemNome,
    local: localFinal,
    codigo: codigoVoucher,
    status: itemNome.includes("Fisioterapia") ? "Agendado" : "Pronto para Usar",
    icone: iconeFinal
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

  // Recompensa o morador com +20 ELOs por alertar a equipe sobre riscos ou ocorrências
  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.alertas = (EstadoApp.usuarioLogado.alertas || 0) + 1;
  }
  somarPontos(20, "alertar sobre ocorrência na via", true);

  let mensagemAlerta = `Ocorrência registrada com sucesso (+20 ELOs)!\nProtocolo: ${protocolo}\nProblema: ${tipoProblema}`;
  
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

  // Recompensa o morador com +15 ELOs por valorizar os profissionais da coleta
  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.alongamentos = (EstadoApp.usuarioLogado.alongamentos || 0) + 1;
  }
  somarPontos(15, "valorizar os profissionais da coleta", true);

  alert("💌 Mensagem enviada com sucesso ao Mural dos Trabalhadores! (+15 ELOs)\nEles poderão ouvir seu recado em voz alta.");
  falarTexto("Sua mensagem de carinho foi enviada ao mural da equipe e você ganhou 15 ELOs!");

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
  exercicio_gari: {
    titulo: "Ginástica Laboral & Alongamento do Gari",
    subtitulo: "Fisioterapia São Camilo • Preparação oficial para o turno • 1 min",
    categoria: "Ginástica Laboral",
    tempoSegundos: 10,
    videoUrl: "assets/videos/exerciciogari.mp4",
    poster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Fique em pé com a postura ereta e respire profundamente antes de iniciar o movimento.",
      "Execute o aquecimento guiado no vídeo para soltar a musculatura e prevenir lesões.",
      "Faça o exercício antes de subir no caminhão e após o encerramento da rota de coleta."
    ],
    falaPassos: "Ginástica laboral do gari. Faça o aquecimento para soltar os músculos e proteger as articulações antes de iniciar a coleta."
  },
  ombros: {
    titulo: "Alongamento de Ombros e Braços",
    subtitulo: "Alívio de sobrecarga nos membros superiores • 1 min",
    categoria: "Membros Superiores",
    tempoSegundos: 10,
    videoUrl: "assets/videos/exercicio_ombros.mp4",
    poster: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Gire os ombros para trás em círculos amplos para soltar a musculatura.",
      "Puxe o braço estendido na altura do peito, segurando com o outro braço.",
      "Mantenha por 15 segundos de cada lado sem curvar a coluna nem prender a respiração."
    ],
    falaPassos: "Exercício de ombros: Gire os ombros suavemente e puxe o braço na frente do peito para soltar a tensão de levantar peso."
  },
  tornozelos: {
    titulo: "Prevenção de Entorses & Tornozelos",
    subtitulo: "Fortalecimento para corrida no asfalto e meio-fio • 1 min",
    categoria: "Prevenção de Quedas e Entorses",
    tempoSegundos: 10,
    videoUrl: "assets/videos/exercicio_tornozelos.mp4",
    poster: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Apoie a ponta do pé no chão e realize giros circulares lentos com o tornozelo.",
      "Alongue a panturrilha apoiando as mãos no estribo e flexionando a perna da frente.",
      "Prevenção essencial para evitar torções ao descer do estribo e correr no asfalto irregular."
    ],
    falaPassos: "Exercício de tornozelos: Faça giros suaves com os tornozelos e alongue a panturrilha para evitar torções ao pisar no meio-fio."
  },
  costas: {
    titulo: "Alongamento para Costas e Coluna",
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
  },
  descarte_agulhas: {
    titulo: "Descarte Seguro de Agulhas e Perfurocortantes",
    subtitulo: "Prevenção SESMT São Camilo • Proteja os Garis • 1 min",
    categoria: "Segurança do Coletor",
    tempoSegundos: 10,
    videoUrl: "assets/videos/descarte_agulhas_1.mp4",
    poster: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Nunca jogue agulhas de insulina, seringas ou lancetas soltas no saco de lixo comum.",
      "Insira sempre em um recipiente de paredes rígidas com tampa (garrafa PET ou frasco de amaciante).",
      "Feche a tampa e vede com fita adesiva resistente para evitar abertura acidental.",
      "Escreva por fora com caneta em destaque: 'CUIDADO: AGULHAS USADAS'."
    ],
    falaPassos: "Descarte seguro de agulhas e seringas: Nunca jogue agulhas soltas no lixo. Coloque dentro de uma garrafa PET rígida, tampe bem com fita e identifique com a frase Cuidado Agulhas."
  },
  descarte_vidro: {
    titulo: "Como Embalar Vidros Quebrados e Cortantes",
    subtitulo: "Guia Prático do Morador • Proteja os Garis • 1 min",
    categoria: "Descarte Seguro",
    tempoSegundos: 10,
    videoUrl: "assets/videos/guia_descarte_correto.mp4",
    poster: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Recolha os cacos de vidro ou lâmpadas usando luva ou jornal grosso.",
      "Coloque todos os cacos dentro de uma garrafa PET cortada, caixa de leite ou papelão grosso.",
      "Feche bem a abertura com fita adesiva resistente para nenhum caco escapar.",
      "Escreva por fora em letra grande: 'CUIDADO: VIDRO QUEBRADO'."
    ],
    falaPassos: "Como embalar vidros quebrados: Coloque os cacos dentro de uma caixa de leite ou garrafa PET, lacre com fita adesiva e escreva Cuidado Vidro."
  },
  descarte_separacao: {
    titulo: "Dicas Práticas para Separar o Lixo em Casa",
    subtitulo: "Coleta Seletiva Ipiranga • Educação Ambiental • 1 min",
    categoria: "Reciclagem em Casa",
    tempoSegundos: 10,
    videoUrl: "assets/videos/dicas_separacao_lixo.mp4",
    poster: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Saco 1 (Lixo Úmido / Orgânico): Restos de alimentos, cascas de frutas, borra de café e guardanapos usados.",
      "Saco 2 (Lixo Seco / Reciclável): Garrafas PET, latas, papelão seco e potes plásticos enxaguados.",
      "Amarre os sacos com nó duplo e coloque na calçada apenas perto do horário do caminhão."
    ],
    falaPassos: "Separação correta: Coloque restos de comida no saco de lixo orgânico e embalagens limpas no saco de recicláveis."
  },
  editorial_conscientizacao: {
    titulo: "Campanha Cidadã: O Trabalho dos Garis",
    subtitulo: "Valorização da Limpeza Urbana & Saúde Pública • 1 min",
    categoria: "Conscientização Coletiva",
    tempoSegundos: 10,
    videoUrl: "assets/videos/editorial_conscientizacao.mp4",
    poster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Cada saco colocado na calçada passa pelas mãos de trabalhadores essenciais da nossa cidade.",
      "Um pequeno cuidado ao embalar evita cortes graves e garante a segurança de toda a equipe.",
      "Colabore separando o lixo e protegendo quem cuida de São Paulo todos os dias!"
    ],
    falaPassos: "Campanha de conscientização cidadã: O trabalho dos garis protege a saúde pública da nossa cidade. Embale sempre com cuidado e respeito."
  },
  descarte_oleo: {
    titulo: "Descarte de Óleo de Cozinha, Pilhas e Remédios",
    subtitulo: "Prevenção de Contaminação da Água e Solo • 2 min",
    categoria: "Resíduos Especiais",
    tempoSegundos: 20,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    passos: [
      "Espere o óleo de cozinha esfriar e armazene em uma garrafa PET bem fechada com funil.",
      "Separe pilhas, baterias e cartelas de medicamentos vencidos em um saquinho identificado.",
      "Entregue o óleo no Ecoponto e leve os remédios ou agulhas até a UBS ou farmácia mais próxima."
    ],
    falaPassos: "Óleo, pilhas e remédios: Guarde o óleo usado em garrafa PET e entregue remédios vencidos na farmácia ou posto de saúde."
  }
};

let exercicioAtualId = 'costas';
let telaOrigemVideo = 'screen-health';
let timerInterval = null;
let timerSegundosRestantes = 30;
let timerAtivo = false;

function abrirPlayerVideo(idExercicio) {
  const dados = CatalogoVideosAlongamento[idExercicio];
  if (!dados) return;

  // Guarda de qual tela o usuário abriu o vídeo (Minha Saúde do Gari ou Aprenda do Morador)
  if (EstadoApp.telaAtual === 'screen-learn' || idExercicio.startsWith('descarte_')) {
    telaOrigemVideo = 'screen-learn';
  } else {
    telaOrigemVideo = 'screen-health';
  }

  exercicioAtualId = idExercicio;

  // Atualiza elementos do player
  document.getElementById('video-titulo').textContent = dados.titulo;
  document.getElementById('video-subtitulo').textContent = dados.subtitulo;
  document.getElementById('video-categoria-badge').textContent = dados.categoria;
  document.getElementById('player-titulo-header').textContent = dados.titulo;

  const btnConcluir = document.querySelector('.btn-concluir-exercicio');
  if (btnConcluir) {
    btnConcluir.textContent = telaOrigemVideo === 'screen-learn'
      ? '✅ Concluir Vídeo Educativo (+10 ELOs)'
      : '✅ Concluir Exercício (+10 ELOs)';
  }

  // Atualiza vídeo
  const video = document.getElementById('video-element');
  const source = document.getElementById('video-source');
  if (source) source.src = dados.videoUrl;
  if (video) {
    video.src = dados.videoUrl;
    video.poster = dados.poster;
    video.load();
  }

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

function carregarArquivoVideoNoPlayer(inputEl) {
  if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;
  const arquivo = inputEl.files[0];
  const blobUrl = URL.createObjectURL(arquivo);

  if (CatalogoVideosAlongamento[exercicioAtualId]) {
    CatalogoVideosAlongamento[exercicioAtualId].videoUrl = blobUrl;
  }

  const video = document.getElementById('video-element');
  const source = document.getElementById('video-source');
  if (source && video) {
    source.src = blobUrl;
    video.load();
    video.play().catch(() => {});
  }

  alert(`🎬 Vídeo "${arquivo.name}" carregado com sucesso dentro do aplicativo!\nEle já está pronto para reprodução no player acima.`);
  falarTexto(`Vídeo ${arquivo.name} carregado no player do aplicativo.`);
}

function fecharPlayerVideo() {
  const video = document.getElementById('video-element');
  if (video) video.pause();
  pararTimer();
  navegarPara(telaOrigemVideo || 'screen-health');
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

  if (EstadoApp.usuarioLogado) {
    EstadoApp.usuarioLogado.alongamentos = (EstadoApp.usuarioLogado.alongamentos || 0) + 1;
  }

  somarPontos(10, `completar o vídeo de ${dados.titulo}`);
  alert(`🎉 Parabéns!\n\nVocê concluiu: ${dados.titulo}\nVocê ganhou +10 ELOs!`);
  falarTexto(`Parabéns! Vídeo concluído. Você conquistou mais 10 ELOs.`);

  navegarPara(telaOrigemVideo || 'screen-health');
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
  const inputArquivo = document.getElementById('novo-video-arquivo');
  const urlManual = document.getElementById('novo-video-url')?.value.trim();

  if (!titulo) {
    alert("Por favor, digite o título do alongamento.");
    return;
  }

  let videoFinalUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  if (inputArquivo && inputArquivo.files && inputArquivo.files.length > 0) {
    videoFinalUrl = URL.createObjectURL(inputArquivo.files[0]);
  } else if (urlManual) {
    videoFinalUrl = urlManual;
  }

  const novoId = "video_" + Date.now();
  CatalogoVideosAlongamento[novoId] = {
    titulo: titulo,
    subtitulo: `Fisioterapia São Camilo • ${duracao}`,
    categoria: "Alongamento Especializado",
    tempoSegundos: 30,
    videoUrl: videoFinalUrl,
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
  // Bloqueia acesso se o usuário não estiver autenticado com perfil exclusivo da Prefeitura
  if (!EstadoApp.usuarioLogado || EstadoApp.usuarioLogado.perfil !== 'prefeitura') {
    alert("🔒 Acesso Restrito à Prefeitura!\n\nApenas gestores autenticados com E-mail Corporativo (@prefeitura.sp.gov.br) e Token Institucional (PREF-IPIRANGA) podem visualizar o Painel Executivo.");
    navegarPara('screen-auth');
    alternarAbaAuth('prefeitura');
    return;
  }

  navegarPara('screen-admin-dashboard');
  sincronizarPainelAdmin();
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
        perfisNuvem.forEach(p => {
          if (p.perfil === 'trabalhador' && !BancoUsuarios[p.email]) {
            const hashNum = Math.abs(p.email.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 8999) + 1000;
            BancoUsuarios[p.email] = {
              nome: p.nome,
              email: p.email,
              perfil: 'trabalhador',
              matricula: `MAT-${hashNum}`,
              rota: p.rota_ou_bairro || 'Rota 14 - Ipiranga',
              statusSaude: 'apto',
              labelStatusSaude: (p.total_checkins || 0) > 0 ? 'Apto / Regular' : 'Aguardando 1º Check-in',
              queixaClinica: (p.total_checkins || 0) > 0 ? 'Sem queixas clínicas relatadas' : 'Aguardando 1º Check-in no app',
              horarioCheckin: '08:00',
              protocoloAcionado: false,
              pontosElos: p.pontos_elos || 50,
              checkins: p.total_checkins || 0
            };
          }
        });
        salvarBancoUsuarios();
        listaPerfis = Object.values(BancoUsuarios);
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

  // Atualiza a Tabela Corporativa SESMT de Monitoramento dos Garis
  renderizarTabelaSesmtGari();
}

/* --------------------------------------------------------------------------
   TABELA CORPORATIVA SESMT DE MONITORAMENTO DOS GARIS (PREFEITURA / SÃO CAMILO)
   -------------------------------------------------------------------------- */
let filtroGravidadeSesmtAtual = 'todos';

function definirFiltroGravidadeSesmt(filtro, botao) {
  filtroGravidadeSesmtAtual = filtro;
  document.querySelectorAll('#sesmt-filter-tabs .sesmt-tab').forEach(btn => btn.classList.remove('active'));
  if (botao) botao.classList.add('active');
  renderizarTabelaSesmtGari();
}

function renderizarTabelaSesmtGari() {
  const tbody = document.getElementById('admin-sesmt-tbody');
  if (!tbody) return;

  const termoBusca = (document.getElementById('input-busca-sesmt')?.value || '').trim().toLowerCase();

  // Filtra apenas os trabalhadores (garis) cadastrados no sistema
  const todosGaris = Object.values(BancoUsuarios).filter(u => u && u.perfil === 'trabalhador');

  // Ordena por gravidade clínica: Crítico (1º) -> Atenção (2º) -> Apto (3º)
  const pesoGravidade = { critico: 0, atencao: 1, apto: 2 };
  todosGaris.sort((a, b) => {
    const pa = pesoGravidade[a.statusSaude || 'apto'] ?? 2;
    const pb = pesoGravidade[b.statusSaude || 'apto'] ?? 2;
    return pa - pb;
  });

  // Atualiza contadores das abas de filtro
  const countTodos = todosGaris.length;
  const countCritico = todosGaris.filter(g => g.statusSaude === 'critico').length;
  const countAtencao = todosGaris.filter(g => g.statusSaude === 'atencao').length;
  const countApto = todosGaris.filter(g => (g.statusSaude || 'apto') === 'apto').length;

  const elTodos = document.getElementById('count-sesmt-todos');
  const elCrit = document.getElementById('count-sesmt-critico');
  const elAten = document.getElementById('count-sesmt-atencao');
  const elApto = document.getElementById('count-sesmt-apto');
  if (elTodos) elTodos.textContent = countTodos;
  if (elCrit) elCrit.textContent = countCritico;
  if (elAten) elAten.textContent = countAtencao;
  if (elApto) elApto.textContent = countApto;

  // Aplica filtro de aba (Críticos / Atenção / Aptos / Todos) e busca textual
  const garisFiltrados = todosGaris.filter(g => {
    const status = g.statusSaude || 'apto';
    if (filtroGravidadeSesmtAtual !== 'todos' && status !== filtroGravidadeSesmtAtual) {
      return false;
    }
    if (termoBusca) {
      const textoAlvo = `${g.nome || ''} ${g.matricula || ''} ${g.rota || ''} ${g.queixaClinica || ''}`.toLowerCase();
      return textoAlvo.includes(termoBusca);
    }
    return true;
  });

  if (garisFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:18px; color:#64748b; font-weight:600;">
          Nenhum coletor encontrado para o filtro ou termo pesquisado.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = garisFiltrados.map(g => {
    const status = g.statusSaude || 'apto';
    const matricula = g.matricula || 'MAT-1042';
    const rota = g.rota || 'Rota 14 - Caminhão COMP-04';
    const labelStatus = g.labelStatusSaude || (status === 'critico' ? 'Crítico (EVA ≥ 7)' : status === 'atencao' ? 'Atenção' : 'Apto / Regular');
    const queixa = g.queixaClinica || 'Sem queixas clínicas relatadas';
    const horario = g.horarioCheckin || '08:00';

    const classePill = status === 'critico' ? 'st-critico' : status === 'atencao' ? 'st-atencao' : 'st-apto';
    const classeDot = status === 'critico' ? 'dot-red' : status === 'atencao' ? 'dot-yellow' : 'dot-green';

    const acaoHtml = g.protocoloAcionado
      ? `<span class="sesmt-protocolo-confirmado">Protocolo São Camilo Ativo</span>`
      : `<button class="btn-sesmt-ambulatorio" onclick="acionarAmbulatorioGari('${g.email}', this)">Acionar Ambulatório</button>`;

    return `
      <tr data-email="${g.email}" data-matricula="${matricula}" data-status="${status}">
        <td><strong>${g.nome}</strong></td>
        <td><span class="sesmt-matricula-code">${matricula}</span></td>
        <td>${rota}</td>
        <td>
          <span class="sesmt-status-pill ${classePill}">
            <span class="dot-indicator ${classeDot}"></span>${labelStatus}
          </span>
        </td>
        <td>${queixa}</td>
        <td>${horario}</td>
        <td>${acaoHtml}</td>
      </tr>
    `;
  }).join('');
}

function acionarAmbulatorioGari(emailGari, botao) {
  const gari = BancoUsuarios[emailGari];
  if (!gari) return;

  const numProtocolo = "SPSC-" + Math.floor(10000 + Math.random() * 90000);
  gari.protocoloAcionado = true;
  gari.ultimoProtocoloClinico = numProtocolo;
  salvarBancoUsuarios();

  if (botao) {
    botao.outerHTML = `<span class="sesmt-protocolo-confirmado">Protocolo São Camilo Ativo</span>`;
  }

  alert(
    `PROTOCOLO CLÍNICO SÃO CAMILO ATIVADO\n\n` +
    `Protocolo: ${numProtocolo}\n` +
    `Coletor(a): ${gari.nome} (${gari.matricula || 'MAT-1042'})\n` +
    `Lotação: ${gari.rota || 'Rota 14'}\n` +
    `Quadro Clínico: ${gari.queixaClinica || 'Avaliação Ocupacional'}\n\n` +
    `Encaminhamento registrado junto ao Ambulatório de Saúde Ocupacional e Fisioterapia do Centro Universitário São Camilo.`
  );
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
    } else {
      novoStatus = 'Resolvida';
      statusSpan.textContent = 'Resolvida';
      statusSpan.className = 'status-pill st-ok';
      botao.outerHTML = '<span class="done-check">✔ Protegido</span>';
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
  // Inicia naturalmente no mudo (🔇 vermelho, apenas ícone) e carrega preferência de voz
  EstadoVoz.somLigado = false;
  atualizarVisualBotoesVoz('stopped');
  atualizarBotaoGeneroVoz();
  carregarVozesNavegador();

  // Intercepta cliques nos botões circulares de som (.btn-voice-inline) para ligar/desligar o som
  document.addEventListener('click', (e) => {
    const btnInline = e.target.closest('.btn-voice-inline');
    if (btnInline) {
      if (EstadoVoz.somLigado) {
        // Se já estava ligado, desliga (mudo 🔇) e impede o onclick de falar novamente
        e.stopImmediatePropagation();
        e.preventDefault();
        pararFalaUsuario();
      } else {
        // Se estava no mudo, liga o som (🔊 verde) e permite que o onclick fale o texto da tela
        EstadoVoz.somLigado = true;
        atualizarVisualBotoesVoz('speaking');
      }
    }
  }, true);

  atualizarDadosInterfaceUsuario();
  atualizarDisplaysPontos();
  renderizarMensagens();
  renderizarTabelaSesmtGari();
  console.log("Sistema ELO completo (Fases 1 a 4 + Supabase PostgreSQL) inicializado.");
});

