// core/string/kmp.js
// Knuth-Morris-Pratt — uses a prefix table to skip redundant comparisons.
// Each step: { textIdx, patIdx, state, matchStart, matches, comparisons, jump }
// jump: how many positions were skipped (for visualizing the KMP "leap")

export function kmpSearch(text, pattern) {
  const steps = [];
  const n = text.length, m = pattern.length;
  const lps = buildLPS(pattern);
  const matches = [];
  let comparisons = 0;
  let i = 0, j = 0;

  while (i < n) {
    comparisons++;
    const isMatch = text[i] === pattern[j];

    steps.push({
      textIdx:    i,
      patIdx:     j,
      state:      isMatch ? 'match' : 'mismatch',
      matchStart: i - j,
      matches:    [...matches],
      comparisons,
      jump:       0,
    });

    if (isMatch) {
      i++; j++;
    } else {
      if (j !== 0) {
        const prevJ = j;
        j = lps[j - 1];
        // Record the jump
        steps.push({
          textIdx:    i,
          patIdx:     j,
          state:      'jump',
          matchStart: i - j,
          matches:    [...matches],
          comparisons,
          jump:       prevJ - j,
        });
      } else {
        i++;
      }
    }

    if (j === m) {
      const start = i - j;
      matches.push(start);
      steps.push({
        textIdx:    i - 1,
        patIdx:     j - 1,
        state:      'found',
        matchStart: start,
        matches:    [...matches],
        comparisons,
        jump:       0,
      });
      j = lps[j - 1];
    }
  }

  steps.push({
    textIdx:    -1,
    patIdx:     -1,
    state:      'done',
    matchStart: -1,
    matches:    [...matches],
    comparisons,
    jump:       0,
  });

  return steps;
}

// Build the Longest Proper Prefix which is also Suffix table
function buildLPS(pattern) {
  const m = pattern.length;
  const lps = Array(m).fill(0);
  let len = 0, i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else {
      if (len !== 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
  }
  return lps;
}

export function getLPS(pattern) {
  return buildLPS(pattern);
}