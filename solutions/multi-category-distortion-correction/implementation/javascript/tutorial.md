# JavaScript Tutorial - Multi-Category Distortion Correction

This tutorial provides step-by-step instructions for implementing the Multi-Category Distortion Correction in JavaScript applications.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Implementation](#basic-implementation)
3. [Advanced Features](#advanced-features)
4. [Integration Examples](#integration-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Basic JavaScript knowledge
- Modern web browser or Node.js environment
- Understanding of HTML forms (for web applications)

### Installation

#### Option 1: Direct Script Include
```html
<script src="path/to/multi-category-corrector.js"></script>
```

#### Option 2: ES6 Module
```javascript
import MultiCategoryDistortionCorrector from './multi-category-corrector.js';
```

#### Option 3: Node.js
```javascript
const MultiCategoryDistortionCorrector = require('./multi-category-corrector.js');
```

## Basic Implementation

### Step 1: Initialize the Corrector

```javascript
// Basic initialization
const corrector = new MultiCategoryDistortionCorrector();

// With custom options
const corrector = new MultiCategoryDistortionCorrector({
    maxGlobalAdjustment: 0.3,      // 30% max global correction
    maxRelativeAdjustment: 0.15,   // 15% max relative adjustment
    minScore: 1.01,                // Minimum allowed score
    maxScore: 5.0,                 // Maximum allowed score
    debugMode: true                // Enable detailed logging
});
```

### Step 2: Prepare Your Data

```javascript
// Data structure: category_id -> question_id -> response_value
const assessmentData = {
    'leadership': {
        'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5
    },
    'communication': {
        'q1': 4, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 4
    },
    'problem_solving': {
        'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 3
    },
    'teamwork': {
        'q1': 5, 'q2': 5, 'q3': 5, 'q4': 4, 'q5': 5
    },
    'adaptability': {
        'q1': 4, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 4
    }
};
```

### Step 3: Apply Correction

```javascript
try {
    // Apply multi-category correction
    const results = corrector.correctMultiCategory(assessmentData);
    
    console.log('Correction Results:', results);
    console.log('Response Style:', results.responseStyle);
    console.log('Global Factor:', results.metadata.globalFactor);
    
} catch (error) {
    console.error('Correction failed:', error.message);
}
```

### Step 4: Process Results

```javascript
// Access corrected scores
for (const [categoryId, data] of Object.entries(results.correctedCategories)) {
    console.log(`${categoryId}:`);
    console.log(`  Original: ${data.originalScore.toFixed(2)}`);
    console.log(`  Corrected: ${data.correctedScore.toFixed(2)}`);
    console.log(`  Adjustment: ${data.adjustmentPercent}%`);
    console.log(`  Rank: #${data.position.rank}`);
}

// Generate detailed report
const report = corrector.generateReport(results);
console.log('Summary Statistics:', report.statistics);
```

## Advanced Features

### Custom Response Style Detection

```javascript
// Extend the corrector with custom response style logic
class CustomDistortionCorrector extends MultiCategoryDistortionCorrector {
    
    classifyResponseStyle(globalStats) {
        const { responses5Percent, responses1Percent, globalMean, variance } = globalStats;
        
        // Custom logic for your specific domain
        if (globalMean >= 4.5 && responses5Percent >= 0.6) {
            return 'extreme_high_acquiescence';
        }
        
        // Fall back to parent implementation
        return super.classifyResponseStyle(globalStats);
    }
    
    calculateGlobalCorrection(responseStyle, globalStats) {
        if (responseStyle === 'extreme_high_acquiescence') {
            // Custom correction for extreme cases
            return 0.6; // 40% reduction
        }
        
        return super.calculateGlobalCorrection(responseStyle, globalStats);
    }
}

const customCorrector = new CustomDistortionCorrector();
```

### Batch Processing

```javascript
async function processBatchAssessments(assessmentList) {
    const corrector = new MultiCategoryDistortionCorrector({ debugMode: false });
    const results = [];
    
    for (const [index, assessment] of assessmentList.entries()) {
        try {
            const result = corrector.correctMultiCategory(assessment.data);
            results.push({
                participantId: assessment.participantId,
                timestamp: new Date().toISOString(),
                result: result,
                processingIndex: index
            });
            
            // Progress indicator
            console.log(`Processed ${index + 1}/${assessmentList.length} assessments`);
            
        } catch (error) {
            console.error(`Error processing assessment ${index}:`, error);
            results.push({
                participantId: assessment.participantId,
                error: error.message,
                processingIndex: index
            });
        }
    }
    
    return results;
}

// Usage
const assessments = [
    { participantId: 'P001', data: assessmentData1 },
    { participantId: 'P002', data: assessmentData2 },
    // ... more assessments
];

processBatchAssessments(assessments).then(results => {
    console.log('Batch processing complete:', results);
});
```

### Real-time Validation

```javascript
function createRealTimeValidator(corrector) {
    return {
        validateResponse: function(categoryId, questionId, value) {
            // Validate individual response
            if (typeof value !== 'number' || value < 1 || value > 5) {
                throw new Error(`Invalid response value: ${value}`);
            }
        },
        
        validateCategory: function(categoryId, responses) {
            // Validate category completion
            const requiredQuestions = 5; // Adjust as needed
            if (Object.keys(responses).length !== requiredQuestions) {
                throw new Error(`Category ${categoryId} incomplete`);
            }
        },
        
        previewCorrection: function(partialData) {
            // Provide preview of correction if assessment were completed
            try {
                return corrector.correctMultiCategory(partialData);
            } catch (error) {
                return { error: 'Insufficient data for preview' };
            }
        }
    };
}

const validator = createRealTimeValidator(corrector);
```

## Integration Examples

### React Component Integration

```jsx
import React, { useState, useEffect } from 'react';
import MultiCategoryDistortionCorrector from './multi-category-corrector.js';

const AssessmentResults = ({ assessmentData }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const processAssessment = async () => {
            try {
                setLoading(true);
                const corrector = new MultiCategoryDistortionCorrector({
                    debugMode: false
                });
                
                const correctionResults = corrector.correctMultiCategory(assessmentData);
                const report = corrector.generateReport(correctionResults);
                
                setResults({ correctionResults, report });
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (assessmentData) {
            processAssessment();
        }
    }, [assessmentData]);
    
    if (loading) return <div>Processing assessment...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!results) return <div>No data available</div>;
    
    const { correctionResults, report } = results;
    
    return (
        <div className="assessment-results">
            <h2>Assessment Results</h2>
            
            {/* Summary Information */}
            <div className="summary">
                <h3>Summary</h3>
                <p>Response Style: {correctionResults.responseStyle}</p>
                <p>Global Factor: {correctionResults.metadata.globalFactor.toFixed(3)}</p>
                <p>Correction Applied: {correctionResults.metadata.correctionApplied ? 'Yes' : 'No'}</p>
            </div>
            
            {/* Category Results */}
            <div className="categories">
                <h3>Category Results</h3>
                {Object.entries(correctionResults.correctedCategories).map(([categoryId, data]) => (
                    <div key={categoryId} className="category-result">
                        <h4>{categoryId.replace('_', ' ').toUpperCase()}</h4>
                        <div className="scores">
                            <span>Original: {data.originalScore.toFixed(2)}</span>
                            <span>Corrected: {data.correctedScore.toFixed(2)}</span>
                            <span>Rank: #{data.position.rank}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Statistics */}
            <div className="statistics">
                <h3>Statistics</h3>
                <p>Original Mean: {report.statistics.originalMean}</p>
                <p>Corrected Mean: {report.statistics.correctedMean}</p>
                <p>Largest Adjustment: {report.statistics.largestAdjustment}</p>
            </div>
        </div>
    );
};

export default AssessmentResults;
```

### Express.js API Integration

```javascript
const express = require('express');
const MultiCategoryDistortionCorrector = require('./multi-category-corrector.js');

const app = express();
app.use(express.json());

// Initialize corrector
const corrector = new MultiCategoryDistortionCorrector({
    maxGlobalAdjustment: 0.3,
    maxRelativeAdjustment: 0.15,
    debugMode: false
});

// API endpoint for assessment correction
app.post('/api/assess', async (req, res) => {
    try {
        const { participantId, categoryData } = req.body;
        
        // Validate input
        if (!participantId || !categoryData) {
            return res.status(400).json({
                error: 'Missing required fields: participantId, categoryData'
            });
        }
        
        // Apply correction
        const results = corrector.correctMultiCategory(categoryData);
        const report = corrector.generateReport(results);
        
        // Prepare response
        const response = {
            participantId,
            timestamp: new Date().toISOString(),
            responseStyle: results.responseStyle,
            globalFactor: results.metadata.globalFactor,
            correctionApplied: results.metadata.correctionApplied,
            categories: {},
            statistics: report.statistics
        };
        
        // Format category results
        for (const [categoryId, data] of Object.entries(results.correctedCategories)) {
            response.categories[categoryId] = {
                originalScore: parseFloat(data.originalScore.toFixed(3)),
                correctedScore: parseFloat(data.correctedScore.toFixed(3)),
                adjustmentPercent: data.adjustmentPercent,
                rank: data.position.rank
            };
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Assessment processing error:', error);
        res.status(500).json({
            error: 'Assessment processing failed',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        correctorVersion: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Assessment API running on port ${PORT}`);
});
```

## Best Practices

### 1. Error Handling

```javascript
// Comprehensive error handling
function safeAssessmentProcessing(assessmentData) {
    const corrector = new MultiCategoryDistortionCorrector();
    
    try {
        // Validate data structure
        corrector.validateCategoryData(assessmentData);
        
        // Apply correction
        const results = corrector.correctMultiCategory(assessmentData);
        
        // Validate results
        if (!results.correctedCategories || Object.keys(results.correctedCategories).length === 0) {
            throw new Error('No corrected categories in results');
        }
        
        return { success: true, results };
        
    } catch (error) {
        console.error('Assessment processing failed:', error);
        
        // Return meaningful error information
        return {
            success: false,
            error: {
                type: error.name,
                message: error.message,
                stack: error.stack
            }
        };
    }
}
```

### 2. Performance Optimization

```javascript
// Optimize for large datasets
class OptimizedCorrector extends MultiCategoryDistortionCorrector {
    constructor(options = {}) {
        super(options);
        this.cache = new Map();
    }
    
    correctMultiCategory(categoryData) {
        // Generate cache key
        const cacheKey = this.generateCacheKey(categoryData);
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Process and cache result
        const result = super.correctMultiCategory(categoryData);
        this.cache.set(cacheKey, result);
        
        return result;
    }
    
    generateCacheKey(categoryData) {
        return JSON.stringify(categoryData);
    }
    
    clearCache() {
        this.cache.clear();
    }
}
```

### 3. Testing

```javascript
// Unit testing example
function testMultiCategoryCorrection() {
    const corrector = new MultiCategoryDistortionCorrector({ debugMode: true });
    
    // Test case 1: High acquiescence
    const highBiasData = {
        'cat1': { 'q1': 5, 'q2': 5, 'q3': 5, 'q4': 5, 'q5': 5 },
        'cat2': { 'q1': 5, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 5 },
        'cat3': { 'q1': 4, 'q2': 5, 'q3': 5, 'q4': 5, 'q5': 5 }
    };
    
    const results = corrector.correctMultiCategory(highBiasData);
    
    // Assertions
    console.assert(results.responseStyle === 'high_acquiescence', 'Should detect high acquiescence');
    console.assert(results.metadata.globalFactor < 1.0, 'Should apply downward correction');
    
    // Test relative preservation
    const originalRanking = Object.entries(results.originalCategories)
        .sort(([,a], [,b]) => b - a)
        .map(([id,]) => id);
    
    const correctedRanking = Object.entries(results.correctedCategories)
        .sort(([,a], [,b]) => b.correctedScore - a.correctedScore)
        .map(([id,]) => id);
    
    console.assert(
        JSON.stringify(originalRanking) === JSON.stringify(correctedRanking),
        'Should preserve category ranking'
    );
    
    console.log('✓ All tests passed');
}

// Run tests
testMultiCategoryCorrection();
```

## Troubleshooting

### Common Issues

#### 1. "Invalid response value" Error
```javascript
// Problem: Response values outside 1-5 range
// Solution: Validate and clean data
function cleanResponseData(categoryData) {
    const cleaned = {};
    
    for (const [categoryId, responses] of Object.entries(categoryData)) {
        cleaned[categoryId] = {};
        
        for (const [questionId, value] of Object.entries(responses)) {
            // Clamp values to valid range
            const cleanValue = Math.max(1, Math.min(5, Math.round(value)));
            cleaned[categoryId][questionId] = cleanValue;
        }
    }
    
    return cleaned;
}
```

#### 2. "Insufficient data" Error
```javascript
// Problem: Missing questions or categories
// Solution: Check data completeness
function validateDataCompleteness(categoryData, requiredQuestions = 5) {
    const issues = [];
    
    for (const [categoryId, responses] of Object.entries(categoryData)) {
        if (!responses || typeof responses !== 'object') {
            issues.push(`Category ${categoryId}: Invalid responses object`);
            continue;
        }
        
        const questionCount = Object.keys(responses).length;
        if (questionCount < requiredQuestions) {
            issues.push(`Category ${categoryId}: Only ${questionCount}/${requiredQuestions} questions`);
        }
    }
    
    if (issues.length > 0) {
        throw new Error(`Data validation failed:\n${issues.join('\n')}`);
    }
    
    return true;
}
```

#### 3. Unexpected Correction Results
```javascript
// Problem: Corrections seem too extreme or incorrect
// Solution: Enable debug mode and examine intermediate steps
const debugCorrector = new MultiCategoryDistortionCorrector({ 
    debugMode: true,
    maxGlobalAdjustment: 0.2 // Reduce max adjustment
});

const results = debugCorrector.correctMultiCategory(data);

// Examine debug output in console
console.log('Global Statistics:', results.globalStats);
console.log('Response Style:', results.responseStyle);
console.log('Global Factor:', results.metadata.globalFactor);
```

### Performance Issues

#### Large Dataset Optimization
```javascript
// For processing many assessments
const BATCH_SIZE = 100;

async function processLargeDataset(assessments) {
    const corrector = new MultiCategoryDistortionCorrector({ debugMode: false });
    const results = [];
    
    for (let i = 0; i < assessments.length; i += BATCH_SIZE) {
        const batch = assessments.slice(i, i + BATCH_SIZE);
        
        const batchResults = batch.map(assessment => {
            try {
                return corrector.correctMultiCategory(assessment.data);
            } catch (error) {
                return { error: error.message };
            }
        });
        
        results.push(...batchResults);
        
        // Allow event loop to process other tasks
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
}
```

This tutorial provides a comprehensive guide to implementing multi-category distortion correction in JavaScript applications. For additional support, refer to the API documentation and scientific background materials.