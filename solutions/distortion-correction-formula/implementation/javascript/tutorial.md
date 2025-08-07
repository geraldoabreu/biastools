# JavaScript Implementation Tutorial: Bidirectional Distortion Correction Formula

## Overview
This tutorial provides step-by-step instructions for implementing the bidirectional distortion correction formula in **JavaScript**. The formula detects and corrects response bias in psychological tests by adjusting scores when there are too many extreme responses (either 5s or 1s).

> **Note:** This tutorial is designed for JavaScript developers. For other platforms, see:
> - `tutorial.md` - Bubble.io (no-code) implementation
> - `tutorial-python.md` - Python implementation

## Prerequisites
- Basic understanding of JavaScript (ES6+)
- Familiarity with functions, arrays, and objects
- Node.js (for server-side examples)
- Optional: Modern browser for client-side examples

## Step 1: Core Implementation

### 1.1 Basic Formula Function

```javascript
/**
 * Calculate psychological test score with bidirectional distortion correction
 * @param {number[]} responses - Array of integers (1-5) representing test responses
 * @returns {Object} Object containing all calculated values
 */
function calculatePsychologicalScore(responses) {
    // Validate input
    if (!Array.isArray(responses) || responses.length === 0) {
        throw new Error('Responses must be a non-empty array');
    }
    
    if (!responses.every(r => Number.isInteger(r) && r >= 1 && r <= 5)) {
        throw new Error('All responses must be integers between 1 and 5');
    }
    
    const totalQuestions = responses.length;
    const totalScore = responses.reduce((sum, response) => sum + response, 0);
    
    // Calculate normalized score (1-5 scale)
    const minPossible = totalQuestions * 1;
    const maxPossible = totalQuestions * 5;
    const normalizedScore = ((totalScore - minPossible) / (maxPossible - minPossible)) * 4 + 1;
    
    // Count extreme responses
    const responses5Count = responses.filter(r => r === 5).length;
    const responses1Count = responses.filter(r => r === 1).length;
    
    // Calculate dynamic threshold (70% of total questions, rounded up)
    const threshold = Math.ceil(totalQuestions * 0.7);
    
    // Detect distortion type
    let distortionType = 'none';
    if (responses5Count >= threshold && responses1Count >= threshold) {
        distortionType = 'both';
    } else if (responses5Count >= threshold) {
        distortionType = 'high';
    } else if (responses1Count >= threshold) {
        distortionType = 'low';
    }
    
    // Apply correction
    let correctedScore = normalizedScore;
    
    if (distortionType.includes('high')) {
        const distortionFactor = responses5Count / totalQuestions;
        const correctionFactor = 1 - (distortionFactor * 0.3);
        correctedScore *= correctionFactor;
    }
    
    if (distortionType.includes('low')) {
        const distortionFactor = responses1Count / totalQuestions;
        const boostFactor = 1 + (distortionFactor * 0.3);
        correctedScore *= boostFactor;
    }
    
    // Ensure score bounds (1.0001 to 5.0)
    correctedScore = Math.max(1.0001, Math.min(correctedScore, 5.0));
    
    return {
        totalScore,
        normalizedScore: parseFloat(normalizedScore.toFixed(4)),
        correctedScore: parseFloat(correctedScore.toFixed(4)),
        responses5Count,
        responses1Count,
        threshold,
        distortionType,
        totalQuestions,
        maxScore: maxPossible
    };
}
```

### 1.2 Enhanced Class Implementation

