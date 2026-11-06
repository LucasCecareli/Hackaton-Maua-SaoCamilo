/**
 * ============================================================================
 * ELO - MOTOR PRINCIPAL DE LÓGICA, ESTADO E ACESSIBILIDADE (Vanilla JS)
 * Fases 1, 2 e 3 integradas
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
    falarTexto(`Olá Carlos! Você tem ${EstadoApp.pontosElos} ELOs. Escolha uma das opções: Meu Bem-Estar, Minha Saúde, Aprender, Meus ELOs ou Minha Comunidade.`);
  } else if (tela === 'screen-wellbeing') {
    falarTexto("Tela de Meu Bem-Estar. Conte como você está se sentindo e se sente dores no corpo depois do trabalho.");
  } else if (tela === 'screen-health') {
    falarTexto("Minha Saúde: Exercícios rápidos de alongamento para coluna, ombros e pernas.");
  } else if (tela === 'screen-rewards') {
    falarTexto(`Seus ELOs: Você possui ${EstadoApp.pontosElos} pontos. Troque por recargas, lanche na padaria ou consultas de fisioterapia e psicologia.`);
  } else if (tela === 'screen-community') {
    falarTexto("Minha Comunidade: Mensagens de carinho e apoio enviadas pelos moradores do bairro para a sua equipe.");
  } else if (tela === 'screen-home-morador') {
    falarTexto("Olá Mariana! Escolha uma das opções: Meu Bairro, Denúncias de resíduos perigosos, Aprenda sobre descarte ou Valorize a equipe da coleta.");
  } else if (tela === 'screen-reports') {
    falarTexto("Tela de Denúncias. Informe a localização, marque se há resíduos perigosos como caco de vidro solto e envie para a equipe.");
  } else if (tela === 'screen-neighborhood') {
    falarTexto("Meu Bairro: Veja o mapa de ocorrências e o horário que o caminhão de coleta passa na sua rua.");
  } else if (tela === 'screen-learn') {
    falarTexto("Aprenda: Guia de saúde e prevenção. Saiba como evitar dengue, leptospirose e como embalar vidros com segurança.");
  } else if (tela === 'screen-appreciate') {
    falarTexto("Valorize: Digite uma mensagem de incentivo para os coletores. Seu recado será lido em áudio para a equipe da sua rua.");
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
   3. CHECK-IN DE SAÚDE (BEM-ESTAR DO TRABALHADOR)
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

  somarPontos(10, "fazer o check-in de saúde");
  alert("Check-in concluído com sucesso! Você ganhou +10 ELOs.");
  navegarPara('screen-home-worker');
}

/* --------------------------------------------------------------------------
   4. MEUS ELOS & RECOMPENSAS
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

  const protocolo = "ELO-" + Math.floor(100000 + Math.random() * 900000);

  let mensagemAlerta = `Ocorrência registrada com sucesso!\nProtocolo: ${protocolo}\nProblema: ${tipoProblema}`;
  
  if (tipoProblema.includes("Perigoso") || tipoProblema.includes("Vidro")) {
    mensagemAlerta += `\n\n⚠️ ALERTA DE SEGURANÇA EMITIDO: Os coletores do caminhão da rota receberão aviso imediato de cuidado com perfurocortantes nesta rua!`;
    falarTexto("Alerta crítico emitido! Obrigado por avisar sobre o vidro quebrado. A equipe foi alertada para evitar cortes.");
  } else {
    falarTexto("Ocorrência enviada para a central de limpeza urbana com sucesso.");
  }

  alert(mensagemAlerta);
  document.getElementById('input-descricao-denuncia').value = '';
  navegarPara('screen-neighborhood');
}

/* --------------------------------------------------------------------------
   6. FASE 3: MEU BAIRRO & MAPA INTERATIVO
   -------------------------------------------------------------------------- */
function alternarAbaBairro(aba) {
  const btnRotas = document.getElementById('tab-rotas');
  const btnOcorrencias = document.getElementById('tab-ocorrencias');

  if (aba === 'rotas') {
    btnRotas.classList.add('active');
    btnOcorrencias.classList.remove('active');
    falarTexto("Exibindo rotas de coleta do caminhão no Ipiranga.");
  } else {
    btnOcorrencias.classList.add('active');
    btnRotas.classList.remove('active');
    falarTexto("Exibindo pontos de ocorrências registradas no mapa.");
  }
}

function detalharPin(local, status) {
  alert(`📍 Ponto de Coleta:\n${local}\nStatus: [${status}]`);
  falarTexto(`${local}. Status atual: ${status}.`);
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

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarDisplaysPontos();
  renderizarMensagens();
  console.log("Sistema ELO pronto. Fases 1, 2 e 3 integradas.");
});
