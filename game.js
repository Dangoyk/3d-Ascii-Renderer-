// 3D ASCII Maze Game - JavaScript Version

class Maze {
    constructor(width = 20, height = 20) {
        this.width = width;
        this.height = height;
        // Initialize as empty (0 = empty, 1 = wall, 2 = ramp)
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
    
    isRamp(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
            return false;
        }
        return this.grid[iy][ix] === 2;
    }
    
    getCellType(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
            return 1; // Wall
        }
        return this.grid[iy][ix];
    }
    
    setWall(x, y, isWall) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            if (isWall) {
                this.grid[iy][ix] = 1;
            } else {
                // Only clear if it's currently a wall
                if (this.grid[iy][ix] === 1) {
                    this.grid[iy][ix] = 0;
                }
            }
        }
    }
    
    setRamp(x, y, isRamp) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
            if (isRamp) {
                this.grid[iy][ix] = 2;
            } else {
                // Only clear if it's currently a ramp
                if (this.grid[iy][ix] === 2) {
                    this.grid[iy][ix] = 0;
                }
            }
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
        // Block movement on walls and ramps (ramps raise you up)
        if (!maze.isWall(newX, this.y) && !maze.isRamp(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY) && !maze.isRamp(this.x, newY)) {
            this.y = newY;
        }
    }
    
    moveBackward(maze, distance) {
        const newX = this.x - Math.cos(this.angle) * distance;
        const newY = this.y - Math.sin(this.angle) * distance;
        if (!maze.isWall(newX, this.y) && !maze.isRamp(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY) && !maze.isRamp(this.x, newY)) {
            this.y = newY;
        }
    }
    
    strafeLeft(maze, distance) {
        const newX = this.x + Math.cos(this.angle - Math.PI / 2) * distance;
        const newY = this.y + Math.sin(this.angle - Math.PI / 2) * distance;
        if (!maze.isWall(newX, this.y) && !maze.isRamp(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY) && !maze.isRamp(this.x, newY)) {
            this.y = newY;
        }
    }
    
    strafeRight(maze, distance) {
        const newX = this.x + Math.cos(this.angle + Math.PI / 2) * distance;
        const newY = this.y + Math.sin(this.angle + Math.PI / 2) * distance;
        if (!maze.isWall(newX, this.y) && !maze.isRamp(newX, this.y)) {
            this.x = newX;
        }
        if (!maze.isWall(this.x, newY) && !maze.isRamp(this.x, newY)) {
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
        // Extended shades for better gradient
        this.asciiShades = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
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
            
            const cellType = maze.getCellType(x, y);
            if (cellType === 1) { // Wall
                const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
                return { distance: distance * Math.cos(rayAngle - playerAngle), type: 1 };
            } else if (cellType === 2) { // Ramp
                const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
                return { distance: distance * Math.cos(rayAngle - playerAngle), type: 2 };
            }
        }
        
        return { distance: maxDistance, type: 0 };
    }
    
    render3D(maze, player) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const numColumns = Math.floor(this.width / 10); // Adjust column count based on width
        const columnWidth = this.width / numColumns;
        const charHeight = 10; // Reduced for better coverage
        
        for (let col = 0; col < numColumns; col++) {
            const rayAngle = player.angle - player.fov / 2 + (col / numColumns) * player.fov;
            const hit = this.castRay(maze, player.x, player.y, rayAngle, player.angle);
            const distance = hit.distance;
            const hitType = hit.type;
            
            const wallHeight = Math.min(this.height / (distance + 0.0001), this.height);
            const ceiling = (this.height - wallHeight) / 2;
            
            if (this.asciiMode) {
                // ASCII mode with color gradient
                const normalizedDist = Math.min(distance / this.depth, 1);
                const shadeIdx = Math.floor(normalizedDist * (this.asciiShades.length - 1));
                const shade = this.asciiShades[shadeIdx];
                
                // Calculate brightness for color gradient (0-1)
                const brightness = 1 - normalizedDist * 0.8;
                
                // Use grayscale gradient for ASCII mode
                const grayValue = Math.floor(brightness * 255);
                this.ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                
                // Draw ceiling
                for (let row = 0; row < ceiling; row += charHeight) {
                    this.ctx.fillText(' ', col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
                
                // Draw wall/ramp with ASCII characters
                const wallChar = hitType === 2 ? '^' : shade; // Use ^ for ramps
                for (let row = Math.floor(ceiling); row < Math.floor(ceiling + wallHeight); row += charHeight) {
                    this.ctx.fillText(wallChar, col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
                
                // Draw floor with gradient
                for (let row = Math.floor(ceiling + wallHeight); row < this.height; row += charHeight) {
                    const floorDist = (row - ceiling - wallHeight) / (this.height - ceiling - wallHeight);
                    const floorBrightness = brightness * (1 - floorDist * 0.5);
                    const floorGray = Math.floor(floorBrightness * 200);
                    this.ctx.fillStyle = `rgb(${floorGray}, ${floorGray}, ${floorGray})`;
                    this.ctx.fillText('.', col * columnWidth + columnWidth / 2, row + charHeight / 2);
                }
            } else {
                // Colored mode (original)
                // Draw ceiling
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(col * columnWidth, 0, columnWidth, ceiling);
                
                // Draw wall/ramp
                const shadeIdx = Math.min(Math.floor((distance / this.depth) * (this.shades.length - 1)), this.shades.length - 1);
                const shade = this.shades[shadeIdx];
                const brightness = 1 - (distance / this.depth) * 0.7;
                
                // Different color for ramps
                if (hitType === 2) {
                    this.ctx.fillStyle = `rgba(255, 200, 0, ${brightness})`; // Yellow/orange for ramps
                } else {
                    this.ctx.fillStyle = `rgba(0, 255, 136, ${brightness})`;
                }
                this.ctx.fillRect(col * columnWidth, ceiling, columnWidth, wallHeight);
                
                // Draw wall pattern (ASCII-like)
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + distance / this.depth * 0.3})`;
                const patternChar = hitType === 2 ? '^' : shade;
                this.ctx.fillText(patternChar, col * columnWidth + columnWidth / 2, ceiling + wallHeight / 2);
                
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
                const cellType = maze.getCellType(x, y);
                if (cellType === 1) {
                    ctx.fillStyle = '#00ff88'; // Wall
                } else if (cellType === 2) {
                    ctx.fillStyle = '#ffaa00'; // Ramp
                } else {
                    ctx.fillStyle = '#1a1a2e'; // Empty
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
        this.cursorX = 1;
        this.cursorY = 1;
        this.mode = 'draw';
        this.cellSize = 600 / Math.max(maze.width, maze.height);
        this.isDragging = false;
        this.lastPaintX = -1;
        this.lastPaintY = -1;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // Set canvas dimensions first (this clears the canvas)
        canvas.width = 600;
        canvas.height = 600;
        
        // Get context AFTER setting dimensions (setting width/height resets context)
        this.ctx = canvas.getContext('2d');
        
        // Save initial state
        this.saveState();
        
        // Initial render
        this.render();
    }
    
    saveState() {
        // Save current maze state for undo/redo
        const state = {
            grid: this.maze.grid.map(row => [...row]),
            width: this.maze.width,
            height: this.maze.height
        };
        
        // Remove any states after current index (when undoing then making new changes)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }
    
    restoreState(state) {
        this.maze.grid = state.grid.map(row => [...row]);
        this.maze.width = state.width;
        this.maze.height = state.height;
        this.render();
    }
    
    render() {
        // Ensure canvas context is valid
        if (!this.ctx || !this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        
        // Ensure cellSize is valid
        if (!this.cellSize || this.cellSize <= 0 || !isFinite(this.cellSize)) {
            this.cellSize = 600 / Math.max(this.maze.width, this.maze.height);
        }
        
        const cellSize = this.cellSize;
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const cellType = this.maze.getCellType(x, y);
                const drawX = x * cellSize;
                const drawY = y * cellSize;
                
                if (cellType === 1) {
                    this.ctx.fillStyle = '#00ff88'; // Wall - green
                } else if (cellType === 2) {
                    this.ctx.fillStyle = '#ffaa00'; // Ramp - orange
                } else {
                    this.ctx.fillStyle = '#1a1a2e'; // Empty
                }
                this.ctx.fillRect(drawX, drawY, cellSize, cellSize);
                
                // Draw ramp indicator
                if (cellType === 2) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = `${Math.max(8, cellSize * 0.6)}px monospace`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('^', drawX + cellSize / 2, drawY + cellSize / 2);
                }
                
                // Grid lines
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(drawX, drawY, cellSize, cellSize);
            }
        }
        
        // Draw cursor
        const cursorX = this.cursorX * cellSize;
        const cursorY = this.cursorY * cellSize;
        
        if (this.mode === 'draw') {
            this.ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        } else if (this.mode === 'ramp') {
            this.ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
        } else {
            this.ctx.fillStyle = 'rgba(255, 0, 136, 0.5)';
        }
        this.ctx.fillRect(cursorX, cursorY, cellSize, cellSize);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cursorX, cursorY, cellSize, cellSize);
        
        // Reset font after drawing
        this.ctx.font = '10px monospace';
    }
    
    toggleCell(saveState = true) {
        // Ensure valid coordinates
        if (this.cursorX < 0 || this.cursorX >= this.maze.width || 
            this.cursorY < 0 || this.cursorY >= this.maze.height) {
            return;
        }
        
        if (this.mode === 'draw') {
            this.maze.setWall(this.cursorX, this.cursorY, true);
            this.maze.setRamp(this.cursorX, this.cursorY, false);
        } else if (this.mode === 'ramp') {
            this.maze.setRamp(this.cursorX, this.cursorY, true);
            this.maze.setWall(this.cursorX, this.cursorY, false);
        } else {
            // Erase mode - clear both wall and ramp
            this.maze.grid[this.cursorY][this.cursorX] = 0;
        }
        
        if (saveState) {
            this.saveState();
        }
        // Re-render after change
        this.render();
    }
    
    moveCursor(dx, dy) {
        this.cursorX = Math.max(0, Math.min(this.maze.width - 1, this.cursorX + dx));
        this.cursorY = Math.max(0, Math.min(this.maze.height - 1, this.cursorY + dy));
        // Re-render to update cursor position
        this.render();
    }
    
    handleClick(x, y, gameInstance) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        // Ensure cellSize is valid
        if (!this.cellSize || this.cellSize <= 0) {
            this.cellSize = 600 / Math.max(this.maze.width, this.maze.height);
        }
        
        const cellX = Math.floor(canvasX / this.cellSize);
        const cellY = Math.floor(canvasY / this.cellSize);
        
        if (cellX >= 0 && cellX < this.maze.width && cellY >= 0 && cellY < this.maze.height) {
            this.cursorX = cellX;
            this.cursorY = cellY;
            this.toggleCell();
            this.lastPaintX = cellX;
            this.lastPaintY = cellY;
            if (gameInstance) {
                gameInstance.updateEditorUI();
            }
        }
    }
    
    handleMouseDown(x, y, gameInstance) {
        this.isDragging = true;
        this.handleClick(x, y, gameInstance);
    }
    
    handleMouseMove(x, y, gameInstance) {
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const canvasX = x - rect.left;
            const canvasY = y - rect.top;
            
            // Ensure cellSize is valid
            if (!this.cellSize || this.cellSize <= 0) {
                this.cellSize = 600 / Math.max(this.maze.width, this.maze.height);
            }
            
            const cellX = Math.floor(canvasX / this.cellSize);
            const cellY = Math.floor(canvasY / this.cellSize);
            
            if (cellX >= 0 && cellX < this.maze.width && cellY >= 0 && cellY < this.maze.height) {
                // Only paint if we moved to a different cell
                if (cellX !== this.lastPaintX || cellY !== this.lastPaintY) {
                    this.cursorX = cellX;
                    this.cursorY = cellY;
                    this.toggleCell(false); // Don't save state for each drag cell
                    this.lastPaintX = cellX;
                    this.lastPaintY = cellY;
                    // Re-render after change
                    this.render();
                    if (gameInstance) {
                        gameInstance.updateEditorUI();
                    }
                }
            }
        }
    }
    
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.saveState(); // Save state after drag is complete
            this.render(); // Re-render after drag
        }
    }
    
    clearMaze() {
        // Clear all walls and ramps except outer border
        for (let y = 1; y < this.maze.height - 1; y++) {
            for (let x = 1; x < this.maze.width - 1; x++) {
                this.maze.setWall(x, y, false);
                this.maze.setRamp(x, y, false);
            }
        }
        this.saveState();
        this.render();
    }
    
    resetMaze() {
        // Reset to default maze
        this.maze.generateDefault();
        this.saveState();
        this.render();
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
        
        // Editor mode button
        document.getElementById('editor-mode-btn').addEventListener('click', () => {
            this.mode = 'editor';
            this.updateUI();
        });
        
        // Close editor button
        document.getElementById('close-editor-btn').addEventListener('click', () => {
            this.mode = 'game';
            this.updateUI();
        });
        
        // Close editor when clicking overlay background
        const editorOverlay = document.getElementById('editor-modal-overlay');
        editorOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'editor-modal-overlay') {
                this.mode = 'game';
                this.updateUI();
            }
        });
        
        // Prevent clicks inside editor container from closing modal
        document.getElementById('editor-container').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Editor canvas interactions
        this.editorCanvas.addEventListener('mousedown', (e) => {
            if (this.mode === 'editor') {
                e.stopPropagation(); // Prevent closing modal
                this.editor.handleMouseDown(e.clientX, e.clientY, this);
            }
        });
        
        this.editorCanvas.addEventListener('mousemove', (e) => {
            if (this.mode === 'editor') {
                e.stopPropagation();
                this.editor.handleMouseMove(e.clientX, e.clientY, this);
            }
        });
        
        this.editorCanvas.addEventListener('mouseup', (e) => {
            if (this.mode === 'editor') {
                e.stopPropagation();
                this.editor.handleMouseUp();
            }
        });
        
        this.editorCanvas.addEventListener('mouseleave', (e) => {
            if (this.mode === 'editor') {
                e.stopPropagation();
                this.editor.handleMouseUp();
            }
        });
        
        // Editor canvas click (fallback)
        this.editorCanvas.addEventListener('click', (e) => {
            if (this.mode === 'editor') {
                e.stopPropagation();
                if (!this.editor.isDragging) {
                    this.editor.handleClick(e.clientX, e.clientY, this);
                }
            }
        });
        
        // Drag and drop for file loading
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
                this.loadMazeFile(file);
            } else {
                alert('Please drop a valid JSON file');
            }
        });
        
        dropZone.addEventListener('click', () => {
            document.getElementById('file-input').click();
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
        
        document.getElementById('ramp-mode-btn').addEventListener('click', () => {
            this.editor.mode = 'ramp';
            this.updateEditorUI();
        });
        
        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Clear all walls? (This cannot be undone)')) {
                this.editor.clearMaze();
                this.updateEditorUI();
            }
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Reset to default maze? (This cannot be undone)')) {
                this.editor.resetMaze();
                this.player.x = this.maze.start_pos[0] + 0.5;
                this.player.y = this.maze.start_pos[1] + 0.5;
                this.updateEditorUI();
            }
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            if (this.editor.undo()) {
                this.updateEditorUI();
            }
        });
        
        document.getElementById('redo-btn').addEventListener('click', () => {
            if (this.editor.redo()) {
                this.updateEditorUI();
            }
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
                this.loadMazeFile(file);
            }
        });
        
        // Keyboard shortcuts for editor
        document.addEventListener('keydown', (e) => {
            if (this.mode === 'editor') {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        if (this.editor.undo()) {
                            this.updateEditorUI();
                        }
                    } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                        e.preventDefault();
                        if (this.editor.redo()) {
                            this.updateEditorUI();
                        }
                    } else if (e.key === 's') {
                        e.preventDefault();
                        this.maze.save();
                    }
                } else if (e.key === ' ') {
                    e.preventDefault();
                    this.editor.toggleCell();
                    this.updateEditorUI();
                }
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
                this.mode = this.mode === 'game' ? 'editor' : 'game';
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
        const editorOverlay = document.getElementById('editor-modal-overlay');
        const editorModeBtn = document.getElementById('editor-mode-btn');
        
        if (this.mode === 'game') {
            modeText.textContent = 'GAME MODE';
            editorOverlay.style.display = 'none';
            editorModeBtn.style.display = 'block';
        } else {
            modeText.textContent = 'EDITOR MODE';
            editorOverlay.style.display = 'flex';
            editorModeBtn.style.display = 'block';
            // Force render when opening editor
            this.editor.render();
        }
    }
    
    loadMazeFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.maze.load(data);
                this.player.x = this.maze.start_pos[0] + 0.5;
                this.player.y = this.maze.start_pos[1] + 0.5;
                
                // Update existing editor instead of creating new one
                this.editor.maze = this.maze;
                this.editor.cellSize = 600 / Math.max(this.maze.width, this.maze.height);
                this.editor.cursorX = Math.min(1, this.maze.width - 1);
                this.editor.cursorY = Math.min(1, this.maze.height - 1);
                this.editor.history = [];
                this.editor.historyIndex = -1;
                // Re-get context after loading (in case canvas was reset)
                this.editor.ctx = this.editorCanvas.getContext('2d');
                this.editor.saveState(); // Save initial state
                this.editor.render(); // Render the loaded maze
                
                // Reset file input so it can be used again
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.value = '';
                }
                
                this.updateEditorUI();
                // Show success message
                const dropZone = document.getElementById('drop-zone');
                const originalText = dropZone.querySelector('.drop-zone-text').textContent;
                dropZone.querySelector('.drop-zone-text').textContent = '✓ Maze loaded!';
                setTimeout(() => {
                    dropZone.querySelector('.drop-zone-text').textContent = originalText;
                }, 2000);
            } catch (error) {
                alert('Error loading maze: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    updateEditorUI() {
        const drawBtn = document.getElementById('draw-mode-btn');
        const eraseBtn = document.getElementById('erase-mode-btn');
        const rampBtn = document.getElementById('ramp-mode-btn');
        const editorMode = document.getElementById('editor-mode');
        const cursorPos = document.getElementById('cursor-pos');
        const historyCount = document.getElementById('history-count');
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        // Reset all buttons
        drawBtn.classList.remove('active');
        eraseBtn.classList.remove('active');
        rampBtn.classList.remove('active');
        
        // Activate current mode
        if (this.editor.mode === 'draw') {
            drawBtn.classList.add('active');
        } else if (this.editor.mode === 'ramp') {
            rampBtn.classList.add('active');
        } else {
            eraseBtn.classList.add('active');
        }
        
        editorMode.textContent = this.editor.mode.toUpperCase();
        cursorPos.textContent = `${this.editor.cursorX}, ${this.editor.cursorY}`;
        historyCount.textContent = this.editor.historyIndex + 1;
        
        // Update undo/redo button states
        undoBtn.disabled = this.editor.historyIndex <= 0;
        redoBtn.disabled = this.editor.historyIndex >= this.editor.history.length - 1;
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
        } else if (this.mode === 'editor') {
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

