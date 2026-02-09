/**
 * Computes the Longest Prefix Suffix (LPS) array with step-by-step states
 * @param {string} pattern - The pattern to compute LPS for
 * @returns {Object} - Contains lpsArray and lpsSteps for visualization
 */
function computeLPSWithSteps(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  const steps = [];

  // Initial state
  steps.push({
    type: 'lps_init',
    description: 'Initializing LPS array with zeros',
    lpsArray: [...lps],
    currentIndex: 0,
    prefixLength: 0,
    pattern: pattern,
    explanation: 'The LPS (Longest Prefix Suffix) array stores the length of the longest proper prefix which is also a suffix for each position.'
  });

  let length = 0; // Length of the previous longest prefix suffix
  let i = 1;

  while (i < m) {
    if (pattern[i] === pattern[length]) {
      // Characters match - extend the prefix
      length++;
      lps[i] = length;
      
      steps.push({
        type: 'lps_match',
        description: `Match: pattern[${i}]='${pattern[i]}' equals pattern[${length - 1}]='${pattern[length - 1]}'`,
        lpsArray: [...lps],
        currentIndex: i,
        prefixLength: length,
        compareIndexPattern: i,
        compareIndexPrefix: length - 1,
        pattern: pattern,
        explanation: `Character '${pattern[i]}' at position ${i} matches character '${pattern[length - 1]}' at position ${length - 1}. LPS[${i}] = ${length}`
      });
      
      i++;
    } else {
      // Characters don't match
      if (length !== 0) {
        // Use previously computed LPS value to avoid redundant comparisons
        const oldLength = length;
        length = lps[length - 1];
        
        steps.push({
          type: 'lps_fallback',
          description: `Mismatch: pattern[${i}]='${pattern[i]}' ≠ pattern[${oldLength}]='${pattern[oldLength]}'. Using LPS fallback.`,
          lpsArray: [...lps],
          currentIndex: i,
          prefixLength: length,
          oldPrefixLength: oldLength,
          pattern: pattern,
          explanation: `Mismatch at position ${i}. Instead of starting from scratch, we use LPS[${oldLength - 1}] = ${length} to continue comparison from a shorter prefix.`
        });
      } else {
        // No proper prefix which is also suffix
        lps[i] = 0;
        
        steps.push({
          type: 'lps_zero',
          description: `No matching prefix found for position ${i}`,
          lpsArray: [...lps],
          currentIndex: i,
          prefixLength: 0,
          pattern: pattern,
          explanation: `No proper prefix matches suffix ending at position ${i}. LPS[${i}] = 0`
        });
        
        i++;
      }
    }
  }

  // Final LPS array state
  steps.push({
    type: 'lps_complete',
    description: 'LPS array computation complete',
    lpsArray: [...lps],
    pattern: pattern,
    explanation: 'The LPS array is now complete. This preprocessing enables O(n) pattern matching by avoiding re-examination of characters.'
  });

  return { lpsArray: lps, lpsSteps: steps };
}

/**
 * Performs KMP pattern matching with step-by-step states
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @param {number[]} lps - The precomputed LPS array
 * @returns {Object} - Contains matches and matchingSteps for visualization
 */
