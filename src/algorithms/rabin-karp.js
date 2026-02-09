// Default values for hash computation
const DEFAULT_BASE = 256;  // Number of characters in alphabet
const DEFAULT_MODULO = 101; // A prime number for modulo operation

/**
 * Computes the hash value of a string
 * @param {string} str - The string to hash
 * @param {number} base - The base for polynomial hashing
 * @param {number} mod - The modulo value
 * @returns {number} - The hash value
 */
function computeHash(str, base, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * base + str.charCodeAt(i)) % mod;
  }
  return hash;
}

/**
 * Computes pattern hash with step-by-step states for visualization
 * @param {string} pattern - The pattern to hash
 * @param {number} base - The base for polynomial hashing
 * @param {number} mod - The modulo value
 * @returns {Object} - Contains hash value and computation steps
 */
function computePatternHashWithSteps(pattern, base, mod) {
  const steps = [];
  let hash = 0;

  steps.push({
    type: 'hash_init',
    description: 'Initializing pattern hash computation',
    pattern: pattern,
    base: base,
    mod: mod,
    currentHash: 0,
    explanation: `Computing hash using polynomial rolling hash: h = (c₀×d^(m-1) + c₁×d^(m-2) + ... + c_{m-1}) mod q, where d=${base} (base) and q=${mod} (prime modulo).`
  });

  for (let i = 0; i < pattern.length; i++) {
    const charCode = pattern.charCodeAt(i);
    const oldHash = hash;
    hash = (hash * base + charCode) % mod;

    steps.push({
      type: 'hash_step',
      description: `Adding character '${pattern[i]}' (ASCII: ${charCode}) to hash`,
      pattern: pattern,
      currentIndex: i,
      character: pattern[i],
      charCode: charCode,
      oldHash: oldHash,
      newHash: hash,
      computation: `(${oldHash} × ${base} + ${charCode}) mod ${mod} = ${hash}`,
      explanation: `Multiply current hash by base (${base}) and add ASCII value of '${pattern[i]}' (${charCode}), then take modulo ${mod}.`
    });
  }

  steps.push({
    type: 'hash_complete',
    description: `Pattern hash computed: ${hash}`,
    pattern: pattern,
    finalHash: hash,
    explanation: `Final pattern hash value is ${hash}. This will be compared against rolling hash of text windows.`
  });

  return { hash, steps };
}

/**
 * Computes the value h = base^(m-1) % mod for rolling hash
 * @param {number} patternLength - Length of the pattern
 * @param {number} base - The base value
 * @param {number} mod - The modulo value
 * @returns {number} - The h value for rolling hash
 */
function computeH(patternLength, base, mod) {
  let h = 1;
  for (let i = 0; i < patternLength - 1; i++) {
    h = (h * base) % mod;
  }
  return h;
}

/**
 * Performs Rabin-Karp pattern matching with step-by-step states
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @param {number} patternHash - The precomputed pattern hash
 * @param {number} base - The base for polynomial hashing
 * @param {number} mod - The modulo value
 * @returns {Object} - Contains matches and matchingSteps for visualization
 */
