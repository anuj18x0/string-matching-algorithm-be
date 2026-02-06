const express = require('express');
const router = express.Router();
const { rabinKarpAlgorithm } = require('../algorithms/rabin-karp');

/**
 * POST /api/rabin-karp/execute
 * Execute Rabin-Karp algorithm and return step-by-step visualization data
 */
router.post('/execute', (req, res) => {
  try {
    const { text, pattern, base, modulo } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Text is required and must be a string' 
      });
    }
    
    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Pattern is required and must be a string' 
      });
    }

    if (text.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Text cannot be empty' 
      });
    }

    if (pattern.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Pattern cannot be empty' 
      });
    }

    if (pattern.length > text.length) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Pattern length cannot exceed text length' 
      });
    }

    // Optional parameters with defaults
    const hashBase = base && Number.isInteger(base) && base > 0 ? base : 256;
    const hashMod = modulo && Number.isInteger(modulo) && modulo > 0 ? modulo : 101;

    // Execute Rabin-Karp algorithm
    const result = rabinKarpAlgorithm(text, pattern, hashBase, hashMod);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Rabin-Karp execution error:', error);
    res.status(500).json({ 
      error: 'Execution error', 
      message: error.message 
    });
  }
});

/**
 * GET /api/rabin-karp/info
 * Get information about the Rabin-Karp algorithm
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'Rabin-Karp Algorithm',
    description: 'A string matching algorithm that uses hashing to find pattern matches. It computes a hash value for the pattern and slides a window over the text, using rolling hash for efficient hash updates.',
    properties: {
      timeComplexity: {
        preprocessing: 'O(m)',
        matching: {
          average: 'O(n + m)',
          worst: 'O(nm)'
        },
        explanation: 'Average case is fast due to hash filtering. Worst case occurs with many hash collisions.'
      },
      spaceComplexity: 'O(1)',
      keyFeatures: [
        'Uses polynomial rolling hash',
        'Efficient average-case performance',
        'Requires verification on hash match',
        'Good for multiple pattern search'
      ]
    },
    keyConcepts: [
      {
        name: 'Polynomial Hashing',
        description: 'Characters are treated as digits of a number in some base. Hash = (c₀×d^(m-1) + c₁×d^(m-2) + ... + c_{m-1}) mod q'
      },
      {
        name: 'Rolling Hash',
        description: 'Instead of recomputing hash from scratch, we update it in O(1) by removing the leading character contribution and adding the new trailing character.'
      },
      {
        name: 'Spurious Hits',
        description: 'Hash matches that are not actual pattern matches. These occur due to hash collisions and require character-by-character verification.'
      }
    ],
    parameters: {
      base: {
        description: 'The base for polynomial hashing (typically size of alphabet)',
        default: 256
      },
      modulo: {
        description: 'A prime number for modulo operation to prevent overflow',
        default: 101
      }
    },
    examples: [
      { text: 'ABCCDDAEFG', pattern: 'CDD' },
      { text: 'AABAACAADAABAABA', pattern: 'AABA' },
      { text: 'GEEKSFORGEEKS', pattern: 'GEEK' }
    ]
  });
});

module.exports = router;
