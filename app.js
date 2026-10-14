/**
 * CYBERTAC - NEON CYBERPUNK TIC-TAC-TOE ENGINE
 * Features:
 * - Local 2-Player (Pass & Play)
 * - AI Opponent (Easy / Unbeatable Minimax)
 * - Pure Web Audio API Sound Synthesizer (No external audio files needed)
 * - Canvas Confetti Celebration Engine
 * - Smooth Turn Animations & Win Detection
 */

(function () {
  'use strict';

  // --- Winning Combinations on a 3x3 Grid ---
  const WINNING_COMBOS = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal TL to BR
    [2, 4, 6]  // Diagonal TR to BL
  ];

  // --- Game State ---
  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameMode = 'pvp'; // 'pvp' | 'ai'
  let aiDifficulty = 'easy'; // 'easy' | 'hard'
  let isGameOver = false;
  let isAiThinking = false;
  let soundEnabled = true;

  const scores = {
    X: 0,
    O: 0,
    tie: 0
  };

  // --- DOM Elements ---
  const cells = document.querySelectorAll('.cell');
  const boardEl = document.getElementById('board');
  const statusText = document.getElementById('status-text');
  const statusIndicator = document.getElementById('status-indicator');
  const scoreCardX = document.getElementById('score-card-x');
  const scoreCardO = document.getElementById('score-card-o');
  const scoreCardTie = document.getElementById('score-card-tie');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTieEl = document.getElementById('score-tie');
  const nameXEl = document.getElementById('name-x');
  const nameOEl = document.getElementById('name-o');

  // Controls
  const modePvpBtn = document.getElementById('mode-pvp-btn');
  const modeAiBtn = document.getElementById('mode-ai-btn');
  const difficultyWrapper = document.getElementById('difficulty-wrapper');
  const diffEasyBtn = document.getElementById('diff-easy-btn');
  const diffHardBtn = document.getElementById('diff-hard-btn');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  // Actions
  const restartRoundBtn = document.getElementById('restart-round-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  // Modal
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalNextBtn = document.getElementById('modal-next-btn');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  // --- Web Audio API Synthesizer ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  function playMoveSound(player) {
    if (player === 'X') {
      playTone(520, 0.12, 'triangle', 0.15);
    } else {
      playTone(390, 0.12, 'sine', 0.15);
    }
  }

  function playWinSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'triangle', 0.2), i * 110);
      });
    } catch (e) {}
  }

  function playTieSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      playTone(220, 0.25, 'sawtooth', 0.12);
      setTimeout(() => playTone(180, 0.35, 'sawtooth', 0.12), 150);
    } catch (e) {}
  }

  // --- Confetti Engine ---
  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#00f0ff', '#ff007f', '#fbee35', '#ffffff', '#7928ca'];
    for (let i = 0; i < 90; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        r: Math.random() * 6 + 4,
        d: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 3,
        alpha: 1
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
      p.tiltAngle += p.tiltAngleInc;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // friction
      p.alpha -= 0.012; // fade out

      if (p.alpha > 0) {
        alive = true;
        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(0, p.alpha);
        confettiCtx.beginPath();
        confettiCtx.lineWidth = p.r;
        confettiCtx.strokeStyle = p.color;
        confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        confettiCtx.stroke();
        confettiCtx.restore();
      }
    });

    if (alive) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // --- Game Flow & Interactions ---

  function updateTurnUI() {
    if (isGameOver) return;

    // Update Banner Text
    if (gameMode === 'ai' && currentPlayer === 'O') {
      statusText.textContent = "AI IS COMPUTING...";
      statusIndicator.style.backgroundColor = 'var(--pink)';
      statusIndicator.style.boxShadow = '0 0 10px var(--pink)';
    } else {
      const pName = currentPlayer === 'X' ? nameXEl.textContent : nameOEl.textContent;
      statusText.textContent = `${pName}'S TURN (${currentPlayer})`;
      const colorVar = currentPlayer === 'X' ? 'var(--cyan)' : 'var(--pink)';
      statusIndicator.style.backgroundColor = colorVar;
      statusIndicator.style.boxShadow = `0 0 10px ${colorVar}`;
    }

    // Active score-card glow
    if (currentPlayer === 'X') {
      scoreCardX.classList.add('active-turn');
      scoreCardO.classList.remove('active-turn');
    } else {
      scoreCardO.classList.add('active-turn');
      scoreCardX.classList.remove('active-turn');
    }

    // Update Ghost Hover Previews
    cells.forEach(cell => {
      cell.classList.remove('preview-x', 'preview-o');
      if (!cell.classList.contains('taken') && !isGameOver && !isAiThinking) {
        cell.classList.add(currentPlayer === 'X' ? 'preview-x' : 'preview-o');
      }
    });
  }

  function handleCellClick(e) {
    initAudio();
    const cell = e.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'), 10);

    if (board[index] !== '' || isGameOver || isAiThinking) {
      return;
    }

    makeMove(index, currentPlayer);

    // If Mode is AI and game is still ongoing, trigger AI turn
    if (gameMode === 'ai' && !isGameOver && currentPlayer === 'O') {
      isAiThinking = true;
      updateTurnUI();
      // Realistic brief delay for cyberpunk feel
      setTimeout(makeAiMove, 450);
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    cell.classList.remove('preview-x', 'preview-o');
    playMoveSound(player);

    const winCombo = checkWin(board, player);
    if (winCombo) {
      handleWin(player, winCombo);
    } else if (board.every(cellVal => cellVal !== '')) {
      handleTie();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateTurnUI();
    }
  }

  function checkWin(currentBoard, player) {
    for (let combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] === player &&
        currentBoard[b] === player &&
        currentBoard[c] === player
      ) {
        return combo;
      }
    }
    return null;
  }

  function handleWin(winner, combo) {
    isGameOver = true;
    isAiThinking = false;
    scores[winner]++;
    updateScoresUI();
    playWinSound();
    triggerConfetti();

    // Highlight winning cells
    combo.forEach(idx => cells[idx].classList.add('winner'));

    const winnerName = winner === 'X' ? nameXEl.textContent : nameOEl.textContent;
    statusText.textContent = `${winnerName} VICTORIOUS!`;

    // Show Winner Modal
    const modalCard = modalOverlay.querySelector('.modal-card');
    modalCard.classList.remove('winner-pink', 'tie-round');
    if (winner === 'O') modalCard.classList.add('winner-pink');

    modalBadge.textContent = 'SYSTEM OVERRIDE';
    modalBadge.style.color = winner === 'X' ? 'var(--cyan)' : 'var(--pink)';
    modalBadge.style.background = winner === 'X' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 127, 0.15)';
    modalTitle.innerHTML = `<span class="${winner === 'X' ? 'neon-cyan' : 'neon-pink'}">${winnerName}</span> WINS!`;
    modalDesc.textContent = gameMode === 'ai' && winner === 'O' 
      ? 'The AI outcalculated every move. Can you reclaim victory?' 
      : 'Superior tactical precision. Grid secured!';

    setTimeout(() => {
      modalOverlay.classList.add('active');
    }, 700);
  }

  function handleTie() {
    isGameOver = true;
    isAiThinking = false;
    scores.tie++;
    updateScoresUI();
    playTieSound();

    statusText.textContent = 'STALEMATE - DRAW!';
    statusIndicator.style.backgroundColor = 'var(--yellow)';
    statusIndicator.style.boxShadow = '0 0 10px var(--yellow)';

    const modalCard = modalOverlay.querySelector('.modal-card');
    modalCard.classList.remove('winner-pink');
    modalCard.classList.add('tie-round');

    modalBadge.textContent = 'GRID LOCKED';
    modalBadge.style.color = 'var(--yellow)';
    modalBadge.style.background = 'rgba(251, 238, 53, 0.15)';
    modalTitle.innerHTML = '<span style="color: var(--yellow);">DRAW!</span>';
    modalDesc.textContent = 'Equal forces collided. No victor emerged from the arena.';

    setTimeout(() => {
      modalOverlay.classList.add('active');
    }, 700);
  }

  function updateScoresUI() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreTieEl.textContent = scores.tie;
  }

  // --- AI Logic (Easy vs Unbeatable Minimax) ---
  function makeAiMove() {
    if (isGameOver) {
      isAiThinking = false;
      return;
    }

    let moveIndex;
    if (aiDifficulty === 'easy') {
      moveIndex = getEasyAiMove();
    } else {
      moveIndex = getBestMinimaxMove(board);
    }

    isAiThinking = false;
    if (moveIndex !== undefined && moveIndex !== -1) {
      makeMove(moveIndex, 'O');
    }
  }

  // Easy AI: Makes smart instant wins/blocks, else picks randomly
  function getEasyAiMove() {
    const available = board
      .map((val, idx) => (val === '' ? idx : null))
      .filter(val => val !== null);

    // 1. Can AI win immediately?
    for (let idx of available) {
      const tempBoard = [...board];
      tempBoard[idx] = 'O';
      if (checkWin(tempBoard, 'O')) return idx;
    }

    // 2. Can AI block player from winning immediately?
    for (let idx of available) {
      const tempBoard = [...board];
      tempBoard[idx] = 'X';
      if (checkWin(tempBoard, 'X')) return idx;
    }

    // 3. Otherwise pick random open cell
    return available[Math.floor(Math.random() * available.length)];
  }

  // Unbeatable Minimax AI
  function getBestMinimaxMove(currentBoard) {
    let bestScore = -Infinity;
    let move = -1;

    const available = currentBoard
      .map((val, idx) => (val === '' ? idx : null))
      .filter(val => val !== null);

    // Fast-path: if center is open, grab it
    if (currentBoard[4] === '') return 4;

    for (let idx of available) {
      currentBoard[idx] = 'O';
      let score = minimax(currentBoard, 0, false, -Infinity, Infinity);
      currentBoard[idx] = '';
      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    }
    return move;
  }

  function minimax(currentBoard, depth, isMaximizing, alpha, beta) {
    if (checkWin(currentBoard, 'O')) return 10 - depth;
    if (checkWin(currentBoard, 'X')) return depth - 10;
    if (currentBoard.every(cell => cell !== '')) return 0;

    const available = currentBoard
      .map((val, idx) => (val === '' ? idx : null))
      .filter(val => val !== null);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let idx of available) {
        currentBoard[idx] = 'O';
        let evalScore = minimax(currentBoard, depth + 1, false, alpha, beta);
        currentBoard[idx] = '';
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let idx of available) {
        currentBoard[idx] = 'X';
        let evalScore = minimax(currentBoard, depth + 1, true, alpha, beta);
        currentBoard[idx] = '';
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // --- Reset & Control Functions ---

  function resetRound() {
    modalOverlay.classList.remove('active');
    board = Array(9).fill('');
    isGameOver = false;
    isAiThinking = false;
    currentPlayer = 'X';

    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });

    updateTurnUI();
  }

  function resetAll() {
    scores.X = 0;
    scores.O = 0;
    scores.tie = 0;
    updateScoresUI();
    resetRound();
  }

  function setGameMode(mode) {
    if (gameMode === mode) return;
    gameMode = mode;

    if (mode === 'pvp') {
      modePvpBtn.classList.add('active');
      modeAiBtn.classList.remove('active');
      difficultyWrapper.style.display = 'none';
      nameXEl.textContent = 'PLAYER 1';
      nameOEl.textContent = 'PLAYER 2';
    } else {
      modeAiBtn.classList.add('active');
      modePvpBtn.classList.remove('active');
      difficultyWrapper.style.display = 'flex';
      nameXEl.textContent = 'YOU (X)';
      nameOEl.textContent = `AI BOT (${aiDifficulty === 'hard' ? 'UNBEATABLE' : 'EASY'})`;
    }

    resetAll();
  }

  function setDifficulty(diff) {
    if (aiDifficulty === diff) return;
    aiDifficulty = diff;

    if (diff === 'easy') {
      diffEasyBtn.classList.add('active');
      diffHardBtn.classList.remove('active');
      if (gameMode === 'ai') nameOEl.textContent = 'AI BOT (EASY)';
    } else {
      diffHardBtn.classList.add('active');
      diffEasyBtn.classList.remove('active');
      if (gameMode === 'ai') nameOEl.textContent = 'AI BOT (UNBEATABLE)';
    }

    resetRound();
  }

  function toggleAudio() {
    soundEnabled = !soundEnabled;
    audioIcon.textContent = soundEnabled ? '🔊' : '🔇';
    audioToggleBtn.title = soundEnabled ? 'Sound Enabled' : 'Sound Muted';
    if (soundEnabled) initAudio();
  }

  // --- Event Listeners ---
  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  restartRoundBtn.addEventListener('click', resetRound);
  resetAllBtn.addEventListener('click', resetAll);
  modalNextBtn.addEventListener('click', resetRound);

  modePvpBtn.addEventListener('click', () => setGameMode('pvp'));
  modeAiBtn.addEventListener('click', () => setGameMode('ai'));
  diffEasyBtn.addEventListener('click', () => setDifficulty('easy'));
  diffHardBtn.addEventListener('click', () => setDifficulty('hard'));
  audioToggleBtn.addEventListener('click', toggleAudio);

  // Initialize
  updateTurnUI();
  updateScoresUI();
})();
