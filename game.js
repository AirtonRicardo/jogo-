// Neon Wasteland — Quiz Engine (Cyberpunk + Natureza Degradada)

const state = {
  questions: [],
  current: 0,
  score: 0,
  combo: 1,
  maxCombo: 1,
  lives: 3,
  usedHint: false,
  shield: 0,
  timePerQ: 15,
  timeLeft: 15,
  timerId: null,
  answered: false
};

// Elements
const elScore = document.getElementById('score');
const elCombo = document.getElementById('combo');
const elLives = document.getElementById('lives');
const elTimer = document.getElementById('timer');
const elQuestion = document.getElementById('question');
const elOptions = document.getElementById('options');
const elStart = document.getElementById('startBtn');
const elNext = document.getElementById('nextBtn');
const elRestart = document.getElementById('restartBtn');
const elHint = document.getElementById('hintBtn');
const elShield = document.getElementById('shieldBtn');
const elProgress = document.getElementById('progress-bar');
const elProgressLabel = document.getElementById('progress-label');
const elSceneLabel = document.getElementById('sceneLabel');
const elFeedbackMessage = document.getElementById('feedbackMessage');
const elFeedbackTitle = document.getElementById('feedbackTitle');
const elFeedbackText = document.getElementById('feedbackText');
const elGameOverOverlay = document.getElementById('gameOverOverlay');
const elFinalScore = document.getElementById('finalScore');
const elFinalCombo = document.getElementById('finalCombo');
const elRestartGameBtn = document.getElementById('restartGameBtn');
const elMainMenuBtn = document.getElementById('mainMenuBtn');
const particlesCanvas = document.getElementById('particles');
const ctx = particlesCanvas.getContext('2d');

