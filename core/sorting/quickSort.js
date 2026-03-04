// core/sorting/quickSort.js
// Iterative quicksort using an explicit stack — avoids call stack limits.
// Pivot = last element of partition. Lomuto partition scheme.
// Each step: { array, comparing, swapping, pivot, sorted, comparisons, swaps }

export function quickSort(input) {
  const arr   = [...input];
  const steps = [];
  const n     = arr.length;
  const sorted = new Set();
  let comparisons = 0, swaps = 0;

  // Explicit stack stores [lo, hi] pairs
  const stack = [[0, n - 1]];

  while (stack.length > 0) {
    const [lo, hi] = stack.pop();
    if (lo >= hi) {
      if (lo === hi) sorted.add(lo);
      continue;
    }

    const pivotIdx = partition(arr, lo, hi);
    sorted.add(pivotIdx);

    stack.push([lo, pivotIdx - 1]);
    stack.push([pivotIdx + 1, hi]);
  }

  // Final sorted frame
  steps.push({
    array:     [...arr],
    comparing: [],
    swapping:  [],
    pivot:     [],
    sorted:    Array.from({ length: n }, (_, i) => i),
    comparisons,
    swaps,
  });

  return steps;

  function partition(a, lo, hi) {
    const pivotVal = a[hi];

    // Show pivot selection
    steps.push({
      array:     [...a],
      comparing: [],
      swapping:  [],
      pivot:     [hi],
      sorted:    [...sorted],
      comparisons,
      swaps,
    });

    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      comparisons++;
      steps.push({
        array:     [...a],
        comparing: [j, hi],
        swapping:  [],
        pivot:     [hi],
        sorted:    [...sorted],
        comparisons,
        swaps,
      });

      if (a[j] <= pivotVal) {
        i++;
        swaps++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({
          array:     [...a],
          comparing: [],
          swapping:  [i, j],
          pivot:     [hi],
          sorted:    [...sorted],
          comparisons,
          swaps,
        });
      }
    }

    // Place pivot in correct position
    i++;
    swaps++;
    [a[i], a[hi]] = [a[hi], a[i]];
    steps.push({
      array:     [...a],
      comparing: [],
      swapping:  [i, hi],
      pivot:     [i],
      sorted:    [...sorted],
      comparisons,
      swaps,
    });

    return i;
  }
}