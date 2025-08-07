# Python Implementation Tutorial: Bidirectional Distortion Correction Formula

## Overview
This tutorial provides step-by-step instructions for implementing the bidirectional distortion correction formula in **Python**. The formula detects and corrects response bias in psychological tests by adjusting scores when there are too many extreme responses (either 5s or 1s).

> **Note:** This tutorial is designed for Python developers. For other platforms, see:
> - `tutorial.md` - Bubble.io (no-code) implementation
> - `tutorial-javascript.md` - JavaScript implementation

## Prerequisites
- Python 3.7 or higher
- Basic understanding of Python programming
- Familiarity with functions, lists, and dictionaries
- Optional: pandas for data handling, matplotlib for visualization

## Step 1: Core Implementation

### 1.1 Basic Formula Function

```python
import math
from typing import List, Dict, Tuple

def calculate_psychological_score(responses: List[int]) -> Dict:
    """
    Calculate psychological test score with bidirectional distortion correction.
    
    Args:
        responses: List of integers (1-5) representing test responses
    
    Returns:
        Dictionary containing all calculated values
    """
    # Validate input
    if not responses or not all(1 <= r <= 5 for r in responses):
        raise ValueError("All responses must be integers between 1 and 5")
    
    total_questions = len(responses)
    total_score = sum(responses)
    
    # Calculate normalized score (1-5 scale)
    min_possible = total_questions * 1
    max_possible = total_questions * 5
    normalized_score = ((total_score - min_possible) / (max_possible - min_possible)) * 4 + 1
    
    # Count extreme responses
    responses_5_count = responses.count(5)
    responses_1_count = responses.count(1)
    
    # Calculate dynamic threshold (70% of total questions, rounded up)
    threshold = math.ceil(total_questions * 0.7)
    
    # Detect distortion type
    distortion_type = "none"
    if responses_5_count >= threshold and responses_1_count >= threshold:
        distortion_type = "both"
    elif responses_5_count >= threshold:
        distortion_type = "high"
    elif responses_1_count >= threshold:
        distortion_type = "low"
    
    # Apply correction
    corrected_score = normalized_score
    
    if "high" in distortion_type:
        distortion_factor = responses_5_count / total_questions
        correction_factor = 1 - (distortion_factor * 0.3)
        corrected_score *= correction_factor
    
    if "low" in distortion_type:
        distortion_factor = responses_1_count / total_questions
        boost_factor = 1 + (distortion_factor * 0.3)
        corrected_score *= boost_factor
    
    # Ensure score bounds (1.0001 to 5.0)
    corrected_score = max(1.0001, min(corrected_score, 5.0))
    
    return {
        'total_score': total_score,
        'normalized_score': round(normalized_score, 4),
        'corrected_score': round(corrected_score, 4),
        'responses_5_count': responses_5_count,
        'responses_1_count': responses_1_count,
        'threshold': threshold,
        'distortion_type': distortion_type,
        'total_questions': total_questions,
        'max_score': max_possible
    }
```

### 1.2 Enhanced Class Implementation

```python
class PsychologicalTest:
    """
    A comprehensive psychological test processor with distortion correction.
    """
    
    def __init__(self, questions: List[str] = None):
        self.questions = questions or []
        self.responses = []
        self.results = {}
    
    def add_question(self, question: str) -> None:
        """Add a question to the test."""
        self.questions.append(question)
    
    def add_response(self, response: int) -> None:
        """Add a response (1-5) to the test."""
        if not 1 <= response <= 5:
            raise ValueError("Response must be between 1 and 5")
        self.responses.append(response)
    
    def set_responses(self, responses: List[int]) -> None:
        """Set all responses at once."""
        self.responses = []
        for response in responses:
            self.add_response(response)
    
    def calculate_results(self) -> Dict:
        """Calculate and store test results."""
        if not self.responses:
            raise ValueError("No responses provided")
        
        self.results = calculate_psychological_score(self.responses)
        return self.results
    
    def get_interpretation(self) -> str:
        """Get human-readable interpretation of results."""
        if not self.results:
            self.calculate_results()
        
        score = self.results['corrected_score']
        distortion = self.results['distortion_type']
        
        interpretation = f"Score: {score:.4f}/5.0000\n"
        
        if score >= 4.5:
            interpretation += "Level: Excellent competency"
        elif score >= 3.5:
            interpretation += "Level: Good competency"
        elif score >= 2.5:
            interpretation += "Level: Average competency"
        elif score >= 1.5:
            interpretation += "Level: Below average competency"
        else:
            interpretation += "Level: Low competency"
        
        if distortion != "none":
            interpretation += f"\n⚠️ Distortion detected: {distortion}"
        
        return interpretation
    
    def export_to_dict(self) -> Dict:
        """Export complete test data to dictionary."""
        return {
            'questions': self.questions,
            'responses': self.responses,
            'results': self.results,
            'interpretation': self.get_interpretation()
        }
```

## Step 2: Usage Examples

### 2.1 Basic Usage

