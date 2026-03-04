// core/sorting/bubbleSort.js
// Returns an array of steps for animation.
// Each step: { array, comparing, swapping, sorted, comparisons, swaps }

export function bubbleSort(input) {
  const arr   = [...input];
  const steps = [];
  const n     = arr.length;
  const sorted = new Set();
  let comparisons = 0, swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;

      // Highlight the two elements being compared
      steps.push({
        array:       [...arr],
        comparing:   [j, j + 1],
        swapping:    [],
        sorted:      [...sorted],
        comparisons,
        swaps,
      });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        // Highlight the swap
        steps.push({
          array:       [...arr],
          comparing:   [],
          swapping:    [j, j + 1],
          sorted:      [...sorted],
          comparisons,
          swaps,
        });
      }
    }
    // The largest unsorted element has bubbled to its place
    sorted.add(n - 1 - i);
  }

  // Mark the last remaining element as sorted
  sorted.add(0);
  steps.push({
    array:     [...arr],
    comparing: [],
    swapping:  [],
    sorted:    [...sorted],
    comparisons,
    swaps,
  });

  return steps;
}