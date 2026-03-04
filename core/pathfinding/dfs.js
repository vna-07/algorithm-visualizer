// core/pathfinding/dfs.js
export function dfs(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev    = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visitedOrder = [];

  const stack = [start];

  while (stack.length > 0) {
    const { row: r, col: c } = stack.pop();
    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitedOrder.push({ row: r, col: c });
    if (r === end.row && c === end.col) break;
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (visited[nr][nc] || grid[nr][nc].wall) continue;
      prev[nr][nc] = { row: r, col: c };
      stack.push({ row: nr, col: nc });
    }
  }
  return { visitedOrder, path: buildPath(prev, start, end) };
}

function neighbors(r, c, rows, cols) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
    .filter(([nr,nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
}

function buildPath(prev, start, end) {
  const path = []; let cur = end;
  while (cur && !(cur.row === start.row && cur.col === start.col)) {
    path.unshift(cur); cur = prev[cur.row][cur.col];
  }
  if (cur) path.unshift(start);
  return path.length > 1 ? path : [];
}