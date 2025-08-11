# JavaScript Implementation - Multi-Category Distortion Correction

This directory contains the JavaScript implementation of the Multi-Category Distortion Correction algorithm, designed for web applications and modern JavaScript environments.

## 📁 Files Overview

- `multi-category-corrector.js` - Core algorithm implementation (vanilla JavaScript)
- `web-component.js` - Web component for easy integration
- `react-component.jsx` - React component for React applications
- `tutorial.md` - Step-by-step implementation guide
- `package.json` - NPM dependencies and scripts

## 🚀 Quick Start

### Option 1: Direct Script Include
```html
<script src="multi-category-corrector.js"></script>
<script>
const corrector = new MultiCategoryDistortionCorrector();
const results = corrector.correctMultiCategory(categoryData);
</script>
```

### Option 2: ES6 Module
```javascript
import MultiCategoryDistortionCorrector from './multi-category-corrector.js';

const corrector = new MultiCategoryDistortionCorrector({
    maxGlobalAdjustment: 0.3,
    maxRelativeAdjustment: 0.15,
    debugMode: true
});
```

### Option 3: Node.js
```javascript
const MultiCategoryDistortionCorrector = require('./multi-category-corrector.js');
const corrector = new MultiCategoryDistortionCorrector();
```

## 🔧 Configuration Options

```javascript
const options = {
    maxGlobalAdjustment: 0.3,      // 30% max global correction
    maxRelativeAdjustment: 0.15,   // 15% max relative adjustment
    minScore: 1.01,                // Minimum allowed score
    maxScore: 5.0,                 // Maximum allowed score
    debugMode: false               // Enable detailed logging
};

const corrector = new MultiCategoryDistortionCorrector(options);
```

## 📊 Usage Example

### Input Data Format
```javascript
const categoryData = {
    'leadership': { 'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5 },
    'communication': { 'q1': 4, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 4 },
    'teamwork': { 'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 3 },
    // ... more categories
};
```

### Basic Implementation
```javascript
// Initialize corrector
const corrector = new MultiCategoryDistortionCorrector({ debugMode: true });

// Apply multi-category correction
try {
    const results = corrector.correctMultiCategory(categoryData);
    
    console.log('Response Style:', results.responseStyle);
    console.log('Global Factor:', results.metadata.globalFactor);
    
    // Access corrected scores
    for (const [categoryId, data] of Object.entries(results.correctedCategories)) {
        console.log(`${categoryId}: ${data.originalScore.toFixed(2)} → ${data.correctedScore.toFixed(2)}`);
    }
    
    // Generate detailed report
    const report = corrector.generateReport(results);
    console.log('Summary:', report.summary);
    
} catch (error) {
    console.error('Correction failed:', error.message);
}
```

## 🔍 Response Styles

The algorithm automatically detects and handles different response styles:

| Style | Description | Correction Applied |
|-------|-------------|-------------------|
| **high_acquiescence** | Tendency to rate high (many 4s and 5s) | Reduces scores globally |
| **low_acquiescence** | Tendency to rate low (many 1s and 2s) | Increases scores globally |
| **extreme_style** | Uses mainly extremes (1s and 5s) | Moderates toward center |
| **central_tendency** | Avoids extremes (mainly 2s, 3s, 4s) | Expands score range |
| **balanced** | Normal distribution | No correction needed |

## 🎯 Algorithm Benefits

### vs. Single-Category Approach
- **Preserves Differences**: Maintains meaningful distinctions between categories
- **Context Aware**: Considers overall response patterns across all categories
- **Adaptive**: Different strategies based on detected response style
- **Balanced**: Combines global and relative corrections appropriately

### Performance Features
- **Fast Processing**: Optimized for real-time applications
- **Memory Efficient**: Minimal memory footprint
- **Error Handling**: Robust validation and error reporting
- **Debugging**: Optional detailed logging for development

## 🧪 Testing

### Sample Test Data
```javascript
// Test with different response patterns
const testCases = {
    highBias: {
        'cat1': { 'q1': 5, 'q2': 5, 'q3': 5, 'q4': 5, 'q5': 5 },
        'cat2': { 'q1': 5, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 5 },
        'cat3': { 'q1': 4, 'q2': 5, 'q3': 5, 'q4': 5, 'q5': 5 }
    },
    
    lowBias: {
        'cat1': { 'q1': 1, 'q2': 1, 'q3': 1, 'q4': 1, 'q5': 2 },
        'cat2': { 'q1': 1, 'q2': 2, 'q3': 1, 'q4': 1, 'q5': 1 },
        'cat3': { 'q1': 2, 'q2': 1, 'q3': 1, 'q4': 2, 'q5': 1 }
    },
    
    balanced: {
        'cat1': { 'q1': 3, 'q2': 4, 'q3': 3, 'q4': 2, 'q5': 4 },
        'cat2': { 'q1': 2, 'q2': 3, 'q3': 4, 'q4': 3, 'q5': 2 },
        'cat3': { 'q1': 4, 'q2': 3, 'q3': 2, 'q4': 4, 'q5': 3 }
    }
};

// Run tests
Object.entries(testCases).forEach(([name, data]) => {
    console.log(`\n=== Testing ${name} ===`);
    const results = corrector.correctMultiCategory(data);
    console.log(`Response Style: ${results.responseStyle}`);
    console.log(`Global Factor: ${results.metadata.globalFactor}`);
});
```

## 🔧 Integration Examples

### HTML Form Integration
```javascript
function processAssessmentForm() {
    const categoryData = {};
    
    // Collect form data
    document.querySelectorAll('[data-category]').forEach(section => {
        const categoryId = section.dataset.category;
        categoryData[categoryId] = {};
        
        section.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            const questionId = input.name.split('_').pop(); // Extract question ID
            categoryData[categoryId][questionId] = parseInt(input.value);
        });
    });
    
    // Apply correction
    const corrector = new MultiCategoryDistortionCorrector();
    const results = corrector.correctMultiCategory(categoryData);
    
    // Display results
    displayResults(results);
}
```

### AJAX Integration
```javascript
async function submitAssessment(categoryData) {
    // Apply client-side correction
    const corrector = new MultiCategoryDistortionCorrector();
    const results = corrector.correctMultiCategory(categoryData);
    
    // Send to server
    try {
        const response = await fetch('/api/assessment/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalData: categoryData,
                correctionResults: results
            })
        });
        
        if (response.ok) {
            console.log('Assessment submitted successfully');
        }
    } catch (error) {
        console.error('Submission failed:', error);
    }
}
```

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features Used**: ES6 classes, arrow functions, destructuring, Object.entries()
- **Polyfills**: May need Object.entries() polyfill for older browsers

## 🐛 Debugging

Enable debug mode to see detailed processing information:

```javascript
const corrector = new MultiCategoryDistortionCorrector({ debugMode: true });
const results = corrector.correctMultiCategory(categoryData);

// Check console for:
// - Input validation results
// - Global statistics calculation
// - Response style classification
// - Category positioning analysis
// - Correction factor calculations
// - Final results summary
```

## 🔗 Related Files

- [Live Example](../../examples/comprehensive-assessment.html)
- [Algorithm Specification](../../docs/algorithm-specification.md)
- [Python Implementation](../python/README.md)
- [Bubble.io Tutorial](../bubble/README.md)