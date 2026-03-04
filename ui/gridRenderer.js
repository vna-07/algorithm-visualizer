// ui/gridRenderer.js
// Handles grid creation, mouse interactions, and pathfinding animation.

import { dijkstra }     from '../core/pathfinding/dijkstra.js';
import { astar }        from '../core/pathfinding/astar.js';
import { bfs }          from '../core/pathfinding/bfs.js';
import { dfs }          from '../core/pathfinding/dfs.js';
import { generateMaze } from '../core/pathfinding/maze.js';

const GRID_SIZES = {
  small:  { rows: 15, cols: 25 },
  medium: { rows: 25, cols: 45 },
  large:  { rows: 35, cols: 65 },
};

const ALGO_MAP = { dijkstra, astar, bfs, dfs };

const SPEED_MAP = [80, 60, 40, 25, 15, 10, 6, 4, 2, 1]; // ms per visited step

export class GridRenderer {
  constructor() {
    const panel       = document.getElementById('mode-pathfinding');
    const q           = id => panel.querySelector('#' + id);
    this.gridEl       = q('grid-area');
    this.btnPlay      = q('btn-play');
    this.btnReset     = q('btn-reset');
    this.btnClearPath = q('btn-clear-path');
    this.btnMaze      = q('btn-maze');
    this.selectSize   = q('select-grid-size');
    this.selectAlgo   = q('select-path-algo');
    this.sliderSpeed  = q('slider-speed-path');
    this.lblSpeed     = q('lbl-speed-path');
    this.chipStatus   = document.getElementById('chip-status');
    this.chipComplex  = document.getElementById('chip-complexity');
    this.statVisited  = document.getElementById('stat-comparisons');
    this.statPath     = document.getElementById('stat-swaps');
    this.statSize     = document.getElementById('stat-size');
    this.statTime     = document.getElementById('stat-time');
    this.rows         = 25;
    this.cols         = 45;

    this.rows       = 25;
    this.cols       = 45;
    this.grid       = [];
    this.start      = { row: 5,  col: 5  };
    this.end        = { row: 19, col: 39 };
    this.drawMode   = 'wall';   // 'wall' | 'start' | 'end' | 'weight'
    this.isDrawing  = false;
    this.weighted   = false;
    this.algoKey    = 'dijkstra';
    this.animTimer  = null;
    this.running    = false;
    this.startTime  = null;

    this._buildGrid();
    this._bindControls();
    this._renderGrid();
    this._updateChips();
  }

  // ── Grid construction ──────────────────────────────────

