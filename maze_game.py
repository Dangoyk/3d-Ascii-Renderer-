#!/usr/bin/env python3
"""
3D ASCII Maze Game
A raycasting-based 3D maze game rendered in ASCII with minimap and editor.
"""

import os
import sys
import math
import json
from typing import List, Tuple, Optional

try:
    import keyboard
    import colorama
    from colorama import Fore, Back, Style
    colorama.init()
except ImportError:
    print("Please install required packages: pip install keyboard colorama")
    sys.exit(1)


class Maze:
    """Represents a 2D maze grid."""
    
    def __init__(self, width: int = 20, height: int = 20):
        self.width = width
        self.height = height
        self.grid = [[1 for _ in range(width)] for _ in range(height)]
        self.start_pos = (1, 1)
        self.end_pos = (width - 2, height - 2)
        
    def is_wall(self, x: int, y: int) -> bool:
        """Check if position is a wall."""
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return True
        return self.grid[int(y)][int(x)] == 1
    
    def set_wall(self, x: int, y: int, is_wall: bool):
        """Set a cell to wall or empty."""
        if 0 <= x < self.width and 0 <= y < self.height:
            self.grid[int(y)][int(x)] = 1 if is_wall else 0
    
    def save(self, filename: str):
        """Save maze to file."""
        data = {
            'width': self.width,
            'height': self.height,
            'grid': self.grid,
            'start_pos': self.start_pos,
            'end_pos': self.end_pos
        }
        with open(filename, 'w') as f:
            json.dump(data, f)
    
    def load(self, filename: str):
        """Load maze from file."""
        with open(filename, 'r') as f:
            data = json.load(f)
        self.width = data['width']
        self.height = data['height']
        self.grid = data['grid']
        self.start_pos = tuple(data['start_pos'])
        self.end_pos = tuple(data['end_pos'])


class Player:
    """Represents the player in the maze."""
    
    def __init__(self, x: float, y: float, angle: float = 0.0):
        self.x = x
        self.y = y
        self.angle = angle  # in radians
        self.fov = math.pi / 3  # 60 degrees
        self.move_speed = 0.05
        self.rotate_speed = 0.05
    
    def move_forward(self, maze: Maze, distance: float):
        """Move player forward."""
        new_x = self.x + math.cos(self.angle) * distance
        new_y = self.y + math.sin(self.angle) * distance
        if not maze.is_wall(int(new_x), int(self.y)):
            self.x = new_x
        if not maze.is_wall(int(self.x), int(new_y)):
            self.y = new_y
    
    def move_backward(self, maze: Maze, distance: float):
        """Move player backward."""
        new_x = self.x - math.cos(self.angle) * distance
        new_y = self.y - math.sin(self.angle) * distance
        if not maze.is_wall(int(new_x), int(self.y)):
            self.x = new_x
        if not maze.is_wall(int(self.x), int(new_y)):
            self.y = new_y
    
    def strafe_left(self, maze: Maze, distance: float):
        """Strafe left."""
        new_x = self.x + math.cos(self.angle - math.pi/2) * distance
        new_y = self.y + math.sin(self.angle - math.pi/2) * distance
        if not maze.is_wall(int(new_x), int(self.y)):
            self.x = new_x
        if not maze.is_wall(int(self.x), int(new_y)):
            self.y = new_y
    
    def strafe_right(self, maze: Maze, distance: float):
        """Strafe right."""
        new_x = self.x + math.cos(self.angle + math.pi/2) * distance
        new_y = self.y + math.sin(self.angle + math.pi/2) * distance
        if not maze.is_wall(int(new_x), int(self.y)):
            self.x = new_x
        if not maze.is_wall(int(self.x), int(new_y)):
            self.y = new_y


