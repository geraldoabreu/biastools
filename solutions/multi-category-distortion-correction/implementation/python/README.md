# Python Implementation - Multi-Category Distortion Correction

This directory contains the Python implementation of the Multi-Category Distortion Correction algorithm, designed for scientific computing, data analysis, and server-side applications.

## 📁 Files Overview

- `multi_category_corrector.py` - Core algorithm implementation
- `web_app.py` - Flask web application example
- `tutorial.md` - Step-by-step implementation guide
- `tests/` - Unit tests and validation scripts
- `requirements.txt` - Python dependencies

## 🚀 Quick Start

### Installation
```bash
pip install -r requirements.txt
```

### Basic Usage
```python
from multi_category_corrector import MultiCategoryDistortionCorrector

# Initialize corrector
corrector = MultiCategoryDistortionCorrector(debug_mode=True)

# Prepare data
category_data = {
    'leadership': {'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5},
    'communication': {'q1': 4, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 4},
    'teamwork': {'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 3},
    # ... more categories
}

# Apply correction
results = corrector.correct_multi_category(category_data)

# Generate report
report = corrector.generate_report(results)
print("Response Style:", results['response_style'])
print("Global Factor:", results['metadata']['global_factor'])
```

## 🔧 Configuration Options

```python
corrector = MultiCategoryDistortionCorrector(
    max_global_adjustment=0.3,      # 30% max global correction
    max_relative_adjustment=0.15,   # 15% max relative adjustment
    min_score=1.01,                 # Minimum allowed score
    max_score=5.0,                  # Maximum allowed score
    debug_mode=False                # Enable detailed logging
)
```

## 📊 Detailed Usage Example

### Complete Assessment Processing
```python
import json
from datetime import datetime
from multi_category_corrector import MultiCategoryDistortionCorrector

def process_assessment(participant_id, category_responses):
    """
    Process a complete multi-category assessment with distortion correction.
    
    Args:
        participant_id: Unique identifier for the participant
        category_responses: Dict of category data
    
    Returns:
        Dict containing processing results
    """
    
    # Initialize corrector with configuration
    corrector = MultiCategoryDistortionCorrector(
        max_global_adjustment=0.3,
        max_relative_adjustment=0.15,
        debug_mode=True
    )
    
    try:
        # Apply multi-category correction
        results = corrector.correct_multi_category(category_responses)
        
        # Generate detailed report
        report = corrector.generate_report(results)
        
        # Export results
        filename = corrector.export_results(results, 
            f"assessment_{participant_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        # Prepare summary
        summary = {
            'participant_id': participant_id,
            'processing_date': datetime.now().isoformat(),
            'response_style': results['response_style'],
            'global_factor': results['metadata']['global_factor'],
            'correction_applied': results['metadata']['correction_applied'],
            'categories_processed': results['metadata']['total_categories'],
            'total_questions': results['metadata']['total_questions'],
            'export_file': filename
        }
        
        return {
            'success': True,
            'summary': summary,
            'detailed_results': results,
            'report': report
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'participant_id': participant_id
        }

# Example usage
if __name__ == "__main__":
    # Sample 20-category assessment data
    sample_data = {
        'leadership': {'q1': 5, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 5},
        'communication': {'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5},
        'problem_solving': {'q1': 4, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 4},
        'teamwork': {'q1': 5, 'q2': 5, 'q3': 5, 'q4': 4, 'q5': 5},
        'adaptability': {'q1': 4, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 4},
        'time_management': {'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 3},
        'critical_thinking': {'q1': 4, 'q2': 3, 'q3': 4, 'q4': 3, 'q5': 4},
        'creativity': {'q1': 5, 'q2': 5, 'q3': 5, 'q4': 5, 'q5': 4},
        'emotional_intelligence': {'q1': 4, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 4},
        'decision_making': {'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 4}
    }
    
    # Process assessment
    result = process_assessment("PARTICIPANT_001", sample_data)
    
    if result['success']:
        print("Assessment processed successfully!")
        print(f"Response Style: {result['summary']['response_style']}")
        print(f"Global Factor: {result['summary']['global_factor']:.3f}")
        print(f"Correction Applied: {result['summary']['correction_applied']}")
        print(f"Results exported to: {result['summary']['export_file']}")
    else:
        print(f"Processing failed: {result['error']}")
```

## 📈 Statistical Analysis Features

### Advanced Analytics
```python
def analyze_assessment_patterns(results_list):
    """
    Analyze patterns across multiple assessments.
    
    Args:
        results_list: List of correction results from multiple participants
    
    Returns:
        Statistical analysis summary
    """
    
    import statistics
    import numpy as np
    
    response_styles = [r['response_style'] for r in results_list]
    global_factors = [r['metadata']['global_factor'] for r in results_list]
    
    analysis = {
        'sample_size': len(results_list),
        'response_style_distribution': {
            style: response_styles.count(style) 
            for style in set(response_styles)
        },
        'global_factor_stats': {
            'mean': statistics.mean(global_factors),
            'median': statistics.median(global_factors),
            'std_dev': statistics.stdev(global_factors) if len(global_factors) > 1 else 0,
            'min': min(global_factors),
            'max': max(global_factors)
        },
        'correction_frequency': sum(1 for r in results_list if r['metadata']['correction_applied'])
    }
    
    return analysis

# Batch processing example
def process_batch_assessments(assessment_data_list):
    """Process multiple assessments in batch."""
    corrector = MultiCategoryDistortionCorrector()
    results = []
    
    for i, data in enumerate(assessment_data_list):
        try:
            result = corrector.correct_multi_category(data)
            results.append(result)
            print(f"Processed assessment {i+1}/{len(assessment_data_list)}")
        except Exception as e:
            print(f"Error processing assessment {i+1}: {e}")
    
    # Generate batch analysis
    if results:
        analysis = analyze_assessment_patterns(results)
        print("\nBatch Analysis:")
        print(f"Sample Size: {analysis['sample_size']}")
        print(f"Response Style Distribution: {analysis['response_style_distribution']}")
        print(f"Correction Applied: {analysis['correction_frequency']}/{analysis['sample_size']}")
    
    return results
```

