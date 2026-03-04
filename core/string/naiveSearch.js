// core/string/naiveSearch.js
// Brute force string search — slides pattern one position at a time.
// Each step: { textIdx, patIdx, state, matches, comparisons }
// state: 'comparing' | 'match' | 'mismatch' | 'found' | 'done'

export function naiveSearch(text, pattern) {
  const steps = [];
  const n = text.length, m = pattern.length;
  const matches = [];
  let comparisons = 0;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;

    while (j < m) {
      comparisons++;
      const isMatch = text[i + j] === pattern[j];

      steps.push({
        textIdx:      i,
        patIdx:       j,
        state:        isMatch ? 'match' : 'mismatch',
        matchStart:   i,
        matches:      [...matches],
        comparisons,
      });

      if (!isMatch) break;
      j++;
    }

    if (j === m) {
      matches.push(i);
      steps.push({
        textIdx:    i,
        patIdx:     m - 1,
        state:      'found',
        matchStart: i,
        matches:    [...matches],
        comparisons,
      });
    }
  }

  steps.push({
    textIdx:    -1,
    patIdx:     -1,
    state:      'done',
    matchStart: -1,
    matches:    [...matches],
    comparisons,
  });

  return steps;
}