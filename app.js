// app.js — AlgoVis Application Controller

import { bubbleSort }      from './core/sorting/bubbleSort.js';
import { mergeSort }       from './core/sorting/mergeSort.js';
import { quickSort }       from './core/sorting/quickSort.js';
import { SortRenderer }    from './ui/sortRenderer.js';
import { GridRenderer }    from './ui/gridRenderer.js';
import { StringRenderer }  from './ui/stringRenderer.js';

const MODES = {
  sorting:     { title: 'Sorting Visualizer',      sub: 'bubble sort · merge sort · quick sort' },
  pathfinding: { title: 'Pathfinding Visualizer',  sub: 'dijkstra · a* · bfs · dfs'             },
  string:      { title: 'String Search Visualizer',sub: 'naive · kmp'                            },
};

const STAT_LABELS = {
  sorting:     { a: 'Comparisons', b: 'Swaps'       },
  pathfinding: { a: 'Visited',     b: 'Path Length'  },
  string:      { a: 'Comparisons', b: 'Matches'      },
};

let sortRenderer   = null;
let gridRenderer   = null;
let stringRenderer = null;
let activeMode     = 'sorting';
let activeAlgo     = 'bubble';

// ── Boot ──────────────────────────────────────────────────
sortRenderer = new SortRenderer();
switchMode('sorting');
sortRenderer.load(bubbleSort);

document.querySelectorAll('[data-mode]').forEach(item =>
  item.addEventListener('click', () => switchMode(item.dataset.mode))
);
document.querySelectorAll('.algo-pill').forEach(pill =>
  pill.addEventListener('click', () => selectSortAlgo(pill.dataset.algo))
);

// ── Mode switching ────────────────────────────────────────
function switchMode(mode) {
  activeMode = mode;
  const cfg  = MODES[mode];

  document.getElementById('topbar-title').textContent = cfg.title;
  document.getElementById('topbar-sub').textContent   = cfg.sub;

  document.querySelectorAll('[data-mode]').forEach(i =>
    i.classList.toggle('active', i.dataset.mode === mode)
  );

  document.querySelectorAll('.mode-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('mode-' + mode);
  if (panel) panel.style.display = 'flex';

  // Update stat labels
  const labels = STAT_LABELS[mode] ?? STAT_LABELS.sorting;
  const la = document.querySelector('[data-stat-label="a"]');
  const lb = document.querySelector('[data-stat-label="b"]');
  if (la) la.textContent = labels.a;
  if (lb) lb.textContent = labels.b;

  // Lazy-init renderers
  if (mode === 'pathfinding' && !gridRenderer) {
    gridRenderer = new GridRenderer();
  }
  if (mode === 'string' && !stringRenderer) {
    stringRenderer = new StringRenderer();
  }
  if (mode === 'sorting') {
    selectSortAlgo(activeAlgo);
  }
}

// ── Sorting algo selection ────────────────────────────────
function selectSortAlgo(algo) {
  activeAlgo = algo;
  const algos      = { bubble: bubbleSort, merge: mergeSort, quick: quickSort };
  const complexity = { bubble: 'O(n²)', merge: 'O(n log n)', quick: 'O(n log n)' };

  document.querySelectorAll('.algo-pill').forEach(p =>
    p.classList.toggle('active', p.dataset.algo === algo)
  );

  const vizTitle = document.getElementById('viz-title');
  if (vizTitle) vizTitle.textContent =
    algo.charAt(0).toUpperCase() + algo.slice(1) + ' Sort';

  document.getElementById('chip-complexity').textContent = complexity[algo] ?? '—';
  sortRenderer.load(algos[algo]);
}