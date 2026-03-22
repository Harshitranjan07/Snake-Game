const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = 20;

let snake = [{ x: 10, y: 10 }];
let direction = 'RIGHT';
let newDirection = 'RIGHT';
let food = { x: 15, y: 10 };
let score = 0;
let gameSpeed = 140;

// 🎵 Sounds (LOW VOLUME)
const eatSound = new Audio("munch.mp3");
eatSound.volume = 0.3;

const gameOverSound = new Audio("tf_nemesis.mp3");
gameOverSound.volume = 0.3;

const bgMusic = new Audio("subway_surfer.mp3");
bgMusic.volume = 0.2;
bgMusic.loop = true;

// 🔇 Mute state
let isMuted = false;

// 🏆 High Score
let highScore = localStorage.getItem("highScore") || 0;

// 🔘 Mute Button
const muteBtn = document.createElement("button");
muteBtn.innerText = "🔊";
muteBtn.style.position = "absolute";
muteBtn.style.top = "20px";
muteBtn.style.right = "20px";
muteBtn.style.padding = "10px";
muteBtn.style.fontSize = "18px";
muteBtn.style.cursor = "pointer";
document.body.appendChild(muteBtn);

// 🔁 Toggle Mute
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;

  eatSound.muted = isMuted;
  gameOverSound.muted = isMuted;
  bgMusic.muted = isMuted;

  muteBtn.innerText = isMuted ? "🔇" : "🔊";
});

// 🔓 Start background music after user interaction
document.addEventListener('keydown', () => {
  bgMusic.play().catch(() => {});
}, { once: true });

function draw() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = '#2a2a2a';
  for (let i = 0; i < tileCount; i++) {
    for (let j = 0; j < tileCount; j++) {
      ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
    }
  }

  // Snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#00ffcc' : '#00ff00';
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Food
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize - 2,
    gridSize - 2
  );

  // Score
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High: " + highScore, 10, 40);
}

function move() {
  direction = newDirection;

  let head = { ...snake[0] };

  if (direction === 'UP') head.y--;
  if (direction === 'DOWN') head.y++;
  if (direction === 'LEFT') head.x--;
  if (direction === 'RIGHT') head.x++;

  snake.unshift(head);

  // 🍎 Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    if (score % 5 === 0 && gameSpeed > 80) {
      gameSpeed -= 5;
    }

    placeFood();
  } else {
    snake.pop();
  }
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') newDirection = 'UP';
  if (event.key === 'ArrowDown' && direction !== 'UP') newDirection = 'DOWN';
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') newDirection = 'LEFT';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') newDirection = 'RIGHT';
}

function checkCollision() {
  const head = snake[0];

  // Wall
  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount
  ) return true;

  // Self
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y)
      return true;
  }

  return false;
}

// 🍎 Safe food spawn
function placeFood() {
  let valid = false;

  while (!valid) {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
  }
}

function gameLoop() {
  move();

  if (checkCollision()) {
    // 🎵 Stop background music
    bgMusic.pause();
    bgMusic.currentTime = 0;

    // 🎵 Game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    // High score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    setTimeout(() => {
      alert('Game Over! Score: ' + score);

      // Reset
      snake = [{ x: 10, y: 10 }];
      direction = 'RIGHT';
      newDirection = 'RIGHT';
      score = 0;
      gameSpeed = 140;
      placeFood();

      // 🎵 Restart music if not muted
      if (!isMuted) {
        bgMusic.play().catch(() => {});
      }

    }, 100);

    return;
  }

  draw();
  setTimeout(gameLoop, gameSpeed);
}

// Start game
placeFood();
gameLoop();