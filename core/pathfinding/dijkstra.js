// core/pathfinding/dijkstra.js
// Weighted shortest path — explores like a ripple in all directions.
// Returns { visitedOrder: [], path: [] }
// Each node: { row, col, weight }

export function dijkstra(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const visitedOrder = [];

  dist[start.row][start.col] = 0;

  // Min-heap priority queue [dist, row, col]
  const pq = [[0, start.row, start.col]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift();

    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitedOrder.push({ row: r, col: c });

    if (r === end.row && c === end.col) break;

    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (visited[nr][nc] || grid[nr][nc].wall) continue;
      const newDist = d + grid[nr][nc].weight;
      if (newDist < dist[nr][nc]) {
        dist[nr][nc] = newDist;
        prev[nr][nc] = { row: r, col: c };
        pq.push([newDist, nr, nc]);
      }
    }
  }

  return { visitedOrder, path: buildPath(prev, start, end) };
}

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