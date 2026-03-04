// core/sorting/mergeSort.js
// Iterative (bottom-up) merge sort — easier to animate than recursive.
// Each step: { array, comparing, swapping, sorted, comparisons, swaps }

export function mergeSort(input) {
  const arr   = [...input];
  const steps = [];
  const n     = arr.length;
  let comparisons = 0, swaps = 0;

  // Bottom-up: merge subarrays of size 1, then 2, then 4 ...
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid  = Math.min(lo + width, n);
      const hi   = Math.min(lo + 2 * width, n);
      merge(arr, lo, mid, hi);
    }
  }

  // Mark everything sorted at end
  steps.push({
    array:     [...arr],
    comparing: [],
    swapping:  [],
    sorted:    Array.from({ length: n }, (_, i) => i),
    comparisons,
    swaps,
  });

  return steps;

  function merge(a, lo, mid, hi) {
    const left  = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0, j = 0, k = lo;

    while (i < left.length && j < right.length) {
      comparisons++;
      steps.push({
        array:     [...a],
        comparing: [lo + i, mid + j],
        swapping:  [],
        sorted:    [],
        comparisons,
        swaps,
      });

      if (left[i] <= right[j]) {
        a[k++] = left[i++];
      } else {
        swaps++;
        a[k++] = right[j++];
        steps.push({
          array:     [...a],
          comparing: [],
          swapping:  [k - 1],
          sorted:    [],
          comparisons,
          swaps,
        });
      }
    }
    while (i < left.length)  a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
  }
}