```javascript
/**
 * A comprehensive psychological test processor with distortion correction
 */
class PsychologicalTest {
    constructor(questions = []) {
        this.questions = questions;
        this.responses = [];
        this.results = {};
    }
    
    /**
     * Add a question to the test
     * @param {string} question - The question text
     */
    addQuestion(question) {
        this.questions.push(question);
    }
    
    /**
     * Add a response (1-5) to the test
     * @param {number} response - Response value between 1 and 5
     */
    addResponse(response) {
        if (!Number.isInteger(response) || response < 1 || response > 5) {
            throw new Error('Response must be an integer between 1 and 5');
        }
        this.responses.push(response);
    }
    
    /**
     * Set all responses at once
     * @param {number[]} responses - Array of response values
     */
    setResponses(responses) {
        this.responses = [];
        responses.forEach(response => this.addResponse(response));
    }
    
    /**
     * Calculate and store test results
     * @returns {Object} Test results
     */
    calculateResults() {
        if (this.responses.length === 0) {
            throw new Error('No responses provided');
        }
        
        this.results = calculatePsychologicalScore(this.responses);
        return this.results;
    }
    
    /**
     * Get human-readable interpretation of results
     * @returns {string} Interpretation text
     */
    getInterpretation() {
        if (Object.keys(this.results).length === 0) {
            this.calculateResults();
        }
        
        const score = this.results.correctedScore;
        const distortion = this.results.distortionType;
        
        let interpretation = `Score: ${score.toFixed(4)}/5.0000\n`;
        
        if (score >= 4.5) {
            interpretation += 'Level: Excellent competency';
        } else if (score >= 3.5) {
            interpretation += 'Level: Good competency';
        } else if (score >= 2.5) {
            interpretation += 'Level: Average competency';
        } else if (score >= 1.5) {
            interpretation += 'Level: Below average competency';
        } else {
            interpretation += 'Level: Low competency';
        }
        
        if (distortion !== 'none') {
            interpretation += `\n⚠️ Distortion detected: ${distortion}`;
        }
        
        return interpretation;
    }
    
    /**
     * Export complete test data to object
     * @returns {Object} Complete test data
     */
    exportToObject() {
        return {
            questions: this.questions,
            responses: this.responses,
            results: this.results,
            interpretation: this.getInterpretation()
        };
    }
    
    /**
     * Reset the test to initial state
     */
    reset() {
        this.responses = [];
        this.results = {};
    }
}
```

## Step 2: Usage Examples

### 2.1 Basic Usage

```javascript
// Example 1: Normal responses
const responses = [3, 4, 3, 2, 4, 3, 3, 4, 2, 3];
const result = calculatePsychologicalScore(responses);
console.log(`Normalized Score: ${result.normalizedScore}`);
console.log(`Corrected Score: ${result.correctedScore}`);
console.log(`Distortion: ${result.distortionType}`);

// Example 2: High distortion (many 5s)
const highDistortion = [5, 5, 5, 5, 5, 5, 5, 3, 2, 4];
const highResult = calculatePsychologicalScore(highDistortion);
console.log(`High Distortion - Corrected Score: ${highResult.correctedScore}`);

// Example 3: Low distortion (many 1s)
const lowDistortion = [1, 1, 1, 1, 1, 1, 1, 3, 4, 2];
const lowResult = calculatePsychologicalScore(lowDistortion);
console.log(`Low Distortion - Corrected Score: ${lowResult.correctedScore}`);
```

### 2.2 Class Usage

```javascript
// Create test instance
const test = new PsychologicalTest();

// Add questions
const questions = [
    'I am confident in my abilities',
    'I work well under pressure',
    'I communicate effectively with others',
    'I adapt quickly to new situations',
    'I take initiative in my work',
    'I solve problems creatively',
    'I manage my time effectively',
    'I work well in teams',
    'I handle criticism constructively',
    'I am committed to continuous learning'
];

questions.forEach(question => test.addQuestion(question));

// Set responses
test.setResponses([4, 3, 5, 2, 4, 3, 4, 5, 3, 4]);

// Calculate and display results
const results = test.calculateResults();
console.log(test.getInterpretation());
```

## Step 3: Browser Implementation