class Renderer:
    """Handles 3D ASCII rendering using raycasting."""
    
    def __init__(self, width: int = 80, height: int = 24):
        self.width = width
        self.height = height
        self.depth = 16
        self.shades = " .:-=+*#%@"
    
    def cast_ray(self, maze: Maze, start_x: float, start_y: float, ray_angle: float, player_angle: float) -> float:
        """Cast a ray and return distance to wall."""
        dx = math.cos(ray_angle)
        dy = math.sin(ray_angle)
        
        x, y = start_x, start_y
        step_size = 0.01
        max_distance = self.depth
        
        for _ in range(int(max_distance / step_size)):
            x += dx * step_size
            y += dy * step_size
            
            if maze.is_wall(int(x), int(y)):
                distance = math.sqrt((x - start_x)**2 + (y - start_y)**2)
                # Fix fisheye effect by correcting for viewing angle
                return distance * math.cos(ray_angle - player_angle)
        
        return max_distance
    
    def render_3d(self, maze: Maze, player: Player) -> List[str]:
        """Render 3D view using raycasting."""
        screen = []
        
        for col in range(self.width):
            # Calculate ray angle
            ray_angle = player.angle - player.fov / 2 + (col / self.width) * player.fov
            
            # Cast ray
            distance = self.cast_ray(maze, player.x, player.y, ray_angle, player.angle)
            
            # Calculate wall height
            wall_height = int(self.height / (distance + 0.0001))
            wall_height = min(wall_height, self.height)
            
            # Calculate ceiling and floor
            ceiling = (self.height - wall_height) // 2
            floor = self.height - ceiling - wall_height
            
            # Build column
            column = []
            for row in range(self.height):
                if row < ceiling:
                    # Ceiling
                    column.append(' ')
                elif row < ceiling + wall_height:
                    # Wall
                    shade_idx = int((distance / self.depth) * (len(self.shades) - 1))
                    shade_idx = min(shade_idx, len(self.shades) - 1)
                    column.append(self.shades[shade_idx])
                else:
                    # Floor
                    column.append('.')
            
            screen.append(column)
        
        # Transpose to get rows
        rows = []
        for row in range(self.height):
            rows.append(''.join([screen[col][row] for col in range(self.width)]))
        
        return rows
    
    def render_minimap(self, maze: Maze, player: Player, size: int = 15) -> List[str]:
        """Render top-down minimap."""
        lines = []
        # Scale down the maze to fit in the minimap
        scale_x = size / maze.width
        scale_y = size / maze.height
        
        for y in range(size):
            line = []
            for x in range(size):
                # Convert minimap coordinates to maze coordinates
                maze_x = int(x / scale_x)
                maze_y = int(y / scale_y)
                
                # Check if this is player position (with some tolerance)
                player_map_x = int(player.x * scale_x)
                player_map_y = int(player.y * scale_y)
                
                if abs(x - player_map_x) <= 1 and abs(y - player_map_y) <= 1:
                    line.append('@')
                elif maze.is_wall(maze_x, maze_y):
                    line.append('#')
                else:
                    line.append(' ')
            lines.append(''.join(line))
        
        return lines


class Editor:
    """Maze editor for creating and editing mazes."""
    
    def __init__(self, maze: Maze):
        self.maze = maze
        self.cursor_x = 1
        self.cursor_y = 1
        self.mode = 'draw'  # 'draw' or 'erase'
    
    def render(self) -> List[str]:
        """Render editor view."""
        lines = []
        lines.append("=== MAZE EDITOR ===")
        lines.append(f"Mode: {self.mode.upper()} | Cursor: ({self.cursor_x}, {self.cursor_y})")
        lines.append("WASD: Move | Space: Toggle | E: Erase mode | R: Draw mode | Ctrl+S: Save | Ctrl+L: Load | M: Game | ESC: Quit")
        lines.append("")
        
        # Render maze with cursor
        for y in range(self.maze.height):
            line = []
            for x in range(self.maze.width):
                if x == self.cursor_x and y == self.cursor_y:
                    line.append('X')
                elif self.maze.is_wall(x, y):
                    line.append('#')
                else:
                    line.append(' ')
            lines.append(''.join(line))
        
        return lines
    
    def toggle_cell(self):
        """Toggle current cell between wall and empty."""
        is_wall = self.maze.is_wall(self.cursor_x, self.cursor_y)
        self.maze.set_wall(self.cursor_x, self.cursor_y, not is_wall)
    
    def move_cursor(self, dx: int, dy: int):
        """Move editor cursor."""
        self.cursor_x = max(0, min(self.maze.width - 1, self.cursor_x + dx))
        self.cursor_y = max(0, min(self.maze.height - 1, self.cursor_y + dy))


