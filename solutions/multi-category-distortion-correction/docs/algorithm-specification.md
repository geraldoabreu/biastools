# Multi-Category Distortion Correction Algorithm Specification

## Problem Statement

When applying traditional single-category distortion correction to assessments with multiple categories (e.g., 20 categories × 5 questions each), the independent correction of each category leads to artificially similar scores across categories, reducing the assessment's discriminative power and ability to identify meaningful differences in competencies.

## Enhanced Multi-Category Algorithm

### 1. Global Response Pattern Analysis

#### Step 1: Aggregate Response Analysis
```javascript
// Collect all responses across all categories
const allResponses = [];
const categoryScores = {};

for (const [categoryId, responses] of Object.entries(categoryData)) {
    allResponses.push(...Object.values(responses));
    const sum = Object.values(responses).reduce((a, b) => a + b, 0);
    categoryScores[categoryId] = sum / Object.keys(responses).length;
}

// Global pattern detection
const totalQuestions = allResponses.length;
const globalResponses5 = allResponses.filter(val => val === 5).length;
const globalResponses1 = allResponses.filter(val => val === 1).length;
const globalMean = allResponses.reduce((a, b) => a + b, 0) / totalQuestions;
```

#### Step 2: Response Style Classification
```javascript
function classifyResponseStyle(globalStats) {
    const { responses5Percent, responses1Percent, globalMean, variance } = globalStats;
    
    // High acquiescence (tendency to agree/rate high)
    if (responses5Percent >= 0.4 || globalMean >= 4.2) {
        return 'high_acquiescence';
    }
    
    // Low acquiescence (tendency to disagree/rate low)
    if (responses1Percent >= 0.4 || globalMean <= 2.2) {
        return 'low_acquiescence';
    }
    
    // Extreme response style (uses extremes, low variance)
    if ((responses5Percent + responses1Percent) >= 0.6 && variance < 1.5) {
        return 'extreme_style';
    }
    
    // Central tendency (avoids extremes)
    if (responses5Percent < 0.1 && responses1Percent < 0.1) {
        return 'central_tendency';
    }
    
    return 'balanced';
}
```

### 2. Category-Relative Positioning Analysis

#### Step 3: Calculate Category Ranks and Distances
```javascript
function calculateCategoryPositioning(categoryScores) {
    const scores = Object.values(categoryScores);
    const sortedScores = [...scores].sort((a, b) => b - a);
    
    const positioning = {};
    
    for (const [categoryId, score] of Object.entries(categoryScores)) {
        const rank = sortedScores.indexOf(score) + 1;
        const percentileRank = (scores.length - rank + 1) / scores.length;
        
        // Distance from mean for relative positioning
        const globalMean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const relativeDistance = (score - globalMean) / Math.max(0.5, Math.sqrt(variance(scores)));
        
        positioning[categoryId] = {
            score,
            rank,
            percentileRank,
            relativeDistance,
            isAboveAverage: score > globalMean
        };
    }
    
    return positioning;
}
```

### 3. Multi-Category Correction Formula

#### Step 4: Calculate Global Correction Factor
```javascript
function calculateGlobalCorrection(responseStyle, globalStats) {
    const { responses5Percent, responses1Percent, globalMean } = globalStats;
    let globalFactor = 1.0;
    
    switch (responseStyle) {
        case 'high_acquiescence':
            // Reduce scores based on extent of high rating bias
            const highBias = Math.min(0.3, responses5Percent * 0.5);
            globalFactor = 1 - highBias;
            break;
            
        case 'low_acquiescence':
            // Boost scores based on extent of low rating bias
            const lowBias = Math.min(0.3, responses1Percent * 0.5);
            globalFactor = 1 + lowBias;
            break;
            
        case 'extreme_style':
            // Moderate extreme scores toward center
            const extremeBias = (responses5Percent + responses1Percent) * 0.2;
            globalFactor = 1 - Math.min(0.15, extremeBias);
            break;
            
        case 'central_tendency':
            // Slightly expand range to increase discrimination
            globalFactor = 1.05;
            break;
            
        default: // balanced
            globalFactor = 1.0;
    }
    
    return Math.max(0.7, Math.min(1.3, globalFactor));
}
```

