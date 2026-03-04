AlgoVis — Algorithm Visualizer
A browser-based algorithm visualizer with three modes — sorting, pathfinding, and string search. Watch algorithms come to life step by step with real-time animations, comparisons counters, and interactive controls. Runs fully offline, no server required.
🔗 Live Demo

Modes
↕ Sorting Visualizer
Visualizes three classic sorting algorithms on a randomly generated array of bars. Color coding shows comparisons, swaps, and sorted elements in real time.
AlgorithmComplexityDescriptionBubble SortO(n²)Repeatedly swaps adjacent elements — largest values bubble to the endMerge SortO(n log n)Divides the array in half, sorts each half, and merges them backQuick SortO(n log n)Picks a pivot and partitions elements around it
◈ Pathfinding Visualizer
Interactive grid where you place a start, an end, draw walls, add weighted nodes, or generate a random maze — then watch the algorithm find (or fail to find) the shortest path.
AlgorithmGuarantees Shortest PathDescriptionDijkstra's✓ (weighted)Explores like a ripple — reliable and thoroughA* Search✓ (weighted)Uses a heuristic to aim toward the target like a beamBFS✓ (unweighted)Explores level by level using a queueDFS✗Dives deep using a stack — chaotic but interesting
⌕ String Search Visualizer
Animates how two search algorithms slide a pattern across a block of text, highlighting comparisons, matches, mismatches, and KMP jumps character by character.
AlgorithmComplexityDescriptionNaive SearchO(nm)Brute force — slides the pattern one position at a timeKMPO(n+m)Uses a prefix table (LPS) to skip redundant comparisons

How to Use
Open index.html in any modern browser or visit the live demo.
Sorting — click Generate for a new array, pick an algorithm, adjust size and speed, then hit Play. Use Reset to replay from the beginning.
Pathfinding — click and drag to draw walls, use the draw mode buttons to place/move the start and end nodes, or hit Maze for a randomly generated maze. Select an algorithm and hit Run.
String Search — choose a sample text or type your own, enter a pattern, select Naive or KMP, and hit Play. Switch to KMP to see the LPS prefix table displayed below the pattern.

Project Structure
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

What I Learned

Designing a step-based animation system where algorithms produce an array of snapshots that a renderer plays back at variable speed
Implementing Dijkstra's and A* using a priority queue and manhattan distance heuristic
Building a recursive backtracking maze generator that always produces a solvable maze
Implementing the KMP prefix table (LPS) and visualizing pattern jumps
Managing multiple independent renderers in a single-page app without conflicts
Scoping DOM queries to panels to avoid ID collisions across modes


License
MIT © 2026 Ayolela Vena