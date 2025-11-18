# 3D ASCII Maze Game

A retro-style 3D maze game rendered using raycasting technology. Navigate through mazes in first-person perspective, view your position on a minimap, and create custom mazes with the built-in editor.

**🌐 Web Version Available!** Play directly in your browser - no installation required!

## Features

- **3D Raycasting Engine**: Experience a 3D perspective rendered with raycasting
- **First-Person Navigation**: Move through mazes with WASD controls
- **Minimap**: Real-time top-down view of the maze showing your position
- **Maze Editor**: Built-in editor to create, edit, save, and load custom mazes
- **Smooth Movement**: Strafe left/right, move forward/backward, and rotate your view
- **Wall Shading**: Distance-based shading for depth perception
- **Web-Ready**: Fully playable in modern web browsers

## 🚀 Quick Start (Web Version)

### Option 1: Play Online (Vercel)

The game is ready to deploy to Vercel! Simply:

1. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Or use Vercel Dashboard:**
   - Push your code to GitHub
   - Import the repository in [Vercel Dashboard](https://vercel.com)
   - Vercel will automatically detect and deploy the static site

3. **Play locally:**
   ```bash
   # Using Python's built-in server
   python -m http.server 8000
   
   # Or using Node.js serve
   npx serve .
   
   # Then open http://localhost:8000 in your browser
   ```

### Option 2: Python Terminal Version

For the original terminal-based version:

1. Make sure you have Python 3.7 or higher installed
2. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the game:
   ```bash
   python maze_game.py
   ```

**Note**: On Windows, you may need to run the script as Administrator for the `keyboard` library to work properly.

## Controls

### Game Mode

- **W** - Move forward
- **S** - Move backward
- **A** - Strafe left
- **D** - Strafe right
- **Q** - Rotate left
- **E** - Rotate right
- **M** - Switch to editor mode
- **ESC** - Reset position (web) / Quit (terminal)

### Editor Mode

- **W/A/S/D** - Move cursor
- **Click** - Toggle wall/empty at cursor position (web)
- **Space** - Toggle wall/empty (terminal)
- **Draw/Erase Buttons** - Switch between draw and erase modes (web)
- **E** - Switch to erase mode (terminal)
- **R** - Switch to draw mode (terminal)
- **Save Button** - Save maze to `maze.json` (web)
- **Ctrl+S** - Save maze (terminal)
- **Load Button** - Load maze from file (web)
- **Ctrl+L** - Load maze (terminal)
- **M** - Switch back to game mode

## Game Modes

### Game Mode
Navigate through the 3D maze in first-person view. The main screen shows a 3D perspective rendered using raycasting, while a minimap displays your current position and the maze layout from above.

### Editor Mode
Create and customize your own mazes! Use the cursor to navigate the grid and toggle cells between walls and empty spaces. You can save your creations and load them later.

## Technical Details

- **Rendering**: Raycasting algorithm for 3D perspective
- **Web Version**: HTML5 Canvas with JavaScript
- **Terminal Version**: ASCII rendering in terminal
- **Field of View**: 60 degrees
- **Depth**: 16 units maximum view distance
- **Maze Format**: JSON files for easy editing and sharing

## File Structure

```
.
├── index.html          # Web version - Main HTML file
├── style.css           # Web version - Styling
├── game.js             # Web version - Game logic
├── maze_game.py        # Terminal version - Main game file
├── requirements.txt    # Python dependencies
├── package.json        # Node.js package info (for Vercel)
├── vercel.json         # Vercel configuration
└── README.md           # This file
```

## Deployment to Vercel

### Method 1: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the static site configuration
6. Click "Deploy"

### Method 3: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload your project folder
4. Vercel will automatically configure and deploy

The game will be available at `https://your-project-name.vercel.app`

## Customization

### Web Version (`game.js`)

- **Maze size**: Change `new Maze(width, height)` in the `Game` constructor
- **Canvas resolution**: Modify `new Renderer(canvas, width, height)`
- **Player speed**: Adjust `moveSpeed` and `rotateSpeed` in the `Player` class
- **Field of view**: Change `fov` in the `Player` class
- **Render depth**: Modify `depth` in the `Renderer` class

### Terminal Version (`maze_game.py`)

- **Maze size**: Change `Maze(width, height)` in the `Game.__init__` method
- **Screen resolution**: Modify `Renderer(width, height)` 
- **Player speed**: Adjust `move_speed` and `rotate_speed` in the `Player` class
- **Field of view**: Change `fov` in the `Player` class
- **Render depth**: Modify `depth` in the `Renderer` class

## Tips

- The minimap shows your position with a red dot (web) or `@` symbol (terminal)
- Walls are represented by `#` in the editor and minimap
- Darker colors/characters in the 3D view indicate walls further away
- Make sure to create a path from start to finish in your custom mazes!
- In the web version, you can click directly on the editor canvas to toggle cells

## Requirements

### Web Version
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser!

### Terminal Version
- Python 3.7+
- keyboard (for input handling)
- colorama (for Windows terminal support)

## Troubleshooting

### Web Version
- **Game not loading**: Check browser console for errors (F12)
- **Controls not working**: Make sure the game canvas has focus (click on it)
- **Maze not saving**: Check browser download permissions

### Terminal Version
- **Input not working on Windows**: Run the script as Administrator
- **Screen flickering**: This is normal due to terminal clearing; consider using a terminal with better performance
- **Maze not loading**: Ensure `maze.json` exists and is in the same directory

## Browser Compatibility

The web version works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (with touch controls - coming soon)

## License

Free to use and modify for personal projects.

## Credits

Built with JavaScript (web) and Python (terminal) using raycasting techniques inspired by classic 3D games like Wolfenstein 3D.
