"use strict";

/* ── Dados das fontes de energia ─────────────────────────────── */
const SOURCES_DATA = [
  {
    id: 'solar', name: 'Energia solar fotovoltaica', icon: '☀️',
    desc: 'Painéis fotovoltaicos para irrigação, ordenha e refrigeração. Não gera à noite.',
    cost: 15000, energy: 20, sustain: 20, dieselReduction: 10, opCost: 500,
    income: 0, tags: [['Reduz conta', 'green'], ['Intermitente', 'gray'], ['Alto custo', 'amber']],
    maxLevel: 3, level: 0, unlockYear: 1
  },
  {
    id: 'biogas', name: 'Biogás & biometano', icon: '🐄',
    desc: 'Transforma dejetos animais em energia térmica e substitui diesel em tratores.',
    cost: 22000, energy: 18, sustain: 25, dieselReduction: 25, opCost: 1200,
    income: 0, tags: [['Substitui diesel', 'blue'], ['Resíduos úteis', 'green'], ['Investimento alto', 'amber']],
    maxLevel: 2, level: 0, unlockYear: 1
  },
  {
    id: 'biomassa', name: 'Biomassa agrícola', icon: '🌾',
    desc: 'Queima de palha e bagaço para secar grãos. Fornecimento estável sem depender do clima.',
    cost: 10000, energy: 12, sustain: 15, dieselReduction: 5, opCost: 800,
    income: 0, tags: [['Estável', 'green'], ['Usa resíduos', 'blue'], ['Moderado', 'gray']],
    maxLevel: 3, level: 0, unlockYear: 1
  },
  {
    id: 'agrovolt', name: 'Sistema agrovoltaico', icon: '🌿',
    desc: 'Combina painéis solares com cultivo agrícola no mesmo espaço. Exige solar instalada.',
    cost: 18000, energy: 15, sustain: 30, dieselReduction: 8, opCost: 600,
    income: 0, tags: [['Duplo uso', 'blue'], ['Alta sustentab.', 'green'], ['Requer solar', 'amber']],
    maxLevel: 2, level: 0, unlockYear: 2
  },
  {
    id: 'credito', name: 'Créditos de carbono', icon: '📜',
    desc: 'Monetize a sustentabilidade vendendo créditos ao mercado verde internacional.',
    cost: 5000, energy: 0, sustain: 10, dieselReduction: 0, opCost: 0,
    income: 4000, tags: [['Renda extra', 'green'], ['Requer sustent.', 'amber']],
    maxLevel: 1, level: 0, unlockYear: 3
  },
  {
    id: 'hibrido', name: 'Frota híbrida / biometano', icon: '🚜',
    desc: 'Converte tratores e colheitadeiras para biometano. Quebra a dependência do diesel.',
    cost: 30000, energy: 5, sustain: 20, dieselReduction: 40, opCost: 2000,
    income: 0, tags: [['Elimina diesel', 'blue'], ['Grande impacto', 'green'], ['Investimento alto', 'red']],
    maxLevel: 1, level: 0, unlockYear: 3
  }
];