  _buildGrid(keepWalls = false) {
    const prev = this.grid;
    this.grid = Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.cols }, (_, c) => ({
        wall:    keepWalls && prev[r]?.[c] ? prev[r][c].wall : false,
        weight:  1,
        visited: false,
        path:    false,
        start:   r === this.start.row && c === this.start.col,
        end:     r === this.end.row   && c === this.end.col,
      }))
    );
    this._clampStartEnd();
  }

  _clampStartEnd() {
    this.start.row = Math.min(this.start.row, this.rows - 1);
    this.start.col = Math.min(this.start.col, this.cols - 1);
    this.end.row   = Math.min(this.end.row,   this.rows - 1);
    this.end.col   = Math.min(this.end.col,   this.cols - 1);
    this.grid[this.start.row][this.start.col].wall  = false;
    this.grid[this.start.row][this.start.col].start = true;
    this.grid[this.end.row][this.end.col].wall  = false;
    this.grid[this.end.row][this.end.col].end   = true;
  }

  // ── DOM rendering ──────────────────────────────────────

  _renderGrid() {
    this.gridEl.innerHTML = '';
    this.gridEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.gridEl.style.gridTemplateRows    = `repeat(${this.rows}, 1fr)`;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        this._applyClass(cell, r, c);
        this.gridEl.appendChild(cell);
      }
    }

    this.statSize.textContent = `${this.rows}×${this.cols}`;
  }

  _applyClass(cell, r, c) {
    const node = this.grid[r][c];
    cell.className = 'grid-cell'
      + (node.start   ? ' cell-start'   : '')
      + (node.end     ? ' cell-end'     : '')
      + (node.wall    ? ' cell-wall'    : '')
      + (node.path    ? ' cell-path'    : '')
      + (node.visited && !node.start && !node.end ? ' cell-visited' : '')
      + (node.weight > 1 && !node.wall ? ' cell-weight' : '');
  }

  _updateCell(r, c) {
    const idx  = r * this.cols + c;
    const cell = this.gridEl.children[idx];
    if (cell) this._applyClass(cell, r, c);
  }

  // ── Mouse interactions ─────────────────────────────────

  _bindControls() {
    // Grid mouse events
    this.gridEl.addEventListener('mousedown', e => {
      if (this.running) return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;
      this.isDrawing = true;
      this._handleCellInteract(+cell.dataset.r, +cell.dataset.c);
    });
    this.gridEl.addEventListener('mouseover', e => {
      if (!this.isDrawing || this.running) return;
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;
      this._handleCellInteract(+cell.dataset.r, +cell.dataset.c);
    });
    document.addEventListener('mouseup', () => { this.isDrawing = false; });

    // Draw mode buttons
    document.querySelectorAll('[data-draw]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.drawMode = btn.dataset.draw;
        document.querySelectorAll('[data-draw]').forEach(b =>
          b.classList.toggle('active', b.dataset.draw === this.drawMode)
        );
      });
    });

    // Weight toggle
    const weightToggle = document.getElementById('toggle-weight');
    if (weightToggle) {
      weightToggle.addEventListener('change', () => {
        this.weighted = weightToggle.checked;
      });
    }

    // Algorithm select
    this.selectAlgo?.addEventListener('change', () => {
      this.algoKey = this.selectAlgo.value;
      this._updateChips();
      this._clearPath();
    });

    // Grid size select
    this.selectSize?.addEventListener('change', () => {
      const sz = GRID_SIZES[this.selectSize.value] ?? GRID_SIZES.medium;
      this.rows = sz.rows; this.cols = sz.cols;
      this._stop();
      this._buildGrid();
      this._renderGrid();
    });

    // Speed slider
    this.sliderSpeed?.addEventListener('input', () => {
      if (this.lblSpeed) this.lblSpeed.textContent = this.sliderSpeed.value;
    });

    // Buttons
    this.btnPlay?.addEventListener('click',      () => this.running ? this._stop() : this._run());
    this.btnReset?.addEventListener('click',     () => this._fullReset());
    this.btnClearPath?.addEventListener('click', () => this._clearPath());
    this.btnMaze?.addEventListener('click',      () => this._applyMaze());
  }

  _handleCellInteract(r, c) {
    const node = this.grid[r][c];
    if (this.drawMode === 'start') {
      // Move start
      this.grid[this.start.row][this.start.col].start = false;
      this._updateCell(this.start.row, this.start.col);
      this.start = { row: r, col: c };
      node.wall  = false; node.start = true; node.end = false;
      this._updateCell(r, c);
    } else if (this.drawMode === 'end') {
      // Move end
      this.grid[this.end.row][this.end.col].end = false;
      this._updateCell(this.end.row, this.end.col);
      this.end  = { row: r, col: c };
      node.wall = false; node.end = true; node.start = false;
      this._updateCell(r, c);
    } else if (this.drawMode === 'weight') {
      if (!node.start && !node.end) {
        node.weight = node.weight > 1 ? 1 : 5;
        node.wall   = false;
        this._updateCell(r, c);
      }
    } else {
      // Toggle wall
      if (!node.start && !node.end) {
        node.wall = !node.wall;
        node.weight = 1;
        this._updateCell(r, c);
      }
    }
  }

  // ── Algorithm runner ───────────────────────────────────

  _run() {
    this._clearPath();
    const fn = ALGO_MAP[this.algoKey];
    if (!fn) return;

    const { visitedOrder, path } = fn(this.grid, this.start, this.end);
    this.running   = true;
    this.startTime = Date.now();
    this.btnPlay.textContent = '⏹ Stop';
    this.btnPlay.classList.add('primary');
    this._setStatus('running');

    const speed = SPEED_MAP[parseInt(this.sliderSpeed?.value ?? 5) - 1];
    let i = 0;

    this.animTimer = setInterval(() => {
      // Animate visited nodes in batches for speed
      const batch = Math.max(1, Math.floor(1000 / (speed * visitedOrder.length + 1)));
      for (let b = 0; b < batch && i < visitedOrder.length; b++, i++) {
        const { row: r, col: c } = visitedOrder[i];
        if (!this.grid[r][c].start && !this.grid[r][c].end) {
          this.grid[r][c].visited = true;
          this._updateCell(r, c);
        }
        this.statVisited.textContent = i + 1;
      }

      if (i >= visitedOrder.length) {
        clearInterval(this.animTimer);
        this._animatePath(path, speed);
      }
    }, speed);
  }

  _animatePath(path, speed) {
    if (!path.length) {
      this._setStatus('no path');
      this.running = false;
      this.btnPlay.textContent = '▶ Run';
      this.btnPlay.classList.remove('primary');
      this.statTime.textContent = (Date.now() - this.startTime) + 'ms';
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i >= path.length) {
        clearInterval(timer);
        this.running = false;
        this.btnPlay.textContent = '▶ Run';
        this.btnPlay.classList.remove('primary');
        this._setStatus('done');
        this.statPath.textContent  = path.length;
        this.statTime.textContent  = (Date.now() - this.startTime) + 'ms';
        return;
      }
      const { row: r, col: c } = path[i++];
      if (!this.grid[r][c].start && !this.grid[r][c].end) {
        this.grid[r][c].path = true;
        this._updateCell(r, c);
      }
    }, speed * 3);
  }

  // ── Maze ──────────────────────────────────────────────

  _applyMaze() {
    this._stop();
    // Maze needs odd dimensions
    const mr = this.rows % 2 === 0 ? this.rows - 1 : this.rows;
    const mc = this.cols % 2 === 0 ? this.cols - 1 : this.cols;
    const mazeGrid = generateMaze(mr, mc);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const node = this.grid[r][c];
        if (node.start || node.end) continue;
        node.wall    = mazeGrid[r]?.[c]?.wall ?? true;
        node.visited = false;
        node.path    = false;
      }
    }
    this._renderGrid();
  }

  // ── Helpers ───────────────────────────────────────────

  _clearPath() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c].visited = false;
        this.grid[r][c].path    = false;
        this._updateCell(r, c);
      }
    this.statVisited.textContent = '0';
    this.statPath.textContent    = '0';
    this.statTime.textContent    = '0ms';
    this._setStatus('idle');
  }

  _fullReset() {
    this._stop();
    this._buildGrid();
    this._renderGrid();
    this.statVisited.textContent = '0';
    this.statPath.textContent    = '0';
    this.statTime.textContent    = '0ms';
    this._setStatus('idle');
  }

  _stop() {
    clearInterval(this.animTimer);
    this.running = false;
    if (this.btnPlay) {
      this.btnPlay.textContent = '▶ Run';
      this.btnPlay.classList.remove('primary');
    }
    this._setStatus('idle');
  }

  _updateChips() {
    const map = { dijkstra:'O((V+E) log V)', astar:'O(E)', bfs:'O(V+E)', dfs:'O(V+E)' };
    if (this.chipComplex) this.chipComplex.textContent = map[this.algoKey] ?? '—';
  }

  _setStatus(s) {
    if (!this.chipStatus) return;
    this.chipStatus.textContent = s;
    this.chipStatus.style.color =
      s === 'running'  ? 'var(--orange)' :
      s === 'done'     ? 'var(--green)'  :
      s === 'no path'  ? 'var(--red)'    :
      s === 'paused'   ? 'var(--blue)'   : 'var(--text-dim)';
  }
}