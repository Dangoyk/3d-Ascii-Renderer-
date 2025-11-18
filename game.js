// 3D ASCII Maze Game - JavaScript Version

class Maze {
    constructor(width = 20, height = 20) {
        this.width = width;
        this.height = height;
        // Initialize as empty (0 = empty, 1 = wall)
        this.grid = Array(height).fill(null).map(() => Array(width).fill(0));
        this.start_pos = [1, 1];
        this.end_pos = [width - 2, height - 2];
    }
    
    isWall(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
            return true;
        }
        return this.grid[iy][ix] === 1;
    }
    
    setWall(x, y, isWall) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            this.grid[iy][ix] = isWall ? 1 : 0;
        }
    }
    
    generateDefault() {
        // Create outer walls
        for (let x = 0; x < this.width; x++) {
            this.setWall(x, 0, true);
            this.setWall(x, this.height - 1, true);
        }
        for (let y = 0; y < this.height; y++) {
            this.setWall(0, y, true);
            this.setWall(this.width - 1, y, true);
        }
        
        // Create some internal walls
        for (let i = 5; i < 15; i++) {
            this.setWall(i, 5, true);
            this.setWall(i, 15, true);
        }
        for (let i = 5; i < 15; i++) {
            this.setWall(5, i, true);
            this.setWall(15, i, true);
        }
        
        // Create openings
        this.setWall(10, 5, false);
        this.setWall(10, 15, false);
        this.setWall(5, 10, false);
        this.setWall(15, 10, false);
    }
    
    save() {
        const data = {
            width: this.width,
            height: this.height,
            grid: this.grid,
            start_pos: this.start_pos,
            end_pos: this.end_pos
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maze.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    load(data) {
        this.width = data.width;
        this.height = data.height;
        this.grid = data.grid;
        this.start_pos = data.start_pos;
        this.end_pos = data.end_pos;
    }
}

class Player {
    constructor(x, y, angle = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.fov = Math.PI / 3; // 60 degrees
        this.moveSpeed = 0.05;
        this.rotateSpeed = 0.05;
    }
    
    normalizeAngle() {
        // Normalize angle to 0-2π range
        while (this.angle < 0) {
            this.angle += Math.PI * 2;
        }
        while (this.angle >= Math.PI * 2) {
            this.angle -= Math.PI * 2;
        }
    }
    
    moveForward(maze, distance) {
        const newX = this.x + Math.cos(this.angle) * distance;
        const newY = this.y + Math.sin(this.angle) * distance;
        if (!maze.isWall(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY)) {
            this.y = newY;
        }
    }
    
    moveBackward(maze, distance) {
        const newX = this.x - Math.cos(this.angle) * distance;
        const newY = this.y - Math.sin(this.angle) * distance;
        if (!maze.isWall(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY)) {
            this.y = newY;
        }
    }
    
    strafeLeft(maze, distance) {
        const newX = this.x + Math.cos(this.angle - Math.PI / 2) * distance;
        const newY = this.y + Math.sin(this.angle - Math.PI / 2) * distance;
        if (!maze.isWall(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY)) {
            this.y = newY;
        }
    }
    
    strafeRight(maze, distance) {
        const newX = this.x + Math.cos(this.angle + Math.PI / 2) * distance;
        const newY = this.y + Math.sin(this.angle + Math.PI / 2) * distance;
        if (!maze.isWall(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY)) {
            this.y = newY;
        }
    }
}

class Renderer {
    constructor(canvas, width = 800, height = 600) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.depth = 16;
        this.shades = " .:-=+*#%@";
        this.asciiMode = false; // Toggle for pure ASCII rendering
        
        // Set up canvas
        canvas.width = width;
        canvas.height = height;
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    castRay(maze, startX, startY, rayAngle, playerAngle) {
        const dx = Math.cos(rayAngle);
        const dy = Math.sin(rayAngle);
        
        let x = startX;
        let y = startY;
        const stepSize = 0.01;
        const maxDistance = this.depth;
        
        for (let i = 0; i < maxDistance / stepSize; i++) {
            x += dx * stepSize;
            y += dy * stepSize;
            
            if (maze.isWall(x, y)) {
                const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
                return distance * Math.cos(rayAngle - playerAngle);
            }
        }
        
        return maxDistance;
    }
    
    render3D(maze, player) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const numColumns = Math.floor(this.width / 10); // Adjust column count based on width
        const columnWidth = this.width / numColumns;
        const charHeight = 12; // Height for ASCII characters
        
        for (let col = 0; col < numColumns; col++) {
            const rayAngle = player.angle - player.fov / 2 + (col / numColumns) * player.fov;
            const distance = this.castRay(maze, player.x, player.y, rayAngle, player.angle);
            
            const wallHeight = Math.min(this.height / (distance + 0.0001), this.height);
            const ceiling = (this.height - wallHeight) / 2;
            
            if (this.asciiMode) {
                // Pure ASCII mode - no colors, just white characters on black
                this.ctx.fillStyle = '#fff';
                
                // Draw ceiling with spaces
                for (let row = 0; row < ceiling; row += charHeight) {
                    this.ctx.fillText(' ', col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
                
                // Draw wall with ASCII characters based on distance
                const shadeIdx = Math.min(Math.floor((distance / this.depth) * (this.shades.length - 1)), this.shades.length - 1);
                const shade = this.shades[shadeIdx];
                
                // Fill wall with ASCII characters (multiple rows for better coverage)
                for (let row = ceiling; row < ceiling + wallHeight; row += charHeight) {
                    this.ctx.fillText(shade, col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
                
                // Draw floor with dots
                for (let row = ceiling + wallHeight; row < this.height; row += charHeight) {
                    this.ctx.fillText('.', col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
            } else {
                // Colored mode (original)
                // Draw ceiling
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(col * columnWidth, 0, columnWidth, ceiling);
                
                // Draw wall
                const shadeIdx = Math.min(Math.floor((distance / this.depth) * (this.shades.length - 1)), this.shades.length - 1);
                const shade = this.shades[shadeIdx];
                const brightness = 1 - (distance / this.depth) * 0.7;
                this.ctx.fillStyle = `rgba(0, 255, 136, ${brightness})`;
                this.ctx.fillRect(col * columnWidth, ceiling, columnWidth, wallHeight);
                
                // Draw wall pattern (ASCII-like)
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + distance / this.depth * 0.3})`;
                this.ctx.fillText(shade, col * columnWidth + columnWidth / 2, ceiling + wallHeight / 2);
                
                // Draw floor
                this.ctx.fillStyle = `rgba(45, 45, 68, ${brightness * 0.5})`;
                this.ctx.fillRect(col * columnWidth, ceiling + wallHeight, columnWidth, this.height - ceiling - wallHeight);
            }
        }
    }
    
    renderMinimap(maze, player, canvas, size = 200) {
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        
        const cellSize = size / Math.max(maze.width, maze.height);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        
        // Draw maze
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (maze.isWall(x, y)) {
                    ctx.fillStyle = '#00ff88';
                } else {
                    ctx.fillStyle = '#1a1a2e';
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        // Draw player
        ctx.fillStyle = '#ff0088';
        ctx.beginPath();
        ctx.arc(player.x * cellSize, player.y * cellSize, cellSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.strokeStyle = '#ff0088';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x * cellSize, player.y * cellSize);
        ctx.lineTo(
            player.x * cellSize + Math.cos(player.angle) * cellSize * 2,
            player.y * cellSize + Math.sin(player.angle) * cellSize * 2
        );
        ctx.stroke();
    }
}

class Editor {
    constructor(maze, canvas) {
        this.maze = maze;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cursorX = 1;
        this.cursorY = 1;
        this.mode = 'draw';
        this.cellSize = 600 / Math.max(maze.width, maze.height);
        
        canvas.width = 600;
        canvas.height = 600;
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cellSize = this.cellSize;
        
        // Draw grid
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                if (this.maze.isWall(x, y)) {
                    this.ctx.fillStyle = '#00ff88';
                } else {
                    this.ctx.fillStyle = '#1a1a2e';
                }
                this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                
                // Grid lines
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        // Draw cursor
        this.ctx.fillStyle = this.mode === 'draw' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 136, 0.5)';
        this.ctx.fillRect(this.cursorX * cellSize, this.cursorY * cellSize, cellSize, cellSize);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.cursorX * cellSize, this.cursorY * cellSize, cellSize, cellSize);
    }
    
    toggleCell() {
        if (this.mode === 'draw') {
            this.maze.setWall(this.cursorX, this.cursorY, true);
        } else {
            this.maze.setWall(this.cursorX, this.cursorY, false);
        }
    }
    
    moveCursor(dx, dy) {
        this.cursorX = Math.max(0, Math.min(this.maze.width - 1, this.cursorX + dx));
        this.cursorY = Math.max(0, Math.min(this.maze.height - 1, this.cursorY + dy));
    }
    
    handleClick(x, y, gameInstance) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const cellX = Math.floor(canvasX / this.cellSize);
        const cellY = Math.floor(canvasY / this.cellSize);
        
        if (cellX >= 0 && cellX < this.maze.width && cellY >= 0 && cellY < this.maze.height) {
            this.cursorX = cellX;
            this.cursorY = cellY;
            this.toggleCell();
            if (gameInstance) {
                gameInstance.updateEditorUI();
            }
        }
    }
}

class Game {
    constructor() {
        this.maze = new Maze(20, 20);
        this.player = new Player(1.5, 1.5);
        this.gameCanvas = document.getElementById('gameCanvas');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.editorCanvas = document.getElementById('editorCanvas');
        this.renderer = new Renderer(this.gameCanvas, 800, 600);
        this.editor = new Editor(this.maze, this.editorCanvas);
        this.mode = 'game';
        this.keys = {};
        this.lastTime = 0;
        this.lastModeToggle = 0;
        this.modeToggleDelay = 300; // 300ms delay between mode toggles
        this.lastEditorMove = 0;
        this.editorMoveDelay = 100; // 100ms delay between editor cursor moves
        this.isFullscreen = false;
        this.mainView = document.getElementById('main-view');
        
        this.maze.generateDefault();
        this.setupEventListeners();
        this.gameLoop();
        
        // Initialize player angle normalization
        this.player.normalizeAngle();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const keyCode = e.key;
            
            // Handle arrow keys
            if (keyCode === 'ArrowLeft') {
                e.preventDefault();
                this.keys['arrowleft'] = true;
            } else if (keyCode === 'ArrowRight') {
                e.preventDefault();
                this.keys['arrowright'] = true;
            } else if (keyCode === 'ArrowUp') {
                e.preventDefault();
                this.keys['arrowup'] = true;
            } else if (keyCode === 'ArrowDown') {
                e.preventDefault();
                this.keys['arrowdown'] = true;
            }
            
            // Prevent default for game keys to avoid browser shortcuts
            if (['w', 'a', 's', 'd', 'q', 'e', 'm', 'f'].includes(key)) {
                e.preventDefault();
            }
            this.keys[key] = true;
            
            // Fullscreen toggle
            if (key === 'f' && this.mode === 'game') {
                this.toggleFullscreen();
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                // Exit fullscreen if in fullscreen
                if (this.isFullscreen) {
                    this.exitFullscreen();
                } else if (this.mode === 'game') {
                    this.player.x = this.maze.start_pos[0] + 0.5;
                    this.player.y = this.maze.start_pos[1] + 0.5;
                    this.player.angle = 0;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const keyCode = e.key;
            
            // Handle arrow keys
            if (keyCode === 'ArrowLeft') {
                this.keys['arrowleft'] = false;
            } else if (keyCode === 'ArrowRight') {
                this.keys['arrowright'] = false;
            } else if (keyCode === 'ArrowUp') {
                this.keys['arrowup'] = false;
            } else if (keyCode === 'ArrowDown') {
                this.keys['arrowdown'] = false;
            }
            
            this.keys[key] = false;
        });
        
        // Clear all keys when window loses focus to prevent stuck keys
        window.addEventListener('blur', () => {
            this.keys = {};
        });
        
        // Also clear keys on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.keys = {};
            }
        });
        
        // Fullscreen button
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // ASCII mode toggle
        document.getElementById('ascii-mode-toggle').addEventListener('change', (e) => {
            this.renderer.asciiMode = e.target.checked;
        });
        
        // Editor canvas click
        this.editorCanvas.addEventListener('click', (e) => {
            if (this.mode === 'editor') {
                this.editor.handleClick(e.clientX, e.clientY, this);
            }
        });
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenUI();
            this.resizeCanvas();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.isFullscreen = !!document.webkitFullscreenElement;
            this.updateFullscreenUI();
            this.resizeCanvas();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.isFullscreen = !!document.mozFullScreenElement;
            this.updateFullscreenUI();
            this.resizeCanvas();
        });
        
        document.addEventListener('MSFullscreenChange', () => {
            this.isFullscreen = !!document.msFullscreenElement;
            this.updateFullscreenUI();
            this.resizeCanvas();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isFullscreen) {
                this.resizeCanvas();
            }
        });
        
        // Editor buttons
        document.getElementById('draw-mode-btn').addEventListener('click', () => {
            this.editor.mode = 'draw';
            this.updateEditorUI();
        });
        
        document.getElementById('erase-mode-btn').addEventListener('click', () => {
            this.editor.mode = 'erase';
            this.updateEditorUI();
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.maze.save();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        
        document.getElementById('file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        this.maze.load(data);
                        this.player.x = this.maze.start_pos[0] + 0.5;
                        this.player.y = this.maze.start_pos[1] + 0.5;
                        this.editor = new Editor(this.maze, this.editorCanvas);
                        alert('Maze loaded successfully!');
                    } catch (error) {
                        alert('Error loading maze: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    handleInput() {
        const now = Date.now();
        
        if (this.mode === 'game') {
            if (this.keys['w'] || this.keys['arrowup']) this.player.moveForward(this.maze, this.player.moveSpeed);
            if (this.keys['s'] || this.keys['arrowdown']) this.player.moveBackward(this.maze, this.player.moveSpeed);
            if (this.keys['a']) this.player.strafeLeft(this.maze, this.player.moveSpeed);
            if (this.keys['d']) this.player.strafeRight(this.maze, this.player.moveSpeed);
            // Rotation with Q/E or Arrow keys
            if (this.keys['q'] || this.keys['arrowleft']) {
                this.player.angle -= this.player.rotateSpeed;
                this.player.normalizeAngle();
            }
            if (this.keys['e'] || this.keys['arrowright']) {
                this.player.angle += this.player.rotateSpeed;
                this.player.normalizeAngle();
            }
            
            // Debounce mode toggle
            if (this.keys['m'] && (now - this.lastModeToggle) > this.modeToggleDelay) {
                this.mode = 'editor';
                this.lastModeToggle = now;
                this.keys['m'] = false; // Clear the key to prevent rapid toggling
                this.updateUI();
            }
        } else if (this.mode === 'editor') {
            // Debounce editor cursor movement
            if ((now - this.lastEditorMove) > this.editorMoveDelay) {
                let moved = false;
                if (this.keys['w']) {
                    this.editor.moveCursor(0, -1);
                    moved = true;
                    this.updateEditorUI();
                } else if (this.keys['s']) {
                    this.editor.moveCursor(0, 1);
                    moved = true;
                    this.updateEditorUI();
                } else if (this.keys['a']) {
                    this.editor.moveCursor(-1, 0);
                    moved = true;
                    this.updateEditorUI();
                } else if (this.keys['d']) {
                    this.editor.moveCursor(1, 0);
                    moved = true;
                    this.updateEditorUI();
                }
                
                if (moved) {
                    this.lastEditorMove = now;
                }
            }
            
            // Debounce mode toggle
            if (this.keys['m'] && (now - this.lastModeToggle) > this.modeToggleDelay) {
                this.mode = 'game';
                this.lastModeToggle = now;
                this.keys['m'] = false; // Clear the key to prevent rapid toggling
                this.updateUI();
            }
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = this.mainView;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            // Fallback: use CSS fullscreen
            this.mainView.classList.add('fullscreen');
            this.isFullscreen = true;
            this.updateFullscreenUI();
            this.resizeCanvas();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            // Fallback: remove CSS fullscreen
            this.mainView.classList.remove('fullscreen');
            this.isFullscreen = false;
            this.updateFullscreenUI();
            this.resizeCanvas();
        }
    }
    
    updateFullscreenUI() {
        const btn = document.getElementById('fullscreen-btn');
        if (this.isFullscreen) {
            btn.textContent = '⛶';
            btn.title = 'Exit Fullscreen';
        } else {
            btn.textContent = '⛶';
            btn.title = 'Toggle Fullscreen';
        }
    }
    
    resizeCanvas() {
        if (this.isFullscreen) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.gameCanvas.width = width;
            this.gameCanvas.height = height;
            this.renderer.width = width;
            this.renderer.height = height;
        } else {
            this.gameCanvas.width = 800;
            this.gameCanvas.height = 600;
            this.renderer.width = 800;
            this.renderer.height = 600;
        }
    }
    
    updateUI() {
        const modeText = document.getElementById('mode-text');
        const editorContainer = document.getElementById('editor-container');
        
        if (this.mode === 'game') {
            modeText.textContent = 'GAME MODE';
            editorContainer.style.display = 'none';
        } else {
            modeText.textContent = 'EDITOR MODE';
            editorContainer.style.display = 'block';
        }
    }
    
    updateEditorUI() {
        const drawBtn = document.getElementById('draw-mode-btn');
        const eraseBtn = document.getElementById('erase-mode-btn');
        const editorMode = document.getElementById('editor-mode');
        const cursorPos = document.getElementById('cursor-pos');
        
        if (this.editor.mode === 'draw') {
            drawBtn.classList.add('active');
            eraseBtn.classList.remove('active');
        } else {
            drawBtn.classList.remove('active');
            eraseBtn.classList.add('active');
        }
        
        editorMode.textContent = this.editor.mode.toUpperCase();
        cursorPos.textContent = `${this.editor.cursorX}, ${this.editor.cursorY}`;
    }
    
    render() {
        if (this.mode === 'game') {
            this.renderer.render3D(this.maze, this.player);
            this.renderer.renderMinimap(this.maze, this.player, this.minimapCanvas);
            
            // Update info
            document.getElementById('position').textContent = 
                `(${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)})`;
            document.getElementById('angle').textContent = 
                `${(this.player.angle * 180 / Math.PI).toFixed(1)}°`;
        } else {
            this.editor.render();
            this.updateEditorUI();
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.handleInput();
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