### 3.1 HTML Interface

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Psychological Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .question {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .question label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .rating {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .rating input[type="radio"] {
            margin-right: 5px;
        }
        .submit-btn {
            background: #007bff;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        }
        .submit-btn:hover {
            background: #0056b3;
        }
        .results {
            margin-top: 30px;
            padding: 20px;
            background: #e9f7ef;
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        .error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            color: #721c24;
        }
        .distortion-warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Psychological Assessment Tool</h1>
        <p>Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree):</p>
        
        <form id="testForm">
            <div class="question">
                <label>1. I am confident in my abilities</label>
                <div class="rating">
                    <label><input type="radio" name="q1" value="1" required> 1 - Strongly Disagree</label>
                    <label><input type="radio" name="q1" value="2" required> 2 - Disagree</label>
                    <label><input type="radio" name="q1" value="3" required> 3 - Neutral</label>
                    <label><input type="radio" name="q1" value="4" required> 4 - Agree</label>
                    <label><input type="radio" name="q1" value="5" required> 5 - Strongly Agree</label>
                </div>
            </div>
            
            <div class="question">
                <label>2. I work well under pressure</label>
                <div class="rating">
                    <label><input type="radio" name="q2" value="1" required> 1 - Strongly Disagree</label>
                    <label><input type="radio" name="q2" value="2" required> 2 - Disagree</label>
                    <label><input type="radio" name="q2" value="3" required> 3 - Neutral</label>
                    <label><input type="radio" name="q2" value="4" required> 4 - Agree</label>
                    <label><input type="radio" name="q2" value="5" required> 5 - Strongly Agree</label>
                </div>
            </div>
            
            <!-- Add more questions as needed -->
            
            <button type="submit" class="submit-btn">Calculate Results</button>
        </form>
        
        <div id="results" style="display: none;"></div>
    </div>
    
    <script>
        // Include the calculatePsychologicalScore function here
        // (Copy from Step 1.1)
        
        document.getElementById('testForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Collect responses
                const formData = new FormData(this);
                const responses = [];
                
                // Assuming 10 questions (q1 to q10)
                for (let i = 1; i <= 10; i++) {
                    const value = formData.get(`q${i}`);
                    if (value) {
                        responses.push(parseInt(value));
                    }
                }
                
                if (responses.length < 10) {
                    throw new Error('Please answer all questions');
                }
                
                // Calculate results
                const result = calculatePsychologicalScore(responses);
                
                // Display results
                displayResults(result);
                
            } catch (error) {
                displayError(error.message);
            }
        });
        
        function displayResults(result) {
            const resultsDiv = document.getElementById('results');
            
            let html = `
                <h2>Assessment Results</h2>
                <p><strong>Your Score:</strong> ${result.correctedScore.toFixed(4)}/5.0000</p>
                <p><strong>Raw Score:</strong> ${result.totalScore}/${result.maxScore}</p>
                <p><strong>Normalized Score:</strong> ${result.normalizedScore.toFixed(4)}</p>
            `;
            
            // Add competency level
            const score = result.correctedScore;
            let level, description;
            
            if (score >= 4.5) {
                level = 'Excellent';
                description = 'Outstanding competency level';
            } else if (score >= 3.5) {
                level = 'Good';
                description = 'Above average competency';
            } else if (score >= 2.5) {
                level = 'Average';
                description = 'Satisfactory competency level';
            } else if (score >= 1.5) {
                level = 'Below Average';
                description = 'Room for improvement';
            } else {
                level = 'Low';
                description = 'Significant development needed';
            }
            
            html += `<p><strong>Competency Level:</strong> ${level} - ${description}</p>`;
            
            // Add distortion warning if detected
            if (result.distortionType !== 'none') {
                html += `
                    <div class="distortion-warning">
                        <h3>⚠️ Response Pattern Notice</h3>
                        <p>Distortion type detected: <strong>${result.distortionType}</strong></p>
                        <p>Your score has been automatically adjusted to account for response bias.</p>
                        <p>Original score: ${result.normalizedScore.toFixed(4)} → Adjusted score: ${result.correctedScore.toFixed(4)}</p>
                    </div>
                `;
            }
            
            resultsDiv.innerHTML = html;
            resultsDiv.className = 'results';
            resultsDiv.style.display = 'block';
        }
        
        function displayError(message) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `
                <h2>Error</h2>
                <p>${message}</p>
            `;
            resultsDiv.className = 'results error';
            resultsDiv.style.display = 'block';
        }
    </script>
</body>
</html>
```

### 3.2 React Component

```jsx
import React, { useState } from 'react';

