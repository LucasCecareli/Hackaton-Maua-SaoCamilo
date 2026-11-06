/**
 * ============================================================================
 * ELO - MOTOR PRINCIPAL DE LÓGICA, ESTADO E ACESSIBILIDADE (Vanilla JS)
 * ============================================================================
 */

// Estado Global da Aplicação
const EstadoApp = {
  perfilAtual: localStorage.getItem('elo_perfil') || null,
  pontosElos: parseInt(localStorage.getItem('elos_saldo')) || 340,
  telaAtual: 'screen-splash',
  checkinDoDia: {
    humor: null,
    dor: null
  }
};

/* --------------------------------------------------------------------------
   1. ACESSIBILIDADE POR VOZ (Web Speech API)
   -------------------------------------------------------------------------- */
const suporteVoz = 'speechSynthesis' in window;

function falarTexto(texto) {
  if (!suporteVoz) {
    console.warn("Navegador sem suporte a síntese de voz.");
    return;
  }
  window.speechSynthesis.cancel(); // Para áudios anteriores
  const locucao = new SpeechSynthesisUtterance(texto);
  locucao.lang = 'pt-BR';
  locucao.rate = 1.0;
  locucao.pitch = 1.0;
  window.speechSynthesis.speak(locucao);
}

function lerTelaAtual() {
  const tela = EstadoApp.telaAtual;
  if (tela === 'screen-splash') {
    falarTexto("Aplicativo ELO: Conectando quem cuida da cidade. Toque no botão Começar Agora.");
  } else if (tela === 'screen-roles') {
    falarTexto("Escolha o seu perfil: Sou Morador ou Sou Trabalhador da coleta.");
  } else if (tela === 'screen-home-worker') {
    falarTexto("Olá Carlos! Você tem 340 ELOs. Escolha uma das opções: Meu Bem-Estar, Minha Saúde, Aprender, Meus ELOs ou Minha Comunidade.");
  } else if (tela === 'screen-wellbeing') {
    falarTexto("Tela de Meu Bem-Estar. Conte como você está se sentindo e se sente dores no corpo depois do trabalho.");
  } else if (tela === 'screen-health') {
    falarTexto("Minha Saúde: Exercícios rápidos de alongamento para coluna, ombros e pernas.");
  } else if (tela === 'screen-rewards') {
    falarTexto(`Seus ELOs: Você possui ${EstadoApp.pontosElos} pontos. Troque por recargas, lanche na padaria ou consultas de fisioterapia e psicologia.`);
  } else if (tela === 'screen-community') {
    falarTexto("Minha Comunidade: Mensagens de carinho e apoio enviadas pelos moradores do bairro para a sua equipe.");
  }
}

/* --------------------------------------------------------------------------
   2. ROTEAMENTO SPA (TROCA DE TELAS)
   -------------------------------------------------------------------------- */
function navegarPara(idTelaDestino) {
  const todasTelas = document.querySelectorAll('.screen');
  todasTelas.forEach(tela => tela.classList.remove('active'));

  const telaDestino = document.getElementById(idTelaDestino);
  if (telaDestino) {
    telaDestino.classList.add('active');
    EstadoApp.telaAtual = idTelaDestino;

    const container = document.querySelector('.screens-container');
    if (container) container.scrollTop = 0;
  }

  // Atualiza a barra de navegação inferior
  const bottomNav = document.getElementById('bottom-navbar');
  if (bottomNav) {
    if (idTelaDestino === 'screen-splash' || idTelaDestino === 'screen-roles') {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
      atualizarItensNav(idTelaDestino);
    }
  }
}

function atualizarItensNav(idTela) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (idTela === 'screen-home-worker' || idTela === 'screen-home-morador') {
    const el = document.getElementById('nav-inicio');
    if (el) el.classList.add('active');
  } else if (idTela === 'screen-wellbeing' || idTela === 'screen-health') {
    const el = document.getElementById('nav-saude');
    if (el) el.classList.add('active');
  } else if (idTela === 'screen-rewards') {
    const el = document.getElementById('nav-elos');
    if (el) el.classList.add('active');
  } else if (idTela === 'screen-community') {
    const el = document.getElementById('nav-comunidade');
    if (el) el.classList.add('active');
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
   3. CHECK-IN DE SAÚDE (BEM-ESTAR)
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

  // Soma 10 ELOs como recompensa pela participação
  somarPontos(10, "fazer o check-in de saúde");

  alert("Check-in concluído com sucesso! Você ganhou +10 ELOs.");
  navegarPara('screen-home-worker');
}

/* --------------------------------------------------------------------------
   4. MEUS ELOS & RECOMPENSAS (SISTEMA DE PONTUAÇÃO)
   -------------------------------------------------------------------------- */
function somarPontos(quantidade, motivo) {
  EstadoApp.pontosElos += quantidade;
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
  localStorage.setItem('elos_saldo', EstadoApp.pontosElos);
  atualizarDisplaysPontos();

  alert(`🎉 Recompensa resgatada com sucesso!\n\nVocê resgatou: ${itemNome}\nSeu novo saldo: ${EstadoApp.pontosElos} ELOs`);
  falarTexto(`Parabéns! Recompensa resgatada: ${itemNome}. Código enviado para a sua equipe.`);
}

/* --------------------------------------------------------------------------
   5. EXERCÍCIOS & ALONGAMENTOS
   -------------------------------------------------------------------------- */
function iniciarExercicio(nomeExercicio) {
  somarPontos(10, `iniciar o exercício de ${nomeExercicio}`);
  alert(`Iniciando guia em áudio: ${nomeExercicio}.\n\nVocê ganhou +10 ELOs!`);
  falarTexto(`Iniciando: ${nomeExercicio}. Respire fundo, relaxe os ombros e siga os movimentos.`);
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarDisplaysPontos();
  console.log("Sistema ELO pronto. Saldo carregado:", EstadoApp.pontosElos);
});