```python
# Example 1: Normal responses
responses = [3, 4, 3, 2, 4, 3, 3, 4, 2, 3]
result = calculate_psychological_score(responses)
print(f"Normalized Score: {result['normalized_score']}")
print(f"Corrected Score: {result['corrected_score']}")
print(f"Distortion: {result['distortion_type']}")

# Example 2: High distortion (many 5s)
high_distortion = [5, 5, 5, 5, 5, 5, 5, 3, 2, 4]
result = calculate_psychological_score(high_distortion)
print(f"High Distortion - Corrected Score: {result['corrected_score']}")

# Example 3: Low distortion (many 1s)
low_distortion = [1, 1, 1, 1, 1, 1, 1, 3, 4, 2]
result = calculate_psychological_score(low_distortion)
print(f"Low Distortion - Corrected Score: {result['corrected_score']}")
```

### 2.2 Class Usage

```python
# Create test instance
test = PsychologicalTest()

# Add questions
questions = [
    "I am confident in my abilities",
    "I work well under pressure",
    "I communicate effectively with others",
    "I adapt quickly to new situations",
    "I take initiative in my work",
    "I solve problems creatively",
    "I manage my time effectively",
    "I work well in teams",
    "I handle criticism constructively",
    "I am committed to continuous learning"
]

for question in questions:
    test.add_question(question)

# Set responses
test.set_responses([4, 3, 5, 2, 4, 3, 4, 5, 3, 4])

# Calculate and display results
results = test.calculate_results()
print(test.get_interpretation())
```

## Step 3: Advanced Features

### 3.1 Data Export and Import

```python
import json
import csv
from datetime import datetime

def export_to_json(test_data: Dict, filename: str = None) -> str:
    """Export test data to JSON file."""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"psychological_test_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(test_data, f, indent=2)
    
    return filename

def export_to_csv(results: Dict, filename: str = None) -> str:
    """Export results to CSV file."""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"psychological_results_{timestamp}.csv"
    
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Metric', 'Value'])
        for key, value in results.items():
            writer.writerow([key, value])
    
    return filename

# Usage
test = PsychologicalTest()
test.set_responses([3, 4, 3, 2, 4, 3, 3, 4, 2, 3])
results = test.calculate_results()

# Export data
json_file = export_to_json(test.export_to_dict())
csv_file = export_to_csv(results)
print(f"Data exported to {json_file} and {csv_file}")
```

### 3.2 Batch Processing

```python
def process_multiple_tests(test_data: List[List[int]]) -> List[Dict]:
    """Process multiple tests and return results."""
    results = []
    
    for i, responses in enumerate(test_data):
        try:
            result = calculate_psychological_score(responses)
            result['test_id'] = i + 1
            results.append(result)
        except ValueError as e:
            print(f"Error processing test {i + 1}: {e}")
    
    return results

# Example batch processing
batch_data = [
    [3, 4, 3, 2, 4, 3, 3, 4, 2, 3],  # Normal
    [5, 5, 5, 5, 5, 5, 5, 3, 2, 4],  # High distortion
    [1, 1, 1, 1, 1, 1, 1, 3, 4, 2],  # Low distortion
]

batch_results = process_multiple_tests(batch_data)
for result in batch_results:
    print(f"Test {result['test_id']}: Score {result['corrected_score']}, Distortion: {result['distortion_type']}")
```

### 3.3 Statistical Analysis

```python
import statistics

def analyze_test_statistics(results_list: List[Dict]) -> Dict:
    """Analyze statistics across multiple test results."""
    scores = [r['corrected_score'] for r in results_list]
    distortions = [r['distortion_type'] for r in results_list]
    
    return {
        'mean_score': statistics.mean(scores),
        'median_score': statistics.median(scores),
        'std_deviation': statistics.stdev(scores) if len(scores) > 1 else 0,
        'min_score': min(scores),
        'max_score': max(scores),
        'distortion_rate': len([d for d in distortions if d != 'none']) / len(distortions),
        'high_distortion_rate': distortions.count('high') / len(distortions),
        'low_distortion_rate': distortions.count('low') / len(distortions),
        'both_distortion_rate': distortions.count('both') / len(distortions)
    }

# Usage
stats = analyze_test_statistics(batch_results)
print(f"Mean Score: {stats['mean_score']:.4f}")
print(f"Distortion Rate: {stats['distortion_rate']:.2%}")
```

## Step 4: Testing and Validation

### 4.1 Unit Tests

