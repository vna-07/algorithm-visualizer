// core/pathfinding/maze.js
// Recursive Backtracking maze generator.
// Works on odd-dimensioned grids — walls between cells are even indices.
// Returns a grid where every cell is either { wall: true } or { wall: false, weight: 1 }

export function generateMaze(rows, cols) {
  // Start with all walls
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ wall: true, weight: 1 }))
  );

  // Carve passages starting from top-left cell (1,1)
  carve(grid, 1, 1, rows, cols);

  // Ensure start and end cells are open
  grid[1][1].wall               = false;
  grid[rows - 2][cols - 2].wall = false;

  return grid;
}

function carve(grid, r, c, rows, cols) {
  grid[r][c].wall = false;

  // Shuffle directions: up, down, left, right (step by 2)
  const dirs = shuffle([[-2,0],[2,0],[0,-2],[0,2]]);

  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc].wall) {
      // Knock down the wall between current and next cell
      grid[r + dr / 2][c + dc / 2].wall = false;
      carve(grid, nr, nc, rows, cols);
    }
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}