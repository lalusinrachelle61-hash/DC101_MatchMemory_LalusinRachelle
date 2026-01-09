
(() => {
  // Emoji pool (expandable)
  const EMOJIS = ["😀","😁","😂","🤣","😎","😍","😡","😱","🐶","🐱","🐸","🐵","🌞","⭐","🍎","⚽","🎵","🚀","🍩","🍕","🌸","🌊","🔥","🍀","🦊","🦁","🐼","🦄","🐯","🐻"];

  // DOM references
  const gameContainer = document.getElementById('game');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const pairsEl = document.getElementById('pairs');
  const restartBtn = document.getElementById('restart');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const gridSelect = document.getElementById('gridSize');

  // State
  let rows = 4, cols = 4;
  let cardObjects = [];    // array of Card model objects
  let buttons = [];        // parallel array of DOM elements
  let first = null, second = null;
  let lock = false;        // prevents clicking while resolving
  let moves = 0;
  let matchedPairs = 0;
  let totalPairs = (rows * cols) / 2;
  let timerId = null;
  let elapsed = 0;
  let started = false;


  class Card {
    constructor(face, id){
      this.face = face;
      this.id = id;         
      this.revealed = false;
      this.matched = false;
    }
  }


  function shuffleArray(arr){
   
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck(r, c){
    const pairCount = (r * c) / 2;
    if (!Number.isInteger(pairCount)) throw new Error("Grid must have even number of cells");

    // pick pairCount distinct emojis
    const pool = [...EMOJIS];
    shuffleArray(pool);
    const chosen = pool.slice(0, pairCount);


    const faces = [];
    chosen.forEach(f => { faces.push(f); faces.push(f); });
    shuffleArray(faces);

  
    const deck = faces.map((face, idx) => new Card(face, 'card-' + idx));
    return deck;
  }

  function createCardElement(card){
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.dataset.id = card.id;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = '❔'; // back glyph

    const face = document.createElement('div');
    face.className = 'face';
    face.textContent = card.face;

    inner.appendChild(back);
    inner.appendChild(face);
    wrapper.appendChild(inner);

    wrapper.addEventListener('click', () => onCardClick(card, wrapper));

    return wrapper;
  }

  function renderBoard(r, c){
    // Clean
    gameContainer.innerHTML = '';
    cardObjects = buildDeck(r, c);
    buttons = [];

    // grid layout
    gameContainer.style.gridTemplateColumns = `repeat(${c}, var(--card-size))`;

    cardObjects.forEach(card => {
      const el = createCardElement(card);
      gameContainer.appendChild(el);
      buttons.push(el);
    });

 
    moves = 0;
    matchedPairs = 0;
    totalPairs = (r*c)/2;
    updateStats();


    first = second = null;
    lock = false;
    stopTimer();
    elapsed = 0;
    timeEl.textContent = '0';
    started = false;
  }

  function updateStats(){
    movesEl.textContent = moves;
    pairsEl.textContent = matchedPairs + '/' + totalPairs;
  }

  function startTimer(){
    if (timerId) return;
    timerId = setInterval(() => {
      elapsed++;
      timeEl.textContent = elapsed;
    }, 1000);
  }

  function stopTimer(){
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function onCardClick(card, el){
    if (lock) return;
    if (card.revealed || card.matched) return;

    // start timer on first user action
    if (!started){
      startTimer();
      started = true;
    }

    // reveal card
    card.revealed = true;
    el.classList.add('flipped');
    el.setAttribute('aria-pressed','true');

    if (!first){
      first = { card, el };
      return;
    }

    // second card
    second = { card, el };
    moves++;
    updateStats();

    // match check
    if (first.card.face === second.card.face){
      // mark matched
      first.card.matched = true;
      second.card.matched = true;
      first.el.classList.add('matched');
      second.el.classList.add('matched');

      // clear selection
      first = second = null;
      matchedPairs++;
      updateStats();

      // win check
      if (matchedPairs === totalPairs){
        stopTimer();
        setTimeout(() => {
          alert(`You won!\nMoves: ${moves}\nTime: ${elapsed}s`);
        }, 120);
      }
    } else {
      // not matched: lock, then hide after delay
      lock = true;
      setTimeout(() => {
        hideCard(first.card, first.el);
        hideCard(second.card, second.el);
        first = second = null;
        lock = false;
      }, 700);
    }
  }

  function hideCard(card, el){
    card.revealed = false;
    el.classList.remove('flipped');
    el.setAttribute('aria-pressed','false');
  }

  // Controls
  restartBtn.addEventListener('click', () => {
    // re-read grid size
    applyGridFromSelect();
    renderBoard(rows, cols);
  });

  shuffleBtn.addEventListener('click', () => {
    // reshuffle faces while keeping size same
    renderBoard(rows, cols);
  });

  gridSelect.addEventListener('change', () => {
    applyGridFromSelect();
    renderBoard(rows, cols);
  });

  function applyGridFromSelect(){
    const sel = gridSelect.value;
    const parts = sel.split('x').map(n => parseInt(n,10));
    if (parts.length === 2 && parts.every(Number.isInteger)){
      rows = parts[0];
      cols = parts[1];
      // ensure the grid has even number of cells; if not, fallback to 4x4
      if ((rows * cols) % 2 !== 0){
        rows = 4; cols = 4;
      }
    } else {
      rows = 4; cols = 4;
    }
    // adjust CSS variable for card size for wide grids (optional)
    // If many columns, shrink card-size to better fit
    const containerWidth = Math.min(window.innerWidth - 120, 800);
    const tentativeSize = Math.floor((containerWidth - (cols-1)*10) / cols);
    document.documentElement.style.setProperty('--card-size', `${Math.max(48, Math.min(100, tentativeSize))}px`);
  }

  // Init
  applyGridFromSelect();
  renderBoard(rows, cols);

  // expose a safe API for debug (optional)
  window.memoryMatch = {
    restart: () => renderBoard(rows,cols),
    getState: () => ({moves, matchedPairs, totalPairs, elapsed, rows, cols})
  };

})();