/* ── Eventos aleatórios ──────────────────────────────────────── */
const EVENTS = [
  {
    icon: '🌧️', title: 'Chuva excessiva!',
    desc: 'A tempestade prejudicou a geração solar este mês. Você precisa de uma solução de backup.',
    choices: [
      { label: 'Usar backup de biomassa (−R$ 1.500)', cost: 1500, log: 'usou backup de biomassa' },
      { label: 'Aceitar perda de produção (sem custo)', cost: 0, log: 'aceitou a perda de produção' }
    ]
  },
  {
    icon: '⛽', title: 'Alta do diesel!',
    desc: 'O preço do diesel subiu 30%. Suas fontes limpas valem ainda mais agora.',
    choices: [
      { label: 'Ótimo! Minha fazenda está preparada (sem custo)', cost: 0, income: 2000, log: 'se beneficiou da alta do diesel com +R$ 2.000' },
      { label: 'Precisamos urgente de mais biogás!', cost: 0, log: 'reconheceu a urgência de mais biogás' }
    ]
  },
  {
    icon: '🌍', title: 'Comprador internacional!',
    desc: 'Um importador europeu quer comprar sua produção, mas exige certificação verde.',
    needSustain: 40,
    choices: [
      { label: 'Fechar contrato (+R$ 8.000)', cost: 0, income: 8000, log: 'fechou contrato verde internacional (+R$ 8.000)' },
      { label: 'Sem sustentabilidade suficiente — recusar', cost: 0, log: 'perdeu contrato por falta de sustentabilidade' }
    ]
  },
  {
    icon: '⚡', title: 'Queda de energia!',
    desc: 'A rede elétrica caiu por 3 dias. Fazendas autossuficientes não sofreram prejuízo.',
    choices: [
      { label: 'Minha fazenda se manteve operando!', cost: 0, log: 'não sofreu com a queda de energia graças às fontes próprias' },
      { label: 'Perdi produção — prejuízo de R$ 2.000', cost: 2000, log: 'perdeu R$ 2.000 com a queda de energia' }
    ]
  },
  {
    icon: '🏦', title: 'Linha de crédito verde!',
    desc: 'Banco oferece financiamento com juros mínimos para propriedades sustentáveis.',
    choices: [
      { label: 'Solicitar R$ 15.000 a juros mínimos', cost: 0, income: 15000, log: 'obteve R$ 15.000 em crédito verde' },
      { label: 'Não preciso no momento', cost: 0, log: 'declinou a linha de crédito verde' }
    ]
  }
];

/* ── Estado do jogo ──────────────────────────────────────────── */
let state = {
  money: 50000,
  year: 1,
  sources: JSON.parse(JSON.stringify(SOURCES_DATA)),
  log: [],
  eventPending: false
};

/* ── Cálculos derivados ──────────────────────────────────────── */
const getEnergy        = () => state.sources.reduce((a, s) => a + s.energy * s.level, 0);
const getSustain       = () => Math.min(100, state.sources.reduce((a, s) => a + s.sustain * s.level, 0));
const getDiesel        = () => Math.max(0, 100 - state.sources.reduce((a, s) => a + s.dieselReduction * s.level, 0));
const getOpCosts       = () => state.sources.reduce((a, s) => a + s.opCost * s.level, 0);
const getPassiveIncome = () => state.sources.reduce((a, s) => a + (s.income || 0) * Math.min(s.level, 1), 0);

