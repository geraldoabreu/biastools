# Python Tutorial - Multi-Category Distortion Correction

This tutorial provides comprehensive instructions for implementing Multi-Category Distortion Correction in Python applications.

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Data Analysis Integration](#data-analysis-integration)
5. [Web Application Development](#web-application-development)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Installation and Setup

### Prerequisites

- Python 3.7 or higher
- Basic Python programming knowledge
- Understanding of statistical concepts

### Dependencies

```bash
# Install required packages
pip install numpy scipy pandas matplotlib seaborn flask

# For advanced features (optional)
pip install scikit-learn jupyter plotly dash
```

### Basic Setup

```python
# Import the corrector
from multi_category_corrector import MultiCategoryDistortionCorrector

# Initialize with default settings
corrector = MultiCategoryDistortionCorrector()

# Initialize with custom settings
corrector = MultiCategoryDistortionCorrector(
    max_global_adjustment=0.3,
    max_relative_adjustment=0.15,
    min_score=1.01,
    max_score=5.0,
    debug_mode=True
)
```

## Basic Usage

### Step 1: Prepare Your Data

```python
# Data format: Dictionary with category IDs as keys, question responses as values
assessment_data = {
    'leadership': {'q1': 5, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 5},
    'communication': {'q1': 4, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 4},
    'problem_solving': {'q1': 3, 'q2': 4, 'q3': 3, 'q4': 4, 'q5': 3},
    'teamwork': {'q1': 5, 'q2': 5, 'q3': 5, 'q4': 4, 'q5': 5},
    'adaptability': {'q1': 4, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 4}
}

print(f"Assessment contains {len(assessment_data)} categories")
total_questions = sum(len(responses) for responses in assessment_data.values())
print(f"Total questions: {total_questions}")
```

### Step 2: Apply Correction

```python
try:
    # Apply multi-category correction
    results = corrector.correct_multi_category(assessment_data)
    
    print(f"Response Style: {results['response_style']}")
    print(f"Global Factor: {results['metadata']['global_factor']:.3f}")
    print(f"Correction Applied: {results['metadata']['correction_applied']}")
    
except Exception as e:
    print(f"Error during correction: {e}")
```

### Step 3: Analyze Results

```python
# Display corrected results
print("\n=== CORRECTION RESULTS ===")
for category_id, data in results['corrected_categories'].items():
    print(f"{category_id.replace('_', ' ').title()}:")
    print(f"  Original: {data['original_score']:.2f}")
    print(f"  Corrected: {data['corrected_score']:.2f}")
    print(f"  Adjustment: {data['adjustment_percent']:+.1f}%")
    print(f"  Rank: #{data['position']['rank']}")
    print()

# Generate detailed report
report = corrector.generate_report(results)
print("=== SUMMARY STATISTICS ===")
print(f"Original Mean: {report['statistics']['original_mean']}")
print(f"Corrected Mean: {report['statistics']['corrected_mean']}")
print(f"Largest Adjustment: {report['statistics']['largest_adjustment']}")
print(f"Average Adjustment: {report['statistics']['average_adjustment']}")
```

## Advanced Features

### Custom Response Style Detection

```python
class CustomDistortionCorrector(MultiCategoryDistortionCorrector):
    """Extended corrector with domain-specific response style detection."""
    
    def _classify_response_style(self, global_stats):
        """Override with custom classification logic."""
        responses_5_percent = global_stats['responses_5_percent']
        responses_1_percent = global_stats['responses_1_percent']
        global_mean = global_stats['global_mean']
        variance = global_stats['variance']
        
        # Custom logic for specific domains
        if global_mean >= 4.5 and responses_5_percent >= 0.7:
            return 'extreme_high_acquiescence'
        elif global_mean <= 1.8 and responses_1_percent >= 0.7:
            return 'extreme_low_acquiescence'
        
        # Fall back to parent implementation
        return super()._classify_response_style(global_stats)
    
    def _calculate_global_correction(self, response_style, global_stats):
        """Override with custom correction factors."""
        if response_style == 'extreme_high_acquiescence':
            return 0.5  # 50% reduction for extreme cases
        elif response_style == 'extreme_low_acquiescence':
            return 1.5  # 50% increase for extreme cases
        
        return super()._calculate_global_correction(response_style, global_stats)

# Usage
custom_corrector = CustomDistortionCorrector(debug_mode=True)
custom_results = custom_corrector.correct_multi_category(assessment_data)
```

### Batch Processing

```python
import pandas as pd
from datetime import datetime
import logging

def process_batch_assessments(assessment_list, output_file=None):
    """Process multiple assessments in batch with comprehensive logging."""
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    corrector = MultiCategoryDistortionCorrector(debug_mode=False)
    results = []
    
    logger.info(f"Starting batch processing of {len(assessment_list)} assessments")
    
    for i, assessment in enumerate(assessment_list):
        try:
            # Process assessment
            participant_id = assessment.get('participant_id', f'P{i+1:03d}')
            data = assessment['data']
            
            correction_results = corrector.correct_multi_category(data)
            report = corrector.generate_report(correction_results)
            
            # Compile results
            result_record = {
                'participant_id': participant_id,
                'timestamp': datetime.now().isoformat(),
                'response_style': correction_results['response_style'],
                'global_factor': correction_results['metadata']['global_factor'],
                'correction_applied': correction_results['metadata']['correction_applied'],
                'total_categories': correction_results['metadata']['total_categories'],
                'total_questions': correction_results['metadata']['total_questions'],
                'original_mean': report['statistics']['original_mean'],
                'corrected_mean': report['statistics']['corrected_mean'],
                'largest_adjustment': report['statistics']['largest_adjustment'].rstrip('%'),
                'average_adjustment': report['statistics']['average_adjustment'].rstrip('%')
            }
            
            # Add category-specific results
            for category_id, cat_data in correction_results['corrected_categories'].items():
                result_record[f'{category_id}_original'] = cat_data['original_score']
                result_record[f'{category_id}_corrected'] = cat_data['corrected_score']
                result_record[f'{category_id}_rank'] = cat_data['position']['rank']
            
            results.append(result_record)
            
            if (i + 1) % 10 == 0:
                logger.info(f"Processed {i + 1}/{len(assessment_list)} assessments")
                
        except Exception as e:
            logger.error(f"Error processing assessment {i}: {e}")
            results.append({
                'participant_id': assessment.get('participant_id', f'P{i+1:03d}'),
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    # Convert to DataFrame
    df_results = pd.DataFrame(results)
    
    # Save to file if specified
    if output_file:
        df_results.to_csv(output_file, index=False)
        logger.info(f"Results saved to {output_file}")
    
    logger.info("Batch processing completed")
    return df_results

# Example usage
sample_assessments = [
    {
        'participant_id': 'P001',
        'data': {
            'leadership': {'q1': 5, 'q2': 5, 'q3': 4, 'q4': 5, 'q5': 5},
            'communication': {'q1': 4, 'q2': 4, 'q3': 5, 'q4': 4, 'q5': 4},
            'teamwork': {'q1': 3, 'q2': 3, 'q3': 3, 'q4': 4, 'q5': 3}
        }
    },
    {
        'participant_id': 'P002',
        'data': {
            'leadership': {'q1': 2, 'q2': 2, 'q3': 1, 'q4': 2, 'q5': 1},
            'communication': {'q1': 1, 'q2': 2, 'q3': 1, 'q4': 1, 'q5': 2},
            'teamwork': {'q1': 2, 'q2': 1, 'q3': 2, 'q4': 1, 'q5': 1}
        }
    }
]

batch_results = process_batch_assessments(sample_assessments, 'batch_results.csv')
print(batch_results.head())
```

## Data Analysis Integration

### Statistical Analysis

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

def analyze_correction_patterns(results_df):
    """Comprehensive statistical analysis of correction patterns."""
    
    # Set up the plotting style
    plt.style.use('seaborn-v0_8')
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. Response Style Distribution
    style_counts = results_df['response_style'].value_counts()
    axes[0, 0].pie(style_counts.values, labels=style_counts.index, autopct='%1.1f%%')
    axes[0, 0].set_title('Response Style Distribution')
    
    # 2. Global Factor Distribution
    axes[0, 1].hist(results_df['global_factor'], bins=20, alpha=0.7, edgecolor='black')
    axes[0, 1].axvline(1.0, color='red', linestyle='--', label='No Correction')
    axes[0, 1].set_xlabel('Global Correction Factor')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].set_title('Global Correction Factor Distribution')
    axes[0, 1].legend()
    
    # 3. Original vs Corrected Means
    axes[1, 0].scatter(results_df['original_mean'], results_df['corrected_mean'], alpha=0.6)
    axes[1, 0].plot([1, 5], [1, 5], 'r--', label='No Change Line')
    axes[1, 0].set_xlabel('Original Mean Score')
    axes[1, 0].set_ylabel('Corrected Mean Score')
    axes[1, 0].set_title('Original vs Corrected Scores')
    axes[1, 0].legend()
    
    # 4. Adjustment Magnitude Distribution
    adjustments = pd.to_numeric(results_df['average_adjustment'], errors='coerce')
    axes[1, 1].hist(adjustments, bins=20, alpha=0.7, edgecolor='black')
    axes[1, 1].axvline(0, color='red', linestyle='--', label='No Adjustment')
    axes[1, 1].set_xlabel('Average Adjustment (%)')
    axes[1, 1].set_ylabel('Frequency')
    axes[1, 1].set_title('Adjustment Magnitude Distribution')
    axes[1, 1].legend()
    
    plt.tight_layout()
    plt.show()
    
    # Statistical summary
    print("=== STATISTICAL SUMMARY ===")
    print(f"Total Assessments: {len(results_df)}")
    print(f"Correction Rate: {(results_df['correction_applied'] == True).mean():.1%}")
    print(f"Mean Global Factor: {results_df['global_factor'].mean():.3f}")
    print(f"Global Factor Std: {results_df['global_factor'].std():.3f}")
    
    # Response style analysis
    print("\n=== RESPONSE STYLE ANALYSIS ===")
    for style, group in results_df.groupby('response_style'):
        print(f"{style}:")
        print(f"  Count: {len(group)}")
        print(f"  Mean Global Factor: {group['global_factor'].mean():.3f}")
        print(f"  Mean Adjustment: {pd.to_numeric(group['average_adjustment'], errors='coerce').mean():.1f}%")

# Usage with batch results
analyze_correction_patterns(batch_results)
```

### Category-Level Analysis

```python
def analyze_category_performance(results_df):
    """Analyze performance patterns across categories."""
    
    # Extract category columns
    category_cols = [col for col in results_df.columns if col.endswith('_original') or col.endswith('_corrected')]
    category_names = list(set([col.split('_')[0] for col in category_cols if '_' in col]))
    
    # Create category analysis DataFrame
    category_analysis = []
    
    for category in category_names:
        orig_col = f'{category}_original'
        corr_col = f'{category}_corrected'
        
        if orig_col in results_df.columns and corr_col in results_df.columns:
            category_analysis.append({
                'category': category,
                'mean_original': results_df[orig_col].mean(),
                'mean_corrected': results_df[corr_col].mean(),
                'std_original': results_df[orig_col].std(),
                'std_corrected': results_df[corr_col].std(),
                'mean_change': results_df[corr_col].mean() - results_df[orig_col].mean(),
                'correlation': results_df[orig_col].corr(results_df[corr_col])
            })
    
    category_df = pd.DataFrame(category_analysis)
    
    # Visualization
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # 1. Mean scores comparison
    x = range(len(category_df))
    width = 0.35
    axes[0, 0].bar([i - width/2 for i in x], category_df['mean_original'], width, label='Original', alpha=0.7)
    axes[0, 0].bar([i + width/2 for i in x], category_df['mean_corrected'], width, label='Corrected', alpha=0.7)
    axes[0, 0].set_xlabel('Categories')
    axes[0, 0].set_ylabel('Mean Score')
    axes[0, 0].set_title('Mean Scores: Original vs Corrected')
    axes[0, 0].set_xticks(x)
    axes[0, 0].set_xticklabels(category_df['category'], rotation=45)
    axes[0, 0].legend()
    
    # 2. Score changes
    axes[0, 1].bar(x, category_df['mean_change'], alpha=0.7)
    axes[0, 1].axhline(0, color='red', linestyle='--')
    axes[0, 1].set_xlabel('Categories')
    axes[0, 1].set_ylabel('Mean Change (Corrected - Original)')
    axes[0, 1].set_title('Score Changes by Category')
    axes[0, 1].set_xticks(x)
    axes[0, 1].set_xticklabels(category_df['category'], rotation=45)
    
    # 3. Variance comparison
    axes[1, 0].scatter(category_df['std_original'], category_df['std_corrected'], alpha=0.7)
    axes[1, 0].plot([0, category_df['std_original'].max()], [0, category_df['std_original'].max()], 'r--')
    axes[1, 0].set_xlabel('Original Std Dev')
    axes[1, 0].set_ylabel('Corrected Std Dev')
    axes[1, 0].set_title('Variance Preservation')
    
    # 4. Correlation preservation
    axes[1, 1].bar(x, category_df['correlation'], alpha=0.7)
    axes[1, 1].axhline(1.0, color='red', linestyle='--', label='Perfect Correlation')
    axes[1, 1].set_xlabel('Categories')
    axes[1, 1].set_ylabel('Original-Corrected Correlation')
    axes[1, 1].set_title('Score Correlation Preservation')
    axes[1, 1].set_xticks(x)
    axes[1, 1].set_xticklabels(category_df['category'], rotation=45)
    axes[1, 1].legend()
    
    plt.tight_layout()
    plt.show()
    
    return category_df

category_analysis = analyze_category_performance(batch_results)
print(category_analysis)
```

## Web Application Development

### Flask REST API

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize corrector
corrector = MultiCategoryDistortionCorrector(debug_mode=False)

@app.route('/api/assess', methods=['POST'])
def assess_participant():
    """Process individual assessment with multi-category correction."""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'category_data' not in data:
            return jsonify({
                'error': 'Missing required field: category_data'
            }), 400
        
        participant_id = data.get('participant_id', 'anonymous')
        category_data = data['category_data']
        
        # Apply correction
        results = corrector.correct_multi_category(category_data)
        report = corrector.generate_report(results)
        
        # Format response
        response = {
            'participant_id': participant_id,
            'timestamp': datetime.now().isoformat(),
            'response_style': results['response_style'],
            'global_factor': round(results['metadata']['global_factor'], 4),
            'correction_applied': results['metadata']['correction_applied'],
            'categories': {},
            'statistics': report['statistics']
        }
        
        # Add category details
        for category_id, cat_data in results['corrected_categories'].items():
            response['categories'][category_id] = {
                'original_score': round(cat_data['original_score'], 3),
                'corrected_score': round(cat_data['corrected_score'], 3),
                'adjustment_percent': cat_data['adjustment_percent'],
                'rank': cat_data['position']['rank'],
                'percentile': round(cat_data['position']['percentile_rank'] * 100, 1)
            }
        
        logger.info(f"Assessment processed for participant {participant_id}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Assessment processing error: {e}")
        return jsonify({
            'error': 'Assessment processing failed',
            'message': str(e)
        }), 500

@app.route('/api/batch-assess', methods=['POST'])
def batch_assess():
    """Process multiple assessments in batch."""
    try:
        data = request.get_json()
        assessments = data.get('assessments', [])
        
        if not assessments:
            return jsonify({'error': 'No assessments provided'}), 400
        
        results = []
        for i, assessment in enumerate(assessments):
            try:
                result = corrector.correct_multi_category(assessment['category_data'])
                results.append({
                    'participant_id': assessment.get('participant_id', f'P{i+1}'),
                    'success': True,
                    'response_style': result['response_style'],
                    'global_factor': result['metadata']['global_factor'],
                    'correction_applied': result['metadata']['correction_applied']
                })
            except Exception as e:
                results.append({
                    'participant_id': assessment.get('participant_id', f'P{i+1}'),
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'total_processed': len(assessments),
            'successful': sum(1 for r in results if r.get('success', False)),
            'failed': sum(1 for r in results if not r.get('success', True)),
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Multi-Category Distortion Corrector',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### Streamlit Dashboard

```python
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

def create_assessment_dashboard():
    """Create an interactive Streamlit dashboard for assessment analysis."""
    
    st.set_page_config(
        page_title="Multi-Category Assessment Dashboard",
        page_icon="📊",
        layout="wide"
    )
    
    st.title("Multi-Category Distortion Correction Dashboard")
    st.markdown("---")
    
    # Sidebar for configuration
    st.sidebar.header("Configuration")
    max_global_adj = st.sidebar.slider("Max Global Adjustment", 0.1, 0.5, 0.3)
    max_relative_adj = st.sidebar.slider("Max Relative Adjustment", 0.05, 0.25, 0.15)
    debug_mode = st.sidebar.checkbox("Debug Mode", False)
    
    # Initialize corrector with user settings
    corrector = MultiCategoryDistortionCorrector(
        max_global_adjustment=max_global_adj,
        max_relative_adjustment=max_relative_adj,
        debug_mode=debug_mode
    )
    
    # Main content area
    tab1, tab2, tab3 = st.tabs(["Single Assessment", "Batch Processing", "Analysis"])
    
    with tab1:
        st.header("Single Assessment Processing")
        
        # File upload
        uploaded_file = st.file_uploader("Upload Assessment Data (JSON)", type=['json'])
        
        if uploaded_file is not None:
            try:
                import json
                assessment_data = json.load(uploaded_file)
                
                # Display input data
                st.subheader("Input Data")
                st.json(assessment_data)
                
                # Process assessment
                if st.button("Process Assessment"):
                    with st.spinner("Processing..."):
                        results = corrector.correct_multi_category(assessment_data)
                        report = corrector.generate_report(results)
                    
                    # Display results
                    st.subheader("Results")
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Response Style", results['response_style'])
                    with col2:
                        st.metric("Global Factor", f"{results['metadata']['global_factor']:.3f}")
                    with col3:
                        st.metric("Correction Applied", "Yes" if results['metadata']['correction_applied'] else "No")
                    
                    # Category results visualization
                    st.subheader("Category Results")
                    
                    categories = []
                    original_scores = []
                    corrected_scores = []
                    
                    for cat_id, data in results['corrected_categories'].items():
                        categories.append(cat_id.replace('_', ' ').title())
                        original_scores.append(data['original_score'])
                        corrected_scores.append(data['corrected_score'])
                    
                    # Create comparison chart
                    fig = go.Figure()
                    fig.add_trace(go.Bar(name='Original', x=categories, y=original_scores))
                    fig.add_trace(go.Bar(name='Corrected', x=categories, y=corrected_scores))
                    fig.update_layout(barmode='group', title='Original vs Corrected Scores')
                    st.plotly_chart(fig, use_container_width=True)
                    
            except Exception as e:
                st.error(f"Error processing assessment: {e}")
    
    with tab2:
        st.header("Batch Processing")
        st.write("Upload multiple assessments for batch processing")
        
        # Batch file upload
        batch_file = st.file_uploader("Upload Batch Data (CSV)", type=['csv'])
        
        if batch_file is not None:
            try:
                batch_df = pd.read_csv(batch_file)
                st.subheader("Batch Data Preview")
                st.dataframe(batch_df.head())
                
                if st.button("Process Batch"):
                    with st.spinner("Processing batch..."):
                        # Process batch (implementation depends on data format)
                        st.success("Batch processing completed!")
                        
            except Exception as e:
                st.error(f"Error processing batch: {e}")
    
    with tab3:
        st.header("Analysis & Insights")
        st.write("Upload results for analysis")
        
        # Analysis implementation here
        st.info("Upload processed results for detailed analysis")

if __name__ == "__main__":
    create_assessment_dashboard()
```

## Best Practices

### 1. Data Validation

```python
import pandas as pd
from typing import Dict, List, Union

def validate_assessment_data(data: Dict[str, Dict[str, Union[int, float]]]) -> List[str]:
    """Comprehensive validation of assessment data."""
    issues = []
    
    # Check basic structure
    if not isinstance(data, dict):
        issues.append("Data must be a dictionary")
        return issues
    
    if not data:
        issues.append("Data cannot be empty")
        return issues
    
    # Check each category
    for category_id, responses in data.items():
        if not isinstance(responses, dict):
            issues.append(f"Category '{category_id}': responses must be a dictionary")
            continue
        
        if not responses:
            issues.append(f"Category '{category_id}': no responses found")
            continue
        
        # Check response values
        for question_id, value in responses.items():
            if not isinstance(value, (int, float)):
                issues.append(f"Category '{category_id}', Question '{question_id}': value must be numeric")
            elif not (1 <= value <= 5):
                issues.append(f"Category '{category_id}', Question '{question_id}': value {value} out of range (1-5)")
    
    return issues

# Usage
def safe_process_assessment(data):
    """Safely process assessment with validation."""
    # Validate data
    issues = validate_assessment_data(data)
    if issues:
        return {
            'success': False,
            'errors': issues
        }
    
    try:
        corrector = MultiCategoryDistortionCorrector()
        results = corrector.correct_multi_category(data)
        return {
            'success': True,
            'results': results
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
```

### 2. Performance Monitoring

```python
import time
import psutil
import functools

def monitor_performance(func):
    """Decorator to monitor performance of correction functions."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Record start metrics
        start_time = time.time()
        start_memory = psutil.virtual_memory().used
        
        try:
            result = func(*args, **kwargs)
            success = True
        except Exception as e:
            result = {'error': str(e)}
            success = False
        
        # Record end metrics
        end_time = time.time()
        end_memory = psutil.virtual_memory().used
        
        # Calculate metrics
        processing_time = end_time - start_time
        memory_change = end_memory - start_memory
        
        # Add performance info to result
        if isinstance(result, dict):
            result['performance'] = {
                'processing_time_seconds': round(processing_time, 4),
                'memory_change_mb': round(memory_change / 1024 / 1024, 2),
                'success': success
            }
        
        return result
    
    return wrapper

# Usage
@monitor_performance
def process_with_monitoring(assessment_data):
    corrector = MultiCategoryDistortionCorrector()
    return corrector.correct_multi_category(assessment_data)
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Memory Issues with Large Datasets

```python
import gc

def process_large_dataset_efficiently(assessments, chunk_size=100):
    """Process large datasets in chunks to manage memory."""
    corrector = MultiCategoryDistortionCorrector(debug_mode=False)
    all_results = []
    
    for i in range(0, len(assessments), chunk_size):
        chunk = assessments[i:i+chunk_size]
        chunk_results = []
        
        for assessment in chunk:
            try:
                result = corrector.correct_multi_category(assessment['data'])
                chunk_results.append({
                    'participant_id': assessment['participant_id'],
                    'result': result
                })
            except Exception as e:
                chunk_results.append({
                    'participant_id': assessment['participant_id'],
                    'error': str(e)
                })
        
        all_results.extend(chunk_results)
        
        # Force garbage collection after each chunk
        gc.collect()
        
        print(f"Processed chunk {i//chunk_size + 1}/{(len(assessments)-1)//chunk_size + 1}")
    
    return all_results
```

#### 2. Handling Missing Data

```python
def handle_missing_data(assessment_data, strategy='mean_imputation'):
    """Handle missing data in assessment responses."""
    cleaned_data = {}
    
    for category_id, responses in assessment_data.items():
        cleaned_responses = {}
        values = [v for v in responses.values() if v is not None and 1 <= v <= 5]
        
        if not values:
            # No valid responses in category
            continue
        
        for question_id, value in responses.items():
            if value is None or not (1 <= value <= 5):
                if strategy == 'mean_imputation':
                    cleaned_responses[question_id] = sum(values) / len(values)
                elif strategy == 'median_imputation':
                    cleaned_responses[question_id] = sorted(values)[len(values)//2]
                elif strategy == 'mode_imputation':
                    from collections import Counter
                    cleaned_responses[question_id] = Counter(values).most_common(1)[0][0]
                else:  # skip
                    continue
            else:
                cleaned_responses[question_id] = value
        
        if cleaned_responses:
            cleaned_data[category_id] = cleaned_responses
    
    return cleaned_data
```

This comprehensive tutorial provides everything needed to implement multi-category distortion correction in Python applications, from basic usage to advanced features and production deployment.