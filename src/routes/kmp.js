const express = require('express');
const router = express.Router();
const { kmpAlgorithm } = require('../algorithms/kmp');

/**
 * POST /api/kmp/execute
 * Execute KMP algorithm and return step-by-step visualization data
 */
router.post('/execute', (req, res) => {
  try {
    const { text, pattern } = req.body;

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

    // Execute KMP algorithm
    const result = kmpAlgorithm(text, pattern);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('KMP execution error:', error);
    res.status(500).json({ 
      error: 'Execution error', 
      message: error.message 
    });
  }
});

/**
 * GET /api/kmp/info
 * Get information about the KMP algorithm
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'Knuth-Morris-Pratt (KMP) Algorithm',
    description: 'A linear-time string matching algorithm that uses a preprocessing phase to build a failure function (LPS array), enabling efficient pattern matching without backtracking.',
    properties: {
      timeComplexity: {
        preprocessing: 'O(m)',
        matching: 'O(n)',
        total: 'O(n + m)'
      },
      spaceComplexity: 'O(m)',
      keyFeatures: [
        'Uses Longest Prefix Suffix (LPS) array',
        'No backtracking of text pointer',
        'Linear time complexity guaranteed',
        'Efficient for patterns with repetitive structure'
      ]
    },
    keyConceptss: [
      {
        name: 'LPS Array',
        description: 'Longest Prefix Suffix array stores the length of the longest proper prefix which is also a suffix for each position in the pattern.'
      },
      {
        name: 'No Backtracking',
        description: 'The text pointer never moves backward. On mismatch, only the pattern pointer is adjusted using the LPS array.'
      },
      {
        name: 'Efficient Shifts',
        description: 'Instead of shifting pattern by 1 on mismatch, KMP uses LPS values to make optimal shifts.'
      }
    ],
    examples: [
      { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
      { text: 'AAAAABAAABA', pattern: 'AAAA' },
      { text: 'AABAACAADAABAABA', pattern: 'AABA' }
    ]
  });
});

module.exports = router;