function fmt(n) {
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

/* ── Renderização principal ──────────────────────────────────── */
function render() {
  const energy  = getEnergy();
  const sustain = getSustain();
  const diesel  = getDiesel();

  document.getElementById('yearBadge').textContent = 'Ano ' + state.year;

  const moneyClass = state.money < 8000 ? 'bad' : state.money < 20000 ? 'warn' : '';
  document.getElementById('moneyDisplay').textContent = fmt(state.money);
  document.getElementById('moneyDisplay').className = 'balance-value ' + moneyClass;

  const shortMoney = state.money >= 1000 ? 'R$ ' + Math.round(state.money / 1000) + 'k' : fmt(state.money);
  document.getElementById('sideMoneyVal').textContent = shortMoney;
  document.getElementById('sideMoneyVal').className = 'stat-card-value ' + moneyClass;

  document.getElementById('sideEnergyVal').textContent = energy + ' kW';
  document.getElementById('sideEnergyVal').className = 'stat-card-value ' + (energy >= 60 ? 'good' : energy >= 30 ? 'warn' : 'bad');

  document.getElementById('sideSustainVal').textContent = sustain + '%';
  document.getElementById('sideSustainVal').className = 'stat-card-value ' + (sustain >= 80 ? 'good' : sustain >= 40 ? 'warn' : 'bad');

  document.getElementById('sideDieselVal').textContent = diesel + '%';
  document.getElementById('sideDieselVal').className = 'stat-card-value ' + (diesel <= 20 ? 'good' : diesel <= 50 ? 'warn' : 'bad');

  document.getElementById('mEnergy').textContent = energy + ' / 60 kW';
  document.getElementById('mEnergyFill').style.width = Math.min(100, Math.round(energy / 60 * 100)) + '%';

  document.getElementById('mSustain').textContent = sustain + ' / 80%';
  document.getElementById('mSustainFill').style.width = Math.min(100, Math.round(sustain / 80 * 100)) + '%';

  document.getElementById('mDiesel').textContent = diesel + '%';
  document.getElementById('mDieselFill').style.width = diesel + '%';
  document.getElementById('mDieselFill').style.background = diesel <= 20 ? '#74c69d' : diesel <= 50 ? '#e9a329' : '#e07070';

  document.getElementById('objEnergy').textContent = energy + ' / 60 kW';
  document.getElementById('objEnergyFill').style.width = Math.min(100, Math.round(energy / 60 * 100)) + '%';
  document.getElementById('objEnergyFill').className = 'obj-fill ' + (energy >= 60 ? 'green' : 'amber');

  document.getElementById('objSustain').textContent = sustain + ' / 80%';
  document.getElementById('objSustainFill').style.width = Math.min(100, Math.round(sustain / 80 * 100)) + '%';

  document.getElementById('objDiesel').textContent = diesel + ' / 20%';
  const dieselProgress = Math.round((100 - diesel) / 80 * 100);
  document.getElementById('objDieselFill').style.width = Math.min(100, dieselProgress) + '%';
  document.getElementById('objDieselFill').className = 'obj-fill ' + (diesel <= 20 ? 'green' : 'amber');

  const opCosts = getOpCosts();
  const passiveIncome = getPassiveIncome();
  const greenBonus = sustain >= 50 ? 3000 : sustain >= 30 ? 1000 : 0;
  if (opCosts > 0 || passiveIncome > 0) {
    document.getElementById('opCostsNote').textContent =
      'Por ano: ' +
      (passiveIncome + greenBonus > 0 ? '+' + Math.round(passiveIncome + greenBonus).toLocaleString('pt-BR') + ' receita · ' : '') +
      '−' + Math.round(opCosts).toLocaleString('pt-BR') + ' custos';
  } else {
    document.getElementById('opCostsNote').textContent = 'Sem custos operacionais ainda';
  }

  renderSources();

  if (sustain >= 80 && energy >= 60 && diesel <= 20 && state.year >= 3) {
    showWin(energy, sustain, diesel);
  }
}

/* ── Renderiza cards das fontes ──────────────────────────────── */
function renderSources() {
  const grid = document.getElementById('sourcesGrid');
  grid.innerHTML = '';
  const solarInstalled = state.sources.find(s => s.id === 'solar').level > 0;
  const sustain = getSustain();

  state.sources.forEach(src => {
    const locked       = src.unlockYear > state.year;
    const needSolar    = src.id === 'agrovolt' && !solarInstalled;
    const needSustain  = src.id === 'credito' && sustain < 30;
    const isMaxed      = src.level >= src.maxLevel;
    const cantAfford   = state.money < src.cost;
    const cantBuy      = locked || needSolar || needSustain || isMaxed || cantAfford || state.eventPending;

    const dots = Array.from({ length: src.maxLevel }, (_, i) =>
      `<div class="level-dot${i < src.level ? ' filled' : ''}"></div>`
    ).join('');

    let btnLabel = '';
    if (locked)           btnLabel = `Disponível no Ano ${src.unlockYear}`;
    else if (needSolar)   btnLabel = 'Requer solar instalada';
    else if (needSustain) btnLabel = 'Requer sustentabilidade 30%+';
    else if (isMaxed)     btnLabel = '✓ Nível máximo instalado';
    else if (cantAfford)  btnLabel = 'Saldo insuficiente';
    else                  btnLabel = `Instalar — ${fmt(src.cost)}`;

    const statsHtml = `
      <div class="source-stats-row">
        ${src.energy > 0          ? `<div class="source-stat-item"><div class="source-stat-label">Energia</div><div class="source-stat-val">+${src.energy} kW</div></div>` : ''}
        ${src.sustain > 0         ? `<div class="source-stat-item"><div class="source-stat-label">Sustentab.</div><div class="source-stat-val">+${src.sustain}%</div></div>` : ''}
        ${src.dieselReduction > 0 ? `<div class="source-stat-item"><div class="source-stat-label">Diesel</div><div class="source-stat-val">−${src.dieselReduction}%</div></div>` : ''}
        ${src.income > 0          ? `<div class="source-stat-item"><div class="source-stat-label">Renda/ano</div><div class="source-stat-val">+${Math.round(src.income / 1000)}k</div></div>` : ''}
      </div>
    `;

    const tagsHtml = src.tags.map(([t, c]) => `<span class="tag tag-${c}">${t}</span>`).join('');

    grid.innerHTML += `
      <div class="source-card${src.level > 0 ? ' active' : ''}${locked || needSolar ? ' locked' : ''}">
        <div class="source-card-header">
          <div class="source-icon-wrap">${src.icon}</div>
          <div>
            <div class="source-name">${src.name}</div>
            <div class="source-level-dots">${dots}</div>
          </div>
        </div>
        <div class="source-desc">${src.desc}</div>
        <div class="source-tags">${tagsHtml}</div>
        ${src.energy > 0 || src.sustain > 0 || src.dieselReduction > 0 || src.income > 0 ? statsHtml : ''}
        <button
          class="buy-btn${isMaxed ? ' maxed' : ''}"
          onclick="buySrc('${src.id}')"
          ${cantBuy ? 'disabled' : ''}
        >${btnLabel}</button>
      </div>
    `;
  });
}

/* ── Comprar / instalar fonte ────────────────────────────────── */
function buySrc(id) {
  const src = state.sources.find(s => s.id === id);
  if (!src || state.money < src.cost || src.level >= src.maxLevel || state.eventPending) return;

  state.money -= src.cost;
  src.level++;

  const lvl = src.maxLevel > 1 ? ` (nível ${src.level})` : '';
  addLog(`✅ ${src.name}${lvl} instalada. Gasto: ${fmt(src.cost)}.`);
  if (src.energy > 0)          addLog(`⚡ Capacidade: +${src.energy} kW`);
  if (src.dieselReduction > 0) addLog(`🛢️ Diesel reduzido em ${src.dieselReduction}%`);
  if (src.sustain > 0)         addLog(`🌿 Sustentabilidade: +${src.sustain}%`);

  render();
}

/* ── Avançar ano ─────────────────────────────────────────────── */
function nextTurn() {
  if (state.eventPending) return;

  state.year++;
  const income     = getPassiveIncome();
  const opCosts    = getOpCosts();
  const sustain    = getSustain();
  const greenBonus = sustain >= 50 ? 3000 : sustain >= 30 ? 1000 : 0;
  const net        = income + greenBonus - opCosts;

  state.money = Math.max(0, state.money + net);

  addLog(`📅 Ano ${state.year} — balanço: ${net >= 0 ? '+' : ''}${Math.round(net).toLocaleString('pt-BR')}${greenBonus > 0 ? ` (incl. bônus verde de R$ ${greenBonus.toLocaleString('pt-BR')})` : ''}`);

  if (state.year % 2 === 0) {
    triggerEvent();
  }

  render();
}

/* ── Eventos ─────────────────────────────────────────────────── */
function triggerEvent() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  state.eventPending = true;

  document.getElementById('evIcon').textContent  = ev.icon;
  document.getElementById('evTitle').textContent = ev.title;
  document.getElementById('evDesc').textContent  = ev.desc;

  const sustain = getSustain();
  const energy  = getEnergy();

  let filteredChoices = ev.choices.slice();

  if (ev.title === 'Comprador internacional!' && sustain < 40) {
    filteredChoices = [ev.choices[1]];
  }
  if (ev.title === 'Queda de energia!') {
    filteredChoices = energy >= 40 ? [ev.choices[0]] : [ev.choices[1]];
  }

  const choicesEl = document.getElementById('evChoices');
  choicesEl.innerHTML = '';
  filteredChoices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.label;
    btn.onclick = () => resolveEvent(c);
    choicesEl.appendChild(btn);
  });

  document.getElementById('eventArea').classList.add('visible');
  document.getElementById('nextTurnBtn').disabled = true;
}