const PsychologicalTestComponent = () => {
    const [responses, setResponses] = useState(Array(10).fill(null));
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    
    const questions = [
        'I am confident in my abilities',
        'I work well under pressure',
        'I communicate effectively with others',
        'I adapt quickly to new situations',
        'I take initiative in my work',
        'I solve problems creatively',
        'I manage my time effectively',
        'I work well in teams',
        'I handle criticism constructively',
        'I am committed to continuous learning'
    ];
    
    const handleResponseChange = (questionIndex, value) => {
        const newResponses = [...responses];
        newResponses[questionIndex] = parseInt(value);
        setResponses(newResponses);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        try {
            // Check if all questions are answered
            if (responses.some(r => r === null)) {
                throw new Error('Please answer all questions');
            }
            
            // Calculate results
            const result = calculatePsychologicalScore(responses);
            setResults(result);
            setError(null);
            
        } catch (err) {
            setError(err.message);
            setResults(null);
        }
    };
    
    const getCompetencyLevel = (score) => {
        if (score >= 4.5) return { level: 'Excellent', description: 'Outstanding competency level' };
        if (score >= 3.5) return { level: 'Good', description: 'Above average competency' };
        if (score >= 2.5) return { level: 'Average', description: 'Satisfactory competency level' };
        if (score >= 1.5) return { level: 'Below Average', description: 'Room for improvement' };
        return { level: 'Low', description: 'Significant development needed' };
    };
    
    return (
        <div className="psychological-test">
            <h1>Psychological Assessment Tool</h1>
            <p>Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree):</p>
            
            <form onSubmit={handleSubmit}>
                {questions.map((question, index) => (
                    <div key={index} className="question">
                        <label>{index + 1}. {question}</label>
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map(value => (
                                <label key={value}>
                                    <input
                                        type="radio"
                                        name={`q${index}`}
                                        value={value}
                                        checked={responses[index] === value}
                                        onChange={(e) => handleResponseChange(index, e.target.value)}
                                        required
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                
                <button type="submit" className="submit-btn">
                    Calculate Results
                </button>
            </form>
            
            {error && (
                <div className="error">
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            )}
            
            {results && (
                <div className="results">
                    <h2>Assessment Results</h2>
                    <p><strong>Your Score:</strong> {results.correctedScore.toFixed(4)}/5.0000</p>
                    <p><strong>Raw Score:</strong> {results.totalScore}/{results.maxScore}</p>
                    <p><strong>Normalized Score:</strong> {results.normalizedScore.toFixed(4)}</p>
                    
                    {(() => {
                        const competency = getCompetencyLevel(results.correctedScore);
                        return (
                            <p><strong>Competency Level:</strong> {competency.level} - {competency.description}</p>
                        );
                    })()}
                    
                    {results.distortionType !== 'none' && (
                        <div className="distortion-warning">
                            <h3>⚠️ Response Pattern Notice</h3>
                            <p>Distortion type detected: <strong>{results.distortionType}</strong></p>
                            <p>Your score has been automatically adjusted to account for response bias.</p>
                            <p>Original score: {results.normalizedScore.toFixed(4)} → Adjusted score: {results.correctedScore.toFixed(4)}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PsychologicalTestComponent;
```

## Step 4: Node.js Server Implementation

### 4.1 Express.js API

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Include the calculatePsychologicalScore function
// (Copy from Step 1.1)

// API Routes
app.post('/api/calculate', (req, res) => {
    try {
        const { responses } = req.body;
        
        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({ error: 'Responses must be an array' });
        }
        
        const result = calculatePsychologicalScore(responses);
        
        // Log the test (optional)
        logTest({
            timestamp: new Date().toISOString(),
            responses,
            result
        });
        
        res.json(result);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/batch-calculate', (req, res) => {
    try {
        const { tests } = req.body;
        
        if (!tests || !Array.isArray(tests)) {
            return res.status(400).json({ error: 'Tests must be an array' });
        }
        
        const results = tests.map((responses, index) => {
            try {
                const result = calculatePsychologicalScore(responses);
                return { testId: index + 1, success: true, ...result };
            } catch (error) {
                return { testId: index + 1, success: false, error: error.message };
            }
        });
        
        res.json({ results });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const logs = await getTestLogs();
        const statistics = calculateStatistics(logs);
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

// Helper functions
async function logTest(testData) {
    try {
        const logFile = path.join(__dirname, 'test-logs.json');
        let logs = [];
        
        try {
            const data = await fs.readFile(logFile, 'utf8');
            logs = JSON.parse(data);
        } catch (err) {
            // File doesn't exist, start with empty array
        }
        
        logs.push(testData);
        
        // Keep only last 1000 tests
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }
        
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Failed to log test:', error);
    }
}

async function getTestLogs() {
    try {
        const logFile = path.join(__dirname, 'test-logs.json');
        const data = await fs.readFile(logFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function calculateStatistics(logs) {
    if (logs.length === 0) {
        return { message: 'No test data available' };
    }
    
    const scores = logs.map(log => log.result.correctedScore);
    const distortions = logs.map(log => log.result.distortionType);
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const median = sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
        : sortedScores[Math.floor(sortedScores.length / 2)];
    
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        totalTests: logs.length,
        meanScore: parseFloat(mean.toFixed(4)),
        medianScore: parseFloat(median.toFixed(4)),
        standardDeviation: parseFloat(stdDev.toFixed(4)),
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
        distortionRate: distortions.filter(d => d !== 'none').length / distortions.length,
        highDistortionRate: distortions.filter(d => d === 'high').length / distortions.length,
        lowDistortionRate: distortions.filter(d => d === 'low').length / distortions.length,
        bothDistortionRate: distortions.filter(d => d === 'both').length / distortions.length
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`Psychological Test API running on port ${PORT}`);
});

module.exports = app;
```

### 4.2 Package.json

```json
{
  "name": "psychological-test-api",
  "version": "1.0.0",
  "description": "API for psychological testing with distortion correction",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  },
  "keywords": ["psychological", "testing", "assessment", "distortion", "correction"],
  "author": "Your Name",
  "license": "MIT"
}
```

## Step 5: Testing and Validation

### 5.1 Jest Unit Tests

```javascript
// tests/psychological-test.test.js
const { calculatePsychologicalScore, PsychologicalTest } = require('../psychological-test');

describe('Psychological Test Calculator', () => {
    describe('calculatePsychologicalScore', () => {
        test('should calculate normal responses correctly', () => {
            const responses = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
            const result = calculatePsychologicalScore(responses);
            
            expect(result.distortionType).toBe('none');
            expect(result.normalizedScore).toBe(result.correctedScore);
            expect(result.normalizedScore).toBe(3);
        });
        
        test('should detect and correct high distortion', () => {
            const responses = [5, 5, 5, 5, 5, 5, 5, 3, 2, 4]; // 7 fives out of 10
            const result = calculatePsychologicalScore(responses);
            
            expect(result.distortionType).toBe('high');
            expect(result.correctedScore).toBeLessThan(result.normalizedScore);
            expect(result.responses5Count).toBe(7);
            expect(result.threshold).toBe(7);
        });
        
        test('should detect and correct low distortion', () => {
            const responses = [1, 1, 1, 1, 1, 1, 1, 3, 4, 2]; // 7 ones out of 10
            const result = calculatePsychologicalScore(responses);
            
            expect(result.distortionType).toBe('low');
            expect(result.correctedScore).toBeGreaterThan(result.normalizedScore);
            expect(result.responses1Count).toBe(7);
        });
        
        test('should detect both distortions', () => {
            const responses = [1, 1, 1, 1, 5, 5, 5, 5, 5, 5]; // 4 ones, 6 fives
            const result = calculatePsychologicalScore(responses);
            
            expect(result.distortionType).toBe('both');
        });
        
        test('should keep scores within bounds', () => {
            const extremeHigh = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            const extremeLow = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            
            const highResult = calculatePsychologicalScore(extremeHigh);
            const lowResult = calculatePsychologicalScore(extremeLow);
            
            expect(highResult.correctedScore).toBeLessThanOrEqual(5.0);
            expect(highResult.correctedScore).toBeGreaterThanOrEqual(1.0001);
            expect(lowResult.correctedScore).toBeLessThanOrEqual(5.0);
            expect(lowResult.correctedScore).toBeGreaterThanOrEqual(1.0001);
        });
        
        test('should throw error for invalid input', () => {
            expect(() => calculatePsychologicalScore([])).toThrow();
            expect(() => calculatePsychologicalScore([0, 1, 2, 3, 4])).toThrow();
            expect(() => calculatePsychologicalScore([1, 2, 3, 4, 6])).toThrow();
            expect(() => calculatePsychologicalScore('invalid')).toThrow();
        });
    });
    
    describe('PsychologicalTest class', () => {
        let test;
        
        beforeEach(() => {
            test = new PsychologicalTest();
        });
        
        test('should add questions and responses', () => {
            test.addQuestion('Test question');
            test.addResponse(3);
            
            expect(test.questions).toHaveLength(1);
            expect(test.responses).toHaveLength(1);
            expect(test.responses[0]).toBe(3);
        });
        
        test('should set multiple responses', () => {
            const responses = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
            test.setResponses(responses);
            
            expect(test.responses).toEqual(responses);
        });
        
        test('should calculate results', () => {
            test.setResponses([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
            const results = test.calculateResults();
            
            expect(results).toHaveProperty('correctedScore');
            expect(results).toHaveProperty('distortionType');
        });
        
        test('should generate interpretation', () => {
            test.setResponses([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
            const interpretation = test.getInterpretation();
            
            expect(interpretation).toContain('Score:');
            expect(interpretation).toContain('Level:');
        });
        
        test('should reset properly', () => {
            test.setResponses([1, 2, 3, 4, 5]);
            test.calculateResults();
            test.reset();
            
            expect(test.responses).toHaveLength(0);
            expect(Object.keys(test.results)).toHaveLength(0);
        });
    });
});
```

### 5.2 Performance Testing

```javascript
// tests/performance.test.js
const { calculatePsychologicalScore } = require('../psychological-test');

describe('Performance Tests', () => {
    test('should handle large number of calculations efficiently', () => {
        const startTime = Date.now();
        const numTests = 10000;
        
        for (let i = 0; i < numTests; i++) {
            const responses = Array.from({ length: 10 }, () => Math.floor(Math.random() * 5) + 1);
            calculatePsychologicalScore(responses);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / numTests;
        
        console.log(`Processed ${numTests} tests in ${totalTime}ms`);
        console.log(`Average time per test: ${avgTime.toFixed(4)}ms`);
        
        // Should complete within reasonable time (adjust as needed)
        expect(totalTime).toBeLessThan(5000); // 5 seconds for 10k tests
        expect(avgTime).toBeLessThan(1); // Less than 1ms per test
    });
});
```

## Step 6: Advanced Features

### 6.1 Data Visualization

```javascript
// Using Chart.js for visualization
function createScoreDistributionChart(scores) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    // Create bins for histogram
    const bins = [0, 1, 2, 3, 4, 5];
    const binCounts = new Array(bins.length - 1).fill(0);
    
    scores.forEach(score => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (score >= bins[i] && score < bins[i + 1]) {
                binCounts[i]++;
                break;
            }
        }
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1.0-2.0', '2.0-3.0', '3.0-4.0', '4.0-5.0'],
            datasets: [{
                label: 'Score Distribution',
                data: binCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Tests'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Score Range'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Psychological Test Score Distribution'
                }
            }
        }
    });
}
```

### 6.2 Local Storage Integration

```javascript
class TestStorage {
    static saveTest(testData) {
        const tests = this.getAllTests();
        const testWithId = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...testData
        };
        
        tests.push(testWithId);
        localStorage.setItem('psychologicalTests', JSON.stringify(tests));
        
        return testWithId.id;
    }
    
    static getAllTests() {
        const stored = localStorage.getItem('psychologicalTests');
        return stored ? JSON.parse(stored) : [];
    }
    
    static getTest(id) {
        const tests = this.getAllTests();
        return tests.find(test => test.id === id);
    }
    
    static deleteTest(id) {
        const tests = this.getAllTests();
        const filtered = tests.filter(test => test.id !== id);
        localStorage.setItem('psychologicalTests', JSON.stringify(filtered));
    }
    
    static clearAllTests() {
        localStorage.removeItem('psychologicalTests');
    }
    
    static exportTests() {
        const tests = this.getAllTests();
        const dataStr = JSON.stringify(tests, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `psychological-tests-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Usage example
const test = new PsychologicalTest();
test.setResponses([4, 3, 5, 2, 4, 3, 4, 5, 3, 4]);
const results = test.calculateResults();

// Save to local storage
const testId = TestStorage.saveTest(test.exportToObject());
console.log(`Test saved with ID: ${testId}`);

// Retrieve and display all tests
const allTests = TestStorage.getAllTests();
console.log(`Total tests stored: ${allTests.length}`);
```

## Conclusion

This JavaScript implementation provides a comprehensive, flexible, and production-ready solution for psychological testing with bidirectional distortion correction. The modular design supports various deployment scenarios, from simple client-side applications to complex server-side systems.

### Key Features
- Dynamic threshold calculation
- Bidirectional distortion detection and correction
- Comprehensive error handling
- Multiple deployment options (browser, Node.js, React)
- Data persistence and export capabilities
- Performance optimization
- Extensive testing suite
- Visualization support
- RESTful API implementation

### Browser Compatibility
- Modern browsers (ES6+ support)
- Internet Explorer 11+ (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Next Steps
- Add TypeScript support for better type safety
- Implement real-time collaboration features
- Add machine learning for advanced pattern detection
- Create Progressive Web App (PWA) version
- Integrate with popular frameworks (Vue.js, Angular)
- Add internationalization (i18n) support