function kmpSearchWithSteps(text, pattern, lps) {
  const n = text.length;
  const m = pattern.length;
  const matches = [];
  const steps = [];
  let comparisons = 0;

  let i = 0; // Index for text
  let j = 0; // Index for pattern

  // Initial state
  steps.push({
    type: 'search_init',
    description: 'Starting KMP pattern matching',
    textIndex: 0,
    patternIndex: 0,
    patternOffset: 0,
    matches: [...matches],
    comparisons: 0,
    explanation: 'Beginning the search phase. We compare pattern characters with text characters, using the LPS array to skip unnecessary comparisons on mismatch.'
  });

  while (i < n) {
    const patternOffset = i - j;

    if (pattern[j] === text[i]) {
      // Characters match
      comparisons++;
      
      steps.push({
        type: 'match',
        description: `Match: text[${i}]='${text[i]}' equals pattern[${j}]='${pattern[j]}'`,
        textIndex: i,
        patternIndex: j,
        patternOffset: patternOffset,
        matches: [...matches],
        comparisons: comparisons,
        currentComparison: { textIndex: i, patternIndex: j, result: 'match' },
        explanation: `Character '${text[i]}' at text position ${i} matches pattern character '${pattern[j]}' at position ${j}.`
      });

      i++;
      j++;

      if (j === m) {
        // Full pattern match found
        const matchIndex = i - j;
        matches.push(matchIndex);
        
        steps.push({
          type: 'pattern_found',
          description: `Pattern found at index ${matchIndex}!`,
          textIndex: i,
          patternIndex: j,
          patternOffset: matchIndex,
          matches: [...matches],
          comparisons: comparisons,
          foundAt: matchIndex,
          explanation: `Complete pattern match found starting at text index ${matchIndex}. Using LPS[${j - 1}] = ${lps[j - 1]} to continue searching for more occurrences.`
        });

        // Continue searching using LPS
        j = lps[j - 1];
      }
    } else {
      // Characters don't match
      comparisons++;
      
      if (j !== 0) {
        const oldJ = j;
        const shift = j - lps[j - 1];
        
        steps.push({
          type: 'mismatch_shift',
          description: `Mismatch: text[${i}]='${text[i]}' ≠ pattern[${j}]='${pattern[j]}'. Using LPS to shift pattern.`,
          textIndex: i,
          patternIndex: j,
          patternOffset: patternOffset,
          matches: [...matches],
          comparisons: comparisons,
          currentComparison: { textIndex: i, patternIndex: j, result: 'mismatch' },
          lpsValue: lps[j - 1],
          shiftAmount: shift,
          explanation: `Mismatch! Instead of shifting pattern by 1, we use LPS[${j - 1}] = ${lps[j - 1]}. This means the first ${lps[j - 1]} characters of pattern already match, so we shift pattern by ${shift} positions and continue from pattern index ${lps[j - 1]}.`
        });

        j = lps[j - 1];
      } else {
        steps.push({
          type: 'mismatch_advance',
          description: `Mismatch at pattern start: text[${i}]='${text[i]}' ≠ pattern[0]='${pattern[0]}'. Moving to next text position.`,
          textIndex: i,
          patternIndex: j,
          patternOffset: patternOffset,
          matches: [...matches],
          comparisons: comparisons,
          currentComparison: { textIndex: i, patternIndex: j, result: 'mismatch' },
          explanation: `Mismatch at the first character of pattern. Simply advance to the next character in text.`
        });

        i++;
      }
    }
  }

  // Search complete
  steps.push({
    type: 'search_complete',
    description: 'KMP search complete',
    matches: [...matches],
    comparisons: comparisons,
    totalMatches: matches.length,
    explanation: `Search complete. Found ${matches.length} occurrence(s) of the pattern using ${comparisons} character comparisons.`
  });

  return { matches, matchingSteps: steps, totalComparisons: comparisons };
}

/**
 * Main KMP algorithm function that combines preprocessing and search
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {Object} - Complete algorithm execution data for visualization
 */
function kmpAlgorithm(text, pattern) {
  // Input validation
  if (!text || !pattern) {
    throw new Error('Both text and pattern are required');
  }
  if (pattern.length > text.length) {
    throw new Error('Pattern length cannot exceed text length');
  }

  // Step 1: Compute LPS array with steps
  const { lpsArray, lpsSteps } = computeLPSWithSteps(pattern);

  // Step 2: Perform pattern matching with steps
  const { matches, matchingSteps, totalComparisons } = kmpSearchWithSteps(text, pattern, lpsArray);

  return {
    algorithm: 'KMP',
    text: text,
    pattern: pattern,
    lpsArray: lpsArray,
    preprocessing: {
      steps: lpsSteps,
      description: 'LPS (Longest Prefix Suffix) Array Computation'
    },
    matching: {
      steps: matchingSteps,
      description: 'Pattern Matching Phase'
    },
    result: {
      matches: matches,
      matchCount: matches.length,
      totalComparisons: totalComparisons,
      timeComplexity: 'O(n + m)',
      spaceComplexity: 'O(m)'
    }
  };
}

module.exports = { kmpAlgorithm, computeLPSWithSteps, kmpSearchWithSteps };