function resolveEvent(choice) {
  if (choice.cost > 0)   { state.money = Math.max(0, state.money - choice.cost); }
  if (choice.income > 0) { state.money += choice.income; }

  addLog(`🎲 Evento resolvido: você ${choice.log}.`);

  state.eventPending = false;
  document.getElementById('eventArea').classList.remove('visible');
  document.getElementById('nextTurnBtn').disabled = false;
  render();
}

/* ── Log ─────────────────────────────────────────────────────── */
function addLog(msg) {
  state.log.push(msg);
  const scroll = document.getElementById('logScroll');
  const div = document.createElement('div');
  div.className = 'log-entry';
  div.innerHTML = msg;
  scroll.insertBefore(div, scroll.firstChild);
}

/* ── Vitória ─────────────────────────────────────────────────── */
function showWin(energy, sustain, diesel) {
  const ws = document.getElementById('winScreen');
  ws.classList.add('visible');
  document.getElementById('winStats').innerHTML = `
    <div class="win-stat"><div class="win-stat-label">Energia gerada</div><div class="win-stat-value">${energy} kW</div></div>
    <div class="win-stat"><div class="win-stat-label">Sustentabilidade</div><div class="win-stat-value">${sustain}%</div></div>
    <div class="win-stat"><div class="win-stat-label">Diesel restante</div><div class="win-stat-value">${diesel}%</div></div>
    <div class="win-stat"><div class="win-stat-label">Anos jogados</div><div class="win-stat-value">${state.year}</div></div>
  `;
  document.getElementById('nextTurnBtn').disabled = true;
}

