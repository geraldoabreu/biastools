# Distortion Correction Formula - Psychological Test

## Identified Problem

When candidates respond to psychological tests, some may try to "beat" the system by always responding with the maximum option (5) for all questions, creating distortion in the results.

Another potential distortion occurs when candidates consistently choose the minimum option (1) for many questions, artificially pushing the score to the lower bound.

## Implemented Solution

### 1. Distortion Detection

- **Criterion**: 70% of responses concentrated at an extreme (max or min)
- **Dynamic Threshold**: Math.ceil(totalQuestions * 0.7) for any number of questions

The threshold automatically adapts to any test length:
- 5 questions: threshold = 4 (80%)
- 8 questions: threshold = 6 (75%) 
- 10 questions: threshold = 7 (70%)
- 12 questions: threshold = 9 (75%)
- 16 questions: threshold = 12 (75%)

### 2. Correction Formula (High-end and Low-end)

```javascript
// Count extremes
const totalQuestions = Object.keys(answers).length;
const responses5 = Object.values(answers).filter(val => val === 5).length;
const responses1 = Object.values(answers).filter(val => val === 1).length;

// Dynamic threshold (70% of total questions)
const threshold = Math.ceil(totalQuestions * 0.7);

// Detect distortion
const highDistortionDetected = responses5 >= threshold;
const lowDistortionDetected = responses1 >= threshold;

// Up to 30% adjustment in either direction
const maxAdjustment = 0.3;

let adjustedScore = normalizedScore;

if (highDistortionDetected) {
  // If too many 5s, reduce score proportionally up to 30%
  const distortionFactor = responses5 / totalQuestions;
  const correctionFactor = 1 - (distortionFactor * maxAdjustment);
  adjustedScore = Math.max(1, adjustedScore * correctionFactor);
}

if (lowDistortionDetected) {
  // If too many 1s, increase score proportionally up to 30%
  const distortionFactor = responses1 / totalQuestions;
  const boostFactor = 1 + (distortionFactor * maxAdjustment);
  adjustedScore = Math.max(1.0001, adjustedScore * boostFactor);
}

const correctedScore = Math.min(5, adjustedScore);
```

Notes:
- If both distortions are somehow detected simultaneously (rare but possible in mixed data or multi-section aggregation), the code applies both adjustments sequentially. You may choose to prioritize one, or apply only the dominant distortion.
- The floor is kept strictly above 1 (1.0001) for low-end correction to satisfy the rule "No one can have score 1"; adjust as needed.
- If you maintain a maximum cap (e.g., 5), you can clamp after adjustments: `adjustedScore = Math.min(5, adjustedScore)`.

### 3. Practical Example (High-end)

**Scenario**: Candidate responds 8 out of 10 questions with value 5

- **Total Score**: 42/50
- **Normalized Score**: 4.6
- **Detection**: 8 responses with value 5 (80%)
- **Distortion Factor**: 0.8
- **Correction Factor**: 1 - (0.8 * 0.3) = 0.76
- **Corrected Score**: 4.6 * 0.76 = 3.5

### 3.1 Practical Example (Low-end)

**Scenario**: Candidate responds 12 out of 16 questions with value 1

- **Normalized Score (pre-correction)**: 1.4
- **Detection**: 12 responses with value 1 (75%)
- **Distortion Factor (low-end)**: 12/16 = 0.75
- **Boost Factor**: 1 + (0.75 * 0.3) = 1.225
- **Corrected Score**: max(1.0001, 1.4 * 1.225) = 1.715

### 4. Formula Characteristics

1. **Proportional**: The more responses concentrated at an extreme (1 or 5), the greater the adjustment
2. **Limited**: Maximum 30% adjustment in either direction
3. **Safe**: Minimum score strictly greater than 1
4. **Transparent**: User is informed about the correction or boost

### 5. Advantages

- **Detects distortion**: Identifies suspicious patterns on both extremes
- **Automatically adjusts**: Applies proportional reduction or boost
- **Maintains validity**: Reduces ceiling effects and floor effects
- **Transparency**: Informs about applied adjustment

### 6. Adjustable Parameters

- **Thresholds**: Fixed (e.g., 7/10) or proportional (e.g., 70%)
- **Max Adjustment**: 0.3 by default (30%)
- **Tie-breaking**: Define behavior if both extremes are flagged
- **Clamping**: Define min and max allowed corrected score

### 7. Code Implementation (Reusable Functions)

```javascript
function detectExtremeCounts(answers) {
  const totalQuestions = Object.keys(answers).length;
  const responses5 = Object.values(answers).filter(v => v === 5).length;
  const responses1 = Object.values(answers).filter(v => v === 1).length;
  return { totalQuestions, responses5, responses1 };
}

function applyHighEndCorrection(normalizedScore, responses5, totalQuestions, maxReduction = 0.3) {
  const distortionFactor = responses5 / totalQuestions;
  const correctionFactor = 1 - (distortionFactor * maxReduction);
  return Math.max(1, normalizedScore * correctionFactor);
}

function applyLowEndBoost(normalizedScore, responses1, totalQuestions, maxIncrease = 0.3) {
  const distortionFactor = responses1 / totalQuestions;
  const boostFactor = 1 + (distortionFactor * maxIncrease);
  return Math.max(1.0001, normalizedScore * boostFactor);
}

function correctScoreBidirectional(answers, normalizedScore) {
  const { totalQuestions, responses5, responses1 } = detectExtremeCounts(answers);

  // Dynamic threshold (70% of total questions)
  const threshold = Math.ceil(totalQuestions * 0.7);
  const maxAdjustment = 0.3; // 30% max adjustment

  const highDistortionDetected = responses5 >= threshold;
  const lowDistortionDetected = responses1 >= threshold;

  let score = normalizedScore;
  
  if (highDistortionDetected) {
    score = applyHighEndCorrection(score, responses5, totalQuestions, maxAdjustment);
  }
  
  if (lowDistortionDetected) {
    score = applyLowEndBoost(score, responses1, totalQuestions, maxAdjustment);
  }

  // Ensure score stays within bounds
  score = Math.max(1.0001, Math.min(5, score));

  return {
    correctedScore: score,
    meta: {
      totalQuestions,
      responses5,
      responses1,
      threshold,
      highDistortionDetected,
      lowDistortionDetected
    }
  };
}
```

## Statistical Considerations

### Psychometric Validity

1. **Reliability**: The bidirectional adjustment maintains internal consistency by treating both extremes symmetrically
2. **Validity**: Preserves the relationship with the measured construct while mitigating extreme response bias
3. **Sensitivity**: Detects atypical patterns at both ends (ceiling and floor)

### Limitations

1. **False Positives**: Genuine high or low scorers may be adjusted; validate empirically
2. **Subjectivity**: Thresholds and caps rely on domain expertise
3. **Context**: May vary depending on test type

### Recommendations

1. **Validation**: Test with known samples and analyze distributions
2. **Adjustment**: Refine parameters based on empirical data
3. **Documentation**: Record all applied adjustments
4. **Review**: Periodically evaluate effectiveness and fairness