#### Step 5: Calculate Relative Preservation Factor
```javascript
function calculateRelativeFactor(categoryPosition, responseStyle, globalCorrection) {
    const { relativeDistance, percentileRank, isAboveAverage } = categoryPosition;
    
    // Base relative factor preserves original relationships
    let relativeFactor = 1.0;
    
    // Preserve relative differences more strongly for balanced responses
    if (responseStyle === 'balanced') {
        return 1.0; // No additional adjustment needed
    }
    
    // For biased response styles, apply differential correction
    // to maintain relative positioning while correcting bias
    
    if (responseStyle === 'high_acquiescence') {
        // Preserve higher-scoring categories' relative advantage
        if (isAboveAverage) {
            relativeFactor = 1.0 + (relativeDistance * 0.1);
        } else {
            relativeFactor = 1.0 - (Math.abs(relativeDistance) * 0.05);
        }
    } else if (responseStyle === 'low_acquiescence') {
        // Preserve lower-scoring categories' relative positioning
        if (!isAboveAverage) {
            relativeFactor = 1.0 - (Math.abs(relativeDistance) * 0.1);
        } else {
            relativeFactor = 1.0 + (relativeDistance * 0.05);
        }
    }
    
    // Ensure relative factor stays within reasonable bounds
    return Math.max(0.85, Math.min(1.15, relativeFactor));
}
```

#### Step 6: Apply Final Multi-Category Correction
```javascript
function applyMultiCategoryCorrection(categoryData) {
    // Steps 1-2: Global analysis
    const globalStats = calculateGlobalStats(categoryData);
    const responseStyle = classifyResponseStyle(globalStats);
    
    // Step 3: Category positioning
    const categoryScores = calculateCategoryScores(categoryData);
    const positioning = calculateCategoryPositioning(categoryScores);
    
    // Steps 4-5: Correction factors
    const globalFactor = calculateGlobalCorrection(responseStyle, globalStats);
    
    const correctedCategories = {};
    
    for (const [categoryId, position] of Object.entries(positioning)) {
        const relativeFactor = calculateRelativeFactor(position, responseStyle, globalFactor);
        
        // Apply combined correction
        const originalScore = position.score;
        let correctedScore = originalScore * globalFactor * relativeFactor;
        
        // Ensure score bounds
        correctedScore = Math.max(1.01, Math.min(5.0, correctedScore));
        
        correctedCategories[categoryId] = {
            originalScore,
            correctedScore,
            globalFactor,
            relativeFactor,
            totalAdjustment: correctedScore / originalScore,
            position
        };
    }
    
    return {
        correctedCategories,
        globalStats,
        responseStyle,
        metadata: {
            globalFactor,
            totalCategories: Object.keys(categoryData).length,
            totalQuestions: globalStats.totalQuestions
        }
    };
}
```

## Key Advantages of Multi-Category Approach

### 1. Preserves Discrimination
- **Problem**: Single-category correction can make all categories look similar
- **Solution**: Relative factors maintain meaningful differences between categories

### 2. Context-Aware Correction
- **Problem**: Same correction applied regardless of overall response pattern
- **Solution**: Different strategies based on detected response style

### 3. Global Pattern Recognition
- **Problem**: Misses systematic biases across the entire assessment
- **Solution**: Analyzes patterns across all categories simultaneously

### 4. Balanced Adjustment
- **Problem**: Over-correction can distort true score relationships
- **Solution**: Combines global and relative factors for balanced correction

## Implementation Considerations

### Statistical Validation
1. **Variance Preservation**: Ensure category score variance is maintained or improved
2. **Correlation Structure**: Preserve meaningful correlations between related categories
3. **Ceiling/Floor Effects**: Avoid bunching scores at extremes

### Parameters for Tuning
- **Global correction limits**: 0.7 to 1.3 (30% max adjustment)
- **Relative factor limits**: 0.85 to 1.15 (15% relative adjustment)
- **Response style thresholds**: Adjust based on empirical data
- **Minimum score floor**: 1.01 to avoid exactly 1.0

### Performance Optimization
- **Batch processing**: Calculate all categories simultaneously
- **Caching**: Store intermediate calculations for repeated use
- **Vectorization**: Use array operations where possible

## Validation Metrics

### Before/After Comparison
1. **Mean absolute difference** between categories
2. **Variance** within and between categories  
3. **Rank-order correlation** of categories
4. **Distribution shape** preservation

### Quality Indicators
1. **Discrimination index**: Ability to distinguish between categories
2. **Reliability**: Internal consistency after correction
3. **Face validity**: Logical preservation of category relationships
4. **Bias reduction**: Improvement in response pattern extremity