function resetGame() {
  state = { money: 50000, year: 1, sources: JSON.parse(JSON.stringify(SOURCES_DATA)), log: [], eventPending: false };
  document.getElementById('winScreen').classList.remove('visible');
  document.getElementById('eventArea').classList.remove('visible');
  document.getElementById('nextTurnBtn').disabled = false;
  document.getElementById('logScroll').innerHTML = '<div class="log-entry">Bem-vindo! Sua fazenda depende <strong>100% de diesel</strong>. Comece instalando fontes renováveis.</div>';
  render();
}

/* ── Tutorial ────────────────────────────────────────────────── */
let tutorialStep = 0;
const TOTAL_STEPS = 5;

function updateTutorialUI() {
  document.querySelectorAll('.tutorial-step').forEach((el, i) => {
    el.classList.toggle('active', i === tutorialStep);
  });
  document.querySelectorAll('.step-dot').forEach((el, i) => {
    el.classList.toggle('active', i === tutorialStep);
  });
  const nextBtn = document.getElementById('nextStepBtn');
  nextBtn.textContent = tutorialStep === TOTAL_STEPS - 1 ? 'Começar a jogar!' : 'Próximo →';
}

document.getElementById('nextStepBtn').onclick = () => {
  if (tutorialStep < TOTAL_STEPS - 1) {
    tutorialStep++;
    updateTutorialUI();
  } else {
    document.getElementById('tutorialOverlay').style.display = 'none';
  }
};

document.getElementById('skipTutBtn').onclick = () => {
  document.getElementById('tutorialOverlay').style.display = 'none';
};

function showTutorial() {
  tutorialStep = 0;
  updateTutorialUI();
  document.getElementById('tutorialOverlay').style.display = 'flex';
}

/* ── Init ────────────────────────────────────────────────────── */
render();
