# AlgoVis — Algorithm Visualizer

A browser-based algorithm visualizer with three modes — sorting, pathfinding, and string search. Watch algorithms come to life step by step with real-time animations, comparison counters, and interactive controls. Runs fully offline, no server required.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://vna-07.github.io/algorithm-visualizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS-yellow)

---

## Modes

### ↕ Sorting Visualizer

Visualizes three classic sorting algorithms on a randomly generated array of bars. Color coding shows comparisons, swaps, and sorted elements in real time.

| Algorithm | Complexity | Description |
|-----------|------------|-------------|
| Bubble Sort | O(n²) | Repeatedly swaps adjacent elements — largest values bubble to the end |
| Merge Sort | O(n log n) | Divides the array in half, sorts each half, and merges them back |
| Quick Sort | O(n log n) | Picks a pivot and partitions elements around it |

### ◈ Pathfinding Visualizer

Interactive grid where you place a start, an end, draw walls, add weighted nodes, or generate a random maze — then watch the algorithm find (or fail to find) the shortest path.

| Algorithm | Guarantees Shortest Path | Description |
|-----------|--------------------------|-------------|
| Dijkstra's | ✓ (weighted) | Explores like a ripple — reliable and thorough |
| A* Search | ✓ (weighted) | Uses a heuristic to aim toward the target like a beam |
| BFS | ✓ (unweighted) | Explores level by level using a queue |
| DFS | ✗ | Dives deep using a stack — chaotic but interesting |

### ⌕ String Search Visualizer

Animates how two search algorithms slide a pattern across a block of text, highlighting comparisons, matches, mismatches, and KMP jumps character by character.

| Algorithm | Complexity | Description |
|-----------|------------|-------------|
| Naive Search | O(nm) | Brute force — slides the pattern one position at a time |
| KMP | O(n+m) | Uses a prefix table (LPS) to skip redundant comparisons |

---

## How to Use

Open `index.html` in any modern browser — no installation or server needed.

- **Sorting** — click **Generate** for a new array, pick an algorithm, adjust size and speed, then hit **Play**. Use **Reset** to replay from the beginning.
- **Pathfinding** — click and drag to draw walls, use the draw mode buttons to place/move the start and end nodes, or hit **Maze** for a randomly generated maze. Select an algorithm and hit **Run**.
- **String Search** — choose a sample text or type your own, enter a pattern, select Naive or KMP, and hit **Play**. Switch to KMP to see the LPS prefix table displayed below the pattern.

---

## Getting Started

```bash
git clone https://github.com/vna-07/algorithm-visualizer.git
cd algorithm-visualizer
open index.html   # or double-click it in your file explorer
```

No build step. No dependencies. No server. Just open and visualize.

---

## Project Structure

```
algorithm-visualizer/
├── index.html                  # UI layout — all three mode panels
├── app.js                      # Application controller
├── core/
│   ├── sorting/
│   │   ├── bubbleSort.js
│   │   ├── mergeSort.js
│   │   └── quickSort.js
│   ├── pathfinding/
│   │   ├── dijkstra.js
│   │   ├── astar.js
│   │   ├── bfs.js
│   │   ├── dfs.js
│   │   └── maze.js
│   └── string/
│       ├── naiveSearch.js
│       └── kmp.js
├── ui/
│   ├── sortRenderer.js
│   ├── gridRenderer.js
│   └── stringRenderer.js
└── css/
    └── style.css
```

---

## How It Works

AlgoVis is built entirely in vanilla JavaScript. Each mode follows the same two-phase design: an algorithm core that produces a **snapshot array**, and a renderer that plays those snapshots back at variable speed.

### Sorting
Each sort function runs to completion while recording a snapshot at every comparison and swap. The renderer replays these snapshots frame by frame, coloring bars to indicate their current state (comparing, swapping, or sorted).

### Pathfinding
Dijkstra's and A* use a **min-heap priority queue** to always process the lowest-cost node next. A* adds a Manhattan distance heuristic to bias exploration toward the goal. BFS uses a standard FIFO queue for unweighted shortest paths. The maze generator uses **recursive backtracking** — carving passages through a grid — which guarantees every generated maze is fully solvable.

### String Search
Naive search records a snapshot at every character comparison as it shifts the pattern one position at a time. KMP first constructs the **LPS (Longest Proper Prefix Suffix) table**, then uses it to skip ahead on mismatches — both the table construction and each search step are visualized separately.

### Renderer Architecture
Each of the three renderers scopes all its DOM queries to its own panel, preventing ID collisions across modes in the single-page layout.

---

## What I Learned

- Designing a **step-based animation system** where algorithms produce snapshot arrays that a renderer plays back at variable speed
- Implementing **Dijkstra's and A*** using a priority queue and Manhattan distance heuristic
- Building a **recursive backtracking maze generator** that always produces a solvable maze
- Implementing the **KMP prefix (LPS) table** and visualizing pattern jumps
- Managing multiple independent renderers in a single-page app without conflicts
- Scoping DOM queries to panels to avoid ID collisions across modes

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Ideas for extensions: additional sorting algorithms (Heap, Shell, Radix), more pathfinding algorithms (Bellman-Ford, Bidirectional BFS), or a fourth mode for tree/graph traversal.

---

## License

MIT © 2026 Ayolela Vena

---

*Built by [@vna-07](https://github.com/vna-07)*