```python
import unittest

class TestPsychologicalScore(unittest.TestCase):
    
    def test_normal_responses(self):
        """Test normal responses without distortion."""
        responses = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        result = calculate_psychological_score(responses)
        self.assertEqual(result['distortion_type'], 'none')
        self.assertEqual(result['normalized_score'], result['corrected_score'])
    
    def test_high_distortion(self):
        """Test high distortion detection and correction."""
        responses = [5, 5, 5, 5, 5, 5, 5, 3, 2, 4]  # 7 fives out of 10
        result = calculate_psychological_score(responses)
        self.assertEqual(result['distortion_type'], 'high')
        self.assertLess(result['corrected_score'], result['normalized_score'])
    
    def test_low_distortion(self):
        """Test low distortion detection and correction."""
        responses = [1, 1, 1, 1, 1, 1, 1, 3, 4, 2]  # 7 ones out of 10
        result = calculate_psychological_score(responses)
        self.assertEqual(result['distortion_type'], 'low')
        self.assertGreater(result['corrected_score'], result['normalized_score'])
    
    def test_score_bounds(self):
        """Test that corrected scores stay within bounds."""
        # Extreme high responses
        high_responses = [5] * 10
        result = calculate_psychological_score(high_responses)
        self.assertLessEqual(result['corrected_score'], 5.0)
        self.assertGreaterEqual(result['corrected_score'], 1.0001)
        
        # Extreme low responses
        low_responses = [1] * 10
        result = calculate_psychological_score(low_responses)
        self.assertLessEqual(result['corrected_score'], 5.0)
        self.assertGreaterEqual(result['corrected_score'], 1.0001)
    
    def test_invalid_input(self):
        """Test error handling for invalid input."""
        with self.assertRaises(ValueError):
            calculate_psychological_score([0, 1, 2, 3, 4])  # 0 is invalid
        
        with self.assertRaises(ValueError):
            calculate_psychological_score([1, 2, 3, 4, 6])  # 6 is invalid
        
        with self.assertRaises(ValueError):
            calculate_psychological_score([])  # Empty list

if __name__ == '__main__':
    unittest.main()
```

### 4.2 Performance Testing

```python
import time
import random

def performance_test(num_tests: int = 1000):
    """Test performance with multiple calculations."""
    # Generate random test data
    test_data = []
    for _ in range(num_tests):
        responses = [random.randint(1, 5) for _ in range(10)]
        test_data.append(responses)
    
    # Measure execution time
    start_time = time.time()
    
    for responses in test_data:
        calculate_psychological_score(responses)
    
    end_time = time.time()
    
    total_time = end_time - start_time
    avg_time = total_time / num_tests
    
    print(f"Processed {num_tests} tests in {total_time:.4f} seconds")
    print(f"Average time per test: {avg_time*1000:.4f} ms")
    print(f"Tests per second: {num_tests/total_time:.2f}")

# Run performance test
performance_test()
```

## Step 5: Integration Examples

### 5.1 Flask Web Application

```python
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Psychological Test</title>
    </head>
    <body>
        <h1>Psychological Assessment</h1>
        <form id="testForm">
            {% for i in range(1, 11) %}
            <div>
                <label>Question {{ i }}:</label>
                <input type="radio" name="q{{ i }}" value="1" required> 1
                <input type="radio" name="q{{ i }}" value="2" required> 2
                <input type="radio" name="q{{ i }}" value="3" required> 3
                <input type="radio" name="q{{ i }}" value="4" required> 4
                <input type="radio" name="q{{ i }}" value="5" required> 5
            </div>
            {% endfor %}
            <button type="submit">Submit Test</button>
        </form>
        <div id="results"></div>
        
        <script>
        document.getElementById('testForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const responses = [];
            for (let i = 1; i <= 10; i++) {
                responses.push(parseInt(formData.get('q' + i)));
            }
            
            fetch('/calculate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({responses: responses})
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('results').innerHTML = 
                    '<h2>Results</h2>' +
                    '<p>Score: ' + data.corrected_score + '/5.0000</p>' +
                    '<p>Distortion: ' + data.distortion_type + '</p>';
            });
        };
        </script>
    </body>
    </html>
    ''')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    responses = data.get('responses', [])
    
    try:
        result = calculate_psychological_score(responses)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
```

### 5.2 Command Line Interface

```python
import argparse

def main():
    parser = argparse.ArgumentParser(description='Psychological Test Calculator')
    parser.add_argument('responses', nargs='+', type=int, 
                       help='Test responses (1-5)')
    parser.add_argument('--export', choices=['json', 'csv'], 
                       help='Export results to file')
    parser.add_argument('--verbose', action='store_true', 
                       help='Show detailed output')
    
    args = parser.parse_args()
    
    try:
        result = calculate_psychological_score(args.responses)
        
        if args.verbose:
            for key, value in result.items():
                print(f"{key}: {value}")
        else:
            print(f"Score: {result['corrected_score']:.4f}")
            print(f"Distortion: {result['distortion_type']}")
        
        if args.export:
            if args.export == 'json':
                filename = export_to_json({'results': result})
            else:
                filename = export_to_csv(result)
            print(f"Results exported to {filename}")
    
    except ValueError as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
```

## Conclusion

This Python implementation provides a robust, flexible, and extensible solution for psychological testing with bidirectional distortion correction. The modular design allows for easy integration into various applications, from simple scripts to complex web applications.

### Key Features
- Dynamic threshold calculation
- Bidirectional distortion detection and correction
- Comprehensive error handling
- Export capabilities (JSON, CSV)
- Batch processing support
- Statistical analysis tools
- Unit tests for validation
- Web and CLI integration examples

### Next Steps
- Add database integration (SQLite, PostgreSQL)
- Implement user authentication and session management
- Create data visualization with matplotlib/plotly
- Add machine learning for pattern detection
- Develop REST API with FastAPI
- Create GUI with tkinter or PyQt