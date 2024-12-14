const readline = require('readline');
const fs = require('fs');
const path = '/sdcard/Download/riwayat.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const width = process.stdout.columns || 40;
let height = process.stdout.rows || 15;
height = Math.min(height, 21);

let snake = [{ x: Math.floor(width / 4), y: Math.floor(height / 2) }];
let food = { x: Math.floor(Math.random() * (width - 2)) + 1, y: Math.floor(Math.random() * (height - 2)) + 1 };
let direction = { x: 1, y: 0 };
let gameOver = false;
let score = 0;
let level = 1;
let intervalSpeed = 150;
let inputQueue = [];
let player = { name: 'DIZGAME', password: 'DIZGAMEDEV', highScore: 0 };

rl.input.on('keypress', (str, key) => {
  inputQueue.push(key.name);
});

function loadHistory() {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, 'utf-8') || '[]');
  }
  return [];
}

function saveHistory(history) {
  fs.writeFileSync(path, JSON.stringify(history, null, 2));
}

function requestLogin(callback) {
  rl.question('NAMA KEY : ', (name) => {
    rl.question('PASSWORD KEY : ', (password) => {
      if (name === player.name && password === player.password) {
        console.log(`\x1b[32mDIZ GAME BY ${name}! LOGIN BERHASIL\x1b[0m`);
        const history = loadHistory();
        const existingPlayer = history.find(p => p.name === name);
        if (existingPlayer) {
          player.highScore = existingPlayer.highScore;
        } else {
          history.push(player);
          saveHistory(history);
        }
        console.log(`\x1b[33mHigh Score Anda: ${player.highScore}\x1b[0m`);
        callback();
      } else {
        console.log('\x1b[31mNama atau Password salah. Akses ditolak!\x1b[0m');
        rl.close();
      }
    });
  });
}

function updateScore() {
  const history = loadHistory();
  const existingPlayer = history.find(p => p.name === player.name);
  if (existingPlayer && score > existingPlayer.highScore) {
    existingPlayer.highScore = score;
    console.log(`\x1b[32m🎉NEW SCORE🎉 (${score}) OTW DAPET SC NIH\x1b[0m`);
  }
  saveHistory(history);
}

function drawBoard() {
  let board = '';
  if (score >= 1000) {
    board += '\x1b[33mYANG BERHASIL DAPAT SCORE 1000 MAKA DAPAT HADIAH SCRIPT PRIVATE GRATIS\x1b[0m\n';
  }
  board += '\x1b[44m' + '─'.repeat(width) + '\x1b[0m\n';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1) {
        board += '\x1b[34m│\x1b[0m';
      } else if (x === food.x && y === food.y) {
        board += '\x1b[35m●\x1b[0m';
      } else if (isSnake(x, y)) {
        board += '\x1b[32m■\x1b[0m';
      } else {
        board += ' ';
      }
    }
    board += '\n';
  }
  board += '\x1b[37m' + '─'.repeat(width) + '\x1b[0m\n';
  board += `\x1b[32mSCORE: ${score}  LEVEL: ${level}  SCORE TERTINGGI : ${player.highScore}\nDAPAT SCORE 5K DAPAT HADIAH SCRIPT PRIVATE GRATIS\x1b[0m\n`;
  process.stdout.write(board);
}

function isSnake(x, y) {
  return snake.some(segment => segment.x === x && segment.y === y);
}

function updateSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0) head.x = width - 2;
  if (head.x >= width) head.x = 1;
  if (head.y < 0) head.y = height - 2;
  if (head.y >= height) head.y = 1;
  if (isSnake(head.x, head.y)) {
    gameOver = true;
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = { x: Math.floor(Math.random() * (width - 2)) + 1, y: Math.floor(Math.random() * (height - 2)) + 1 };
    if (score % 5 === 0) {
      level++;
      intervalSpeed = Math.max(50, intervalSpeed - 10);
    }
  } else {
    snake.pop();
  }
}

function processInput() {
  if (inputQueue.length > 0) {
    const key = inputQueue.shift();
    if (key === 'up' && direction.y !== 1) direction = { x: 0, y: -1 };
    if (key === 'down' && direction.y !== -1) direction = { x: 0, y: 1 };
    if (key === 'left' && direction.x !== 1) direction = { x: -1, y: 0 };
    if (key === 'right' && direction.x !== -1) direction = { x: 1, y: 0 };
  }
}

function gameLoop() {
  if (gameOver) {
    console.log('\x1b[31m\nWKWK GAGAL DAPET SC PRIVATE GRATIS\x1b[0m');
    updateScore();
    rl.close();
    return;
  }
  processInput();
  updateSnake();
  drawBoard();
  setTimeout(gameLoop, intervalSpeed);
}

requestLogin(() => {
  gameLoop();
});