## 🧪 Testing and Validation

### Unit Tests
```python
import unittest
from multi_category_corrector import MultiCategoryDistortionCorrector

class TestMultiCategoryCorrector(unittest.TestCase):
    
    def setUp(self):
        self.corrector = MultiCategoryDistortionCorrector()
        self.sample_data = {
            'cat1': {'q1': 3, 'q2': 4, 'q3': 3},
            'cat2': {'q1': 2, 'q2': 3, 'q3': 4},
            'cat3': {'q1': 4, 'q2': 3, 'q3': 2}
        }
    
    def test_basic_correction(self):
        """Test basic correction functionality."""
        results = self.corrector.correct_multi_category(self.sample_data)
        
        self.assertIn('corrected_categories', results)
        self.assertIn('response_style', results)
        self.assertIn('metadata', results)
        
    def test_high_acquiescence_detection(self):
        """Test detection of high acquiescence bias."""
        high_bias_data = {
            'cat1': {'q1': 5, 'q2': 5, 'q3': 5},
            'cat2': {'q1': 5, 'q2': 4, 'q3': 5},
            'cat3': {'q1': 4, 'q2': 5, 'q3': 5}
        }
        
        results = self.corrector.correct_multi_category(high_bias_data)
        self.assertEqual(results['response_style'], 'high_acquiescence')
        self.assertLess(results['metadata']['global_factor'], 1.0)
    
    def test_score_bounds(self):
        """Test that corrected scores stay within bounds."""
        results = self.corrector.correct_multi_category(self.sample_data)
        
        for category_data in results['corrected_categories'].values():
            corrected_score = category_data['corrected_score']
            self.assertGreaterEqual(corrected_score, self.corrector.min_score)
            self.assertLessEqual(corrected_score, self.corrector.max_score)
    
    def test_input_validation(self):
        """Test input validation."""
        with self.assertRaises(ValueError):
            self.corrector.correct_multi_category({})  # Empty data
        
        with self.assertRaises(ValueError):
            self.corrector.correct_multi_category({
                'cat1': {'q1': 6}  # Out of range
            })

if __name__ == '__main__':
    unittest.main()
```

### Performance Testing
```python
import time
import random

def performance_test():
    """Test performance with large datasets."""
    corrector = MultiCategoryDistortionCorrector()
    
    # Generate large test dataset (20 categories, 5 questions each)
    large_dataset = {}
    for cat_num in range(20):
        category_id = f'category_{cat_num:02d}'
        large_dataset[category_id] = {}
        for q_num in range(5):
            question_id = f'q{q_num + 1}'
            large_dataset[category_id][question_id] = random.randint(1, 5)
    
    # Measure processing time
    start_time = time.time()
    results = corrector.correct_multi_category(large_dataset)
    end_time = time.time()
    
    processing_time = end_time - start_time
    
    print(f"Performance Test Results:")
    print(f"Categories: {len(large_dataset)}")
    print(f"Total Questions: {results['metadata']['total_questions']}")
    print(f"Processing Time: {processing_time:.4f} seconds")
    print(f"Questions/Second: {results['metadata']['total_questions']/processing_time:.2f}")
    
    return processing_time

# Run performance test
if __name__ == "__main__":
    performance_test()
```

## 🌐 Web Application Integration

### Flask App Example
See `web_app.py` for a complete Flask application that provides:
- REST API endpoints for assessment processing
- Web interface for manual testing
- Batch processing capabilities
- Results visualization

### API Usage
```python
# Start the Flask app
# python web_app.py

# Then make requests:
import requests

response = requests.post('http://localhost:5000/api/assess', json={
    'participant_id': 'TEST_001',
    'category_data': {
        'leadership': {'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5},
        # ... more categories
    }
})

results = response.json()
print(f"Response Style: {results['response_style']}")
```

## 📋 Requirements

```txt
# Core dependencies
numpy>=1.19.0
scipy>=1.5.0

# Web application (optional)
flask>=2.0.0
flask-cors>=3.0.0

# Data processing (optional)
pandas>=1.3.0
matplotlib>=3.3.0
seaborn>=0.11.0

# Testing
pytest>=6.0.0
pytest-cov>=2.10.0
```

## 🔗 Related Files

- [Algorithm Specification](../../docs/algorithm-specification.md)
- [JavaScript Implementation](../javascript/README.md)
- [Bubble.io Tutorial](../bubble/README.md)
- [Live Example](../../examples/comprehensive-assessment.html)