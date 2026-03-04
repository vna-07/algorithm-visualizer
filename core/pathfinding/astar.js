// core/pathfinding/astar.js
// f(n) = g(n) + h(n) — actual cost + manhattan distance heuristic.
// Smarter than Dijkstra's — focuses toward the target like a beam.

export function astar(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const g    = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const f    = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const closed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const visitedOrder = [];

  g[start.row][start.col] = 0;
  f[start.row][start.col] = heuristic(start, end);

  const open = [[f[start.row][start.col], start.row, start.col]];

  while (open.length > 0) {
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift();

    if (closed[r][c]) continue;
    closed[r][c] = true;
    visitedOrder.push({ row: r, col: c });

    if (r === end.row && c === end.col) break;

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (closed[nr][nc] || grid[nr][nc].wall) continue;
      const tentG = g[r][c] + grid[nr][nc].weight;
      if (tentG < g[nr][nc]) {
        g[nr][nc]    = tentG;
        f[nr][nc]    = tentG + heuristic({ row: nr, col: nc }, end);
        prev[nr][nc] = { row: r, col: c };
        open.push([f[nr][nc], nr, nc]);
      }
    }
  }

  return { visitedOrder, path: buildPath(prev, start, end) };
}

const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

function neighbors(r, c, rows, cols) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
    .filter(([nr,nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
}

function buildPath(prev, start, end) {
  const path = [];
  let cur = end;
  while (cur && !(cur.row === start.row && cur.col === start.col)) {
    path.unshift(cur);
    cur = prev[cur.row][cur.col];
  }
  if (cur) path.unshift(start);
  return path.length > 1 ? path : [];
}