// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let score = 0;
let gravity = 0.5;
let velocity = 0;
let birdY = 300;
let birdX = 100;
const birdSize = 20;
const pipeWidth = 60;
const pipeGap = 150;
let pipes = [];
let animationId;

// Bird properties
const bird = {
    x: birdX,
    y: birdY,
    size: birdSize,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8
};

// Initialize pipes
function initPipes() {
    pipes = [];
    for (let i = 0; i < 3; i++) {
        pipes.push({
            x: canvas.width + (i * 300),
            topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
            passed: false
        });
    }
}

// Draw bird
function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + 8, bird.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(bird.x - 5, bird.y + 5, 8, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.size, bird.y);
    ctx.lineTo(bird.x + bird.size + 8, bird.y - 3);
    ctx.lineTo(bird.x + bird.size + 8, bird.y + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        const bottomPipeY = pipe.topHeight + pipeGap;
        ctx.fillRect(pipe.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY);
        
        // Pipe borders
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeRect(pipe.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY);
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, bottomPipeY, pipeWidth + 10, 20);
    });
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 100 + Date.now() * 0.01) % (canvas.width + 100) - 50;
        const y = 50 + Math.sin(i) * 20;
        drawCloud(x, y);
    }
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 10);
}

// Draw cloud
function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 15, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= 2;
        
        // Check if bird passed pipe
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
    });
    
    // Remove off-screen pipes and add new ones
    if (pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        pipes.push({
            x: pipes[pipes.length - 1].x + 300,
            topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
            passed: false
        });
    }
    
    // Check collisions
    checkCollisions();
}

// Check for collisions
function checkCollisions() {
    // Ground collision
    if (bird.y + bird.size > canvas.height - 30) {
        gameOver();
        return;
    }
    
    // Ceiling collision
    if (bird.y - bird.size < 0) {
        gameOver();
        return;
    }
    
    // Pipe collisions
    pipes.forEach(pipe => {
        if (bird.x + bird.size > pipe.x && bird.x - bird.size < pipe.x + pipeWidth) {
            if (bird.y - bird.size < pipe.topHeight || bird.y + bird.size > pipe.topHeight + pipeGap) {
                gameOver();
                return;
            }
        }
    });
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    cancelAnimationFrame(animationId);
}

// Restart game
function restartGame() {
    score = 0;
    bird.y = 300;
    bird.velocity = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('gameOver').style.display = 'none';
    initPipes();
    gameRunning = true;
    gameLoop();
}

// Jump function
function jump() {
    if (!gameRunning) {
        restartGame();
        return;
    }
    bird.velocity = bird.jumpPower;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Draw everything
function draw() {
    drawBackground();
    drawPipes();
    drawBird();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Initialize game
function init() {
    initPipes();
    draw();
}

// Start the game
init(); 