class Game:
    """Main game class."""
    
    def __init__(self):
        self.maze = Maze(20, 20)
        self.player = Player(1.5, 1.5)
        self.renderer = Renderer(80, 24)
        self.editor = Editor(self.maze)
        self.mode = 'game'  # 'game' or 'editor'
        self.running = True
        self.generate_default_maze()
    
    def generate_default_maze(self):
        """Generate a simple default maze."""
        # Create outer walls
        for x in range(self.maze.width):
            self.maze.set_wall(x, 0, True)
            self.maze.set_wall(x, self.maze.height - 1, True)
        for y in range(self.maze.height):
            self.maze.set_wall(0, y, True)
            self.maze.set_wall(self.maze.width - 1, y, True)
        
        # Create some internal walls
        for i in range(5, 15):
            self.maze.set_wall(i, 5, True)
            self.maze.set_wall(i, 15, True)
        for i in range(5, 15):
            self.maze.set_wall(5, i, True)
            self.maze.set_wall(15, i, True)
        
        # Create openings
        self.maze.set_wall(10, 5, False)
        self.maze.set_wall(10, 15, False)
        self.maze.set_wall(5, 10, False)
        self.maze.set_wall(15, 10, False)
    
    def clear_screen(self):
        """Clear terminal screen."""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def render(self):
        """Render current view."""
        self.clear_screen()
        
        if self.mode == 'game':
            # Render 3D view
            view_3d = self.renderer.render_3d(self.maze, self.player)
            
            # Render minimap
            minimap = self.renderer.render_minimap(self.maze, self.player, 15)
            
            # Combine views
            output = []
            for i, line in enumerate(view_3d):
                # Add minimap to top-right corner
                minimap_line = minimap[i] if i < len(minimap) else ''
                combined = line[:self.renderer.width - 16] + ' ' + minimap_line
                output.append(combined)
            
            # Add controls info
            output.append("")
            output.append("WASD: Move | Q/E: Rotate | M: Editor | ESC: Quit")
            output.append(f"Position: ({self.player.x:.2f}, {self.player.y:.2f}) | Angle: {math.degrees(self.player.angle):.1f}°")
            
            print('\n'.join(output))
        
        elif self.mode == 'editor':
            editor_view = self.editor.render()
            print('\n'.join(editor_view))
            if keyboard.is_pressed('esc'):
                self.running = False
    
    def handle_game_input(self):
        """Handle input in game mode."""
        if keyboard.is_pressed('w'):
            self.player.move_forward(self.maze, self.player.move_speed)
        if keyboard.is_pressed('s'):
            self.player.move_backward(self.maze, self.player.move_speed)
        if keyboard.is_pressed('a'):
            self.player.strafe_left(self.maze, self.player.move_speed)
        if keyboard.is_pressed('d'):
            self.player.strafe_right(self.maze, self.player.move_speed)
        if keyboard.is_pressed('q'):
            self.player.angle -= self.player.rotate_speed
        if keyboard.is_pressed('e'):
            self.player.angle += self.player.rotate_speed
        if keyboard.is_pressed('m'):
            self.mode = 'editor'
            import time
            time.sleep(0.2)  # Debounce
        if keyboard.is_pressed('esc'):
            self.running = False
            import time
            time.sleep(0.1)
    
    def handle_editor_input(self):
        """Handle input in editor mode."""
        import time
        
        moved = False
        if keyboard.is_pressed('w'):
            self.editor.move_cursor(0, -1)
            moved = True
        elif keyboard.is_pressed('s'):
            self.editor.move_cursor(0, 1)
            moved = True
        elif keyboard.is_pressed('a'):
            self.editor.move_cursor(-1, 0)
            moved = True
        elif keyboard.is_pressed('d'):
            self.editor.move_cursor(1, 0)
            moved = True
        
        if moved:
            time.sleep(0.1)
            return
        
        if keyboard.is_pressed('space'):
            self.editor.toggle_cell()
            time.sleep(0.1)
        elif keyboard.is_pressed('r'):
            self.editor.mode = 'draw'
            time.sleep(0.1)
        elif keyboard.is_pressed('e'):
            self.editor.mode = 'erase'
            time.sleep(0.1)
        elif keyboard.is_pressed('m'):
            self.mode = 'game'
            time.sleep(0.2)
        elif keyboard.is_pressed('ctrl+s'):
            self.maze.save('maze.json')
            print("Maze saved!")
            time.sleep(0.5)
        elif keyboard.is_pressed('ctrl+l'):
            try:
                self.maze.load('maze.json')
                self.player.x, self.player.y = self.maze.start_pos
                print("Maze loaded!")
                time.sleep(0.5)
            except:
                pass
    
    def run(self):
        """Main game loop."""
        import time
        
        print("Starting 3D ASCII Maze Game...")
        print("Press any key to continue...")
        keyboard.wait('space')
        
        while self.running:
            if self.mode == 'game':
                self.handle_game_input()
            elif self.mode == 'editor':
                self.handle_editor_input()
            
            self.render()
            time.sleep(0.03)  # ~30 FPS


if __name__ == '__main__':
    try:
        game = Game()
        game.run()
    except KeyboardInterrupt:
        print("\nGame exited.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