function rabinKarpSearchWithSteps(text, pattern, patternHash, base, mod) {
  const n = text.length;
  const m = pattern.length;
  const matches = [];
  const steps = [];
  let hashComparisons = 0;
  let charComparisons = 0;

  // Compute h = base^(m-1) % mod for rolling hash
  const h = computeH(m, base, mod);

  // Compute initial hash for first window of text
  let textHash = 0;
  for (let i = 0; i < m; i++) {
    textHash = (textHash * base + text.charCodeAt(i)) % mod;
  }

  steps.push({
    type: 'search_init',
    description: 'Starting Rabin-Karp pattern matching',
    patternHash: patternHash,
    initialTextHash: textHash,
    hValue: h,
    windowStart: 0,
    windowEnd: m - 1,
    explanation: `Initial text window [0..${m-1}] has hash ${textHash}. Pattern hash is ${patternHash}. h = ${base}^${m-1} mod ${mod} = ${h} (used for rolling hash).`
  });

  // Slide the pattern over text
  for (let i = 0; i <= n - m; i++) {
    hashComparisons++;

    // Check if hash values match
    if (patternHash === textHash) {
      steps.push({
        type: 'hash_match',
        description: `Hash match at position ${i}! Pattern hash (${patternHash}) = Text window hash (${textHash})`,
        windowStart: i,
        windowEnd: i + m - 1,
        patternHash: patternHash,
        textHash: textHash,
        hashComparisons: hashComparisons,
        charComparisons: charComparisons,
        explanation: `Hash values match! However, this could be a spurious hit (collision). We must verify by comparing characters one by one.`
      });

      // Verify character by character
      let match = true;
      const verificationSteps = [];
      
      for (let j = 0; j < m; j++) {
        charComparisons++;
        const isMatch = text[i + j] === pattern[j];
        
        verificationSteps.push({
          textIndex: i + j,
          patternIndex: j,
          textChar: text[i + j],
          patternChar: pattern[j],
          match: isMatch
        });

        if (!isMatch) {
          match = false;
          break;
        }
      }

      if (match) {
        matches.push(i);
        steps.push({
          type: 'pattern_found',
          description: `Pattern found at index ${i}!`,
          windowStart: i,
          windowEnd: i + m - 1,
          patternHash: patternHash,
          textHash: textHash,
          matches: [...matches],
          hashComparisons: hashComparisons,
          charComparisons: charComparisons,
          verification: verificationSteps,
          explanation: `Character verification successful! Pattern found at position ${i}. This is a true match, not a collision.`
        });
      } else {
        steps.push({
          type: 'spurious_hit',
          description: `Spurious hit at position ${i}! Hash matched but characters differ.`,
          windowStart: i,
          windowEnd: i + m - 1,
          patternHash: patternHash,
          textHash: textHash,
          hashComparisons: hashComparisons,
          charComparisons: charComparisons,
          verification: verificationSteps,
          explanation: `Hash collision detected! Although hash values matched, character verification failed. This is why Rabin-Karp needs character comparison on hash match.`
        });
      }
    } else {
      steps.push({
        type: 'hash_mismatch',
        description: `Hash mismatch at position ${i}: Pattern hash (${patternHash}) ≠ Text hash (${textHash})`,
        windowStart: i,
        windowEnd: i + m - 1,
        patternHash: patternHash,
        textHash: textHash,
        hashComparisons: hashComparisons,
        charComparisons: charComparisons,
        explanation: `Hash values don't match, so pattern cannot be at this position. No character comparison needed - this is the efficiency of Rabin-Karp!`
      });
    }

    // Compute rolling hash for next window
    if (i < n - m) {
      const oldHash = textHash;
      const removedChar = text[i];
      const removedCharCode = text.charCodeAt(i);
      const addedChar = text[i + m];
      const addedCharCode = text.charCodeAt(i + m);

      // Rolling hash formula: newHash = (base * (oldHash - oldChar * h) + newChar) % mod
      textHash = ((base * (textHash - removedCharCode * h) + addedCharCode) % mod + mod) % mod;

      steps.push({
        type: 'rolling_hash',
        description: `Computing rolling hash for window [${i + 1}..${i + m}]`,
        oldWindowStart: i,
        newWindowStart: i + 1,
        removedChar: removedChar,
        removedCharCode: removedCharCode,
        addedChar: addedChar,
        addedCharCode: addedCharCode,
        oldHash: oldHash,
        newHash: textHash,
        hValue: h,
        computation: `(${base} × (${oldHash} - ${removedCharCode} × ${h}) + ${addedCharCode}) mod ${mod} = ${textHash}`,
        explanation: `Rolling hash update: Remove leading character '${removedChar}' and add trailing character '${addedChar}'. This O(1) operation avoids recomputing the entire hash.`
      });
    }
  }

  // Search complete
  steps.push({
    type: 'search_complete',
    description: 'Rabin-Karp search complete',
    matches: [...matches],
    hashComparisons: hashComparisons,
    charComparisons: charComparisons,
    totalMatches: matches.length,
    explanation: `Search complete. Found ${matches.length} occurrence(s) using ${hashComparisons} hash comparisons and ${charComparisons} character comparisons.`
  });

  return { matches, matchingSteps: steps, hashComparisons, charComparisons };
}

/**
 * Main Rabin-Karp algorithm function that combines preprocessing and search
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @param {number} base - Optional base for hashing (default: 256)
 * @param {number} mod - Optional modulo for hashing (default: 101)
 * @returns {Object} - Complete algorithm execution data for visualization
 */
function rabinKarpAlgorithm(text, pattern, base = DEFAULT_BASE, mod = DEFAULT_MODULO) {
  // Input validation
  if (!text || !pattern) {
    throw new Error('Both text and pattern are required');
  }
  if (pattern.length > text.length) {
    throw new Error('Pattern length cannot exceed text length');
  }

  // Step 1: Compute pattern hash with steps
  const { hash: patternHash, steps: hashSteps } = computePatternHashWithSteps(pattern, base, mod);

  // Step 2: Perform pattern matching with steps
  const { matches, matchingSteps, hashComparisons, charComparisons } = 
    rabinKarpSearchWithSteps(text, pattern, patternHash, base, mod);

  return {
    algorithm: 'Rabin-Karp',
    text: text,
    pattern: pattern,
    parameters: {
      base: base,
      modulo: mod,
      patternHash: patternHash
    },
    preprocessing: {
      steps: hashSteps,
      description: 'Pattern Hash Computation'
    },
    matching: {
      steps: matchingSteps,
      description: 'Rolling Hash Pattern Matching'
    },
    result: {
      matches: matches,
      matchCount: matches.length,
      hashComparisons: hashComparisons,
      charComparisons: charComparisons,
      totalComparisons: hashComparisons + charComparisons,
      timeComplexity: 'O(n + m) average, O(nm) worst case',
      spaceComplexity: 'O(1)'
    }
  };
}

module.exports = { rabinKarpAlgorithm, computePatternHashWithSteps, rabinKarpSearchWithSteps };