// Resize canvas
function resizeCanvas(){
  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Partículas (chuva ácida / neon spores)
const droplets = Array.from({length: 120}, () => ({
  x: Math.random()*window.innerWidth,
  y: Math.random()*window.innerHeight,
  v: 2 + Math.random()*4,
  w: 1 + Math.random()*2,
  h: 8 + Math.random()*18,
  hue: Math.random()<0.5 ? 170 : 295
}));
function loopParticles(){
  ctx.clearRect(0,0,particlesCanvas.width, particlesCanvas.height);
  for(const d of droplets){
    ctx.fillStyle = `hsla(${d.hue}, 100%, 60%, .25)`;
    ctx.fillRect(d.x, d.y, d.w, d.h);
    d.y += d.v;
    if(d.y > particlesCanvas.height) {
      d.y = -d.h;
      d.x = Math.random()*particlesCanvas.width;
    }
  }
  requestAnimationFrame(loopParticles);
}
loopParticles();

// Progress
function updateProgress(){
  const pct = Math.floor((state.current / state.questions.length) * 100);
  elProgress.style.width = pct + '%';
  elProgressLabel.textContent = `${pct}%`;
}

// Scene label
function updateScene(){
  const q = state.questions[state.current];
  const label = q && q.ods ? `ODS: ${q.ods}` : `Setor: ${String(state.current+1).padStart(2,'0')}`;
  elSceneLabel.textContent = label;
}

// Update feedback message
function updateFeedback(title, text, type = 'neutral') {
  elFeedbackTitle.textContent = title;
  elFeedbackText.textContent = text;
  
  // Remove classes anteriores
  elFeedbackMessage.classList.remove('feedback-correct', 'feedback-wrong');
  
  // Adiciona classe baseada no tipo
  if (type === 'correct') {
    elFeedbackMessage.classList.add('feedback-correct');
  } else if (type === 'wrong') {
    elFeedbackMessage.classList.add('feedback-wrong');
  }
}

// Render question
function renderQuestion(){
  const q = state.questions[state.current];
  if(!q) return endGame();

  elQuestion.textContent = q.question;
  elOptions.innerHTML = '';
  const shuffled = q.options.map((t,i)=>({t,i})).sort(()=>Math.random()-0.5);
  shuffled.forEach(({t})=>{
    const li = document.createElement('li');
    li.textContent = t;
    li.addEventListener('click', ()=> selectOption(li, t === q.answer));
    elOptions.appendChild(li);
  });

  state.timeLeft = state.timePerQ;
  elTimer.textContent = state.timeLeft;
  state.answered = false;
  startTimer();
  updateScene();
  updateProgress();
  elNext.disabled = true;
  elHint.disabled = state.usedHint;
  elShield.disabled = state.shield>0;
  
  // Atualiza feedback para pergunta atual
  updateFeedback(
    `Pergunta ${state.current + 1}`,
    `ODS: ${q.ods}`,
    'neutral'
  );
}

// Timer
function startTimer(){
  clearInterval(state.timerId);
  state.timerId = setInterval(()=>{
    state.timeLeft--;
    elTimer.textContent = state.timeLeft;
    if(state.timeLeft <= 0){
      clearInterval(state.timerId);
      autoFail();
    }
  }, 1000);
}
function stopTimer(){
  clearInterval(state.timerId);
}

// Seleção
function selectOption(li, isCorrect){
  if(state.answered) return;
  state.answered = true;
  stopTimer();

  if(isCorrect){
    const timeBonus = Math.max(0, state.timeLeft - Math.floor(state.timePerQ/2));
    const comboBonus = (state.combo-1)*2;
    const gain = 10 + timeBonus + comboBonus;
    state.score += gain;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    li.classList.add('correct');
    
    // Feedback de acerto
    updateFeedback(
      "✓ RESPOSTA CORRETA!",
      `+${gain} pontos! | Combo: x${state.combo} | Tempo bônus: +${timeBonus}`,
      'correct'
    );

  } else {
    if(state.shield>0){
      state.shield--;
      updateFeedback(
        "🛡️ ESCUDO ATIVADO!",
        "Seu escudo protegeu você desta vez!",
        'wrong'
      );
    } else {
      state.lives--;
      document.querySelector('.question-card').classList.add('shake');
      setTimeout(()=>document.querySelector('.question-card').classList.remove('shake'), 250);
      updateFeedback(
        "✗ RESPOSTA INCORRETA",
        `-1 vida | Combo resetado | Vidas restantes: ${state.lives}`,
        'wrong'
      );
    }
    state.combo = 1;
    li.classList.add('wrong');
  }

  updateHUD();
  Array.from(elOptions.children).forEach(el=> el.style.pointerEvents='none');
  elNext.disabled = false;
}

function autoFail(){
  if(state.answered) return;
  state.answered = true;
  
  if(state.shield>0){ 
    state.shield--;
    updateFeedback(
      "🛡️ TEMPO ESGOTADO!",
      "Seu escudo protegeu você! Mas o tempo acabou.",
      'wrong'
    );
  } else { 
    state.lives--; 
    document.querySelector('.question-card').classList.add('shake');
    setTimeout(()=>document.querySelector('.question-card').classList.remove('shake'), 250);
    updateFeedback(
      "⏰ TEMPO ESGOTADO!",
      `-1 vida | Combo resetado | Vidas restantes: ${state.lives}`,
      'wrong'
    );
  }
  state.combo = 1;
  updateHUD();
  elNext.disabled = false;
}

function updateHUD(){
  elScore.textContent = state.score;
  elCombo.textContent = 'x'+state.combo;
  elLives.textContent = state.lives;
  if(state.lives<=0) showGameOver();
}

// Game Over
function showGameOver(){
  stopTimer();
  elFinalScore.textContent = state.score;
  elFinalCombo.textContent = 'x'+state.maxCombo;
  elGameOverOverlay.style.display = 'flex';
  
  // Desabilita interação com a pergunta
  elOptions.innerHTML = '';
  elQuestion.textContent = 'GAME OVER';
  Array.from(elOptions.children).forEach(el=> el.style.pointerEvents='none');
  elNext.disabled = true;
  elHint.disabled = true;
  elShield.disabled = true;
}

function hideGameOver(){
  elGameOverOverlay.style.display = 'none';
}

// Power-ups
elHint.addEventListener('click', ()=>{
  if(state.usedHint) return;
  const options = Array.from(elOptions.children);
  const q = state.questions[state.current];
  const wrongs = options.filter(li => li.textContent !== q.answer);
  wrongs.sort(()=>Math.random()-0.5).slice(0,2).forEach(li=>{
    li.style.opacity = .45;
    li.style.pointerEvents = 'none';
  });
  state.usedHint = true;
  elHint.disabled = true;
  
  updateFeedback(
    "💡 DICA ATIVADA!",
    "2 opções incorretas foram removidas",
    'neutral'
  );
});
elShield.addEventListener('click', ()=>{
  if(state.shield>0) return;
  state.shield = 1; // protege 1 erro
  elShield.disabled = true;
  
  updateFeedback(
    "🛡️ ESCUDO ATIVADO!",
    "Você está protegido contra o próximo erro",
    'neutral'
  );
});

// Navegação
elStart.addEventListener('click', startGame);
elNext.addEventListener('click', nextQuestion);
elRestart.addEventListener('click', ()=> document.location.reload());
elRestartGameBtn.addEventListener('click', restartGame);
elMainMenuBtn.addEventListener('click', ()=> document.location.reload());

function restartGame(){
  hideGameOver();
  startGame();
}

function startGame(){
  elStart.style.display = 'none';
  elRestart.style.display = 'none';
  state.current = 0;
  state.score = 0;
  state.combo = 1;
  state.maxCombo = 1;
  state.lives = 3;
  state.usedHint = false;
  state.shield = 0;
  fetchQuestions().then(()=>{
    renderQuestion();
  }).catch(err=>{
    elQuestion.textContent = 'Erro ao carregar perguntas.';
    console.error(err);
  });
  updateHUD();
  
  // Mensagem inicial
  updateFeedback(
    "🚀 INICIANDO MISSÃO",
    "Responda corretamente para acumular pontos e combos!",
    'neutral'
  );
}

function nextQuestion(){
  state.current++;
  state.usedHint = false;
  elShield.disabled = state.shield>0;
  if(state.current >= state.questions.length) endGame();
  else renderQuestion();
}

// Fim de jogo (completou todas as perguntas)
function endGame(){
  stopTimer();
  elOptions.innerHTML = '';
  elQuestion.innerHTML = `<b>Missão Concluída!</b><br/>Pontuação: ${state.score} • Máx. Combo: x${state.maxCombo}`;
  elNext.disabled = true;
  elRestart.style.display = 'inline-block';
  
  updateFeedback(
    "🎉 MISSÃO CONCLUÍDA!",
    `Você completou todas as perguntas!\nPontuação Final: ${state.score}\nCombo Máximo: x${state.maxCombo}`,
    'correct'
  );
}

// Carregar perguntas
async function fetchQuestions(){
  const res = await fetch('./questions.json');
  const data = await res.json();
  state.questions = shuffle(data);
}

// Utils
function shuffle(arr){ return arr.slice().sort(()=>Math.random()-0.5); }

// Boot
updateHUD();
updateProgress();
updateScene();
updateFeedback(
  "Bem-vindo ao Neon Wasteland",
  "Teste seus conhecimentos sobre desenvolvimento web e ajude a salvar o mundo!",
  'neutral'
);