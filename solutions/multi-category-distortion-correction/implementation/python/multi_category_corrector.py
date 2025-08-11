"""
Multi-Category Distortion Correction
Advanced bias correction for multi-category psychological assessments

@version 1.0.0
@author Bias Tools Project
"""

import math
import statistics
from typing import Dict, List, Tuple, Any, Optional
import json


class MultiCategoryDistortionCorrector:
    """
    Advanced distortion correction for multi-category assessments that preserves
    relative differences between categories while correcting response bias.
    """
    
    def __init__(self, 
                 max_global_adjustment: float = 0.3,
                 max_relative_adjustment: float = 0.15,
                 min_score: float = 1.01,
                 max_score: float = 5.0,
                 debug_mode: bool = False):
        """
        Initialize the multi-category distortion corrector.
        
        Args:
            max_global_adjustment: Maximum global correction factor (default 0.3 = 30%)
            max_relative_adjustment: Maximum relative adjustment factor (default 0.15 = 15%)
            min_score: Minimum allowed score after correction
            max_score: Maximum allowed score after correction
            debug_mode: Enable detailed logging
        """
        self.max_global_adjustment = max_global_adjustment
        self.max_relative_adjustment = max_relative_adjustment
        self.min_score = min_score
        self.max_score = max_score
        self.debug_mode = debug_mode
    
    def correct_multi_category(self, category_data: Dict[str, Dict[str, int]]) -> Dict[str, Any]:
        """
        Main entry point for multi-category correction.
        
        Args:
            category_data: Dictionary with category_id as keys, responses as values
                          Format: {'category1': {'q1': 4, 'q2': 5, ...}, ...}
        
        Returns:
            Dictionary containing correction results and metadata
        """
        try:
            if self.debug_mode:
                print(f"Starting multi-category correction for {len(category_data)} categories...")
            
            # Validate input data
            self._validate_category_data(category_data)
            
            # Step 1: Global analysis
            global_stats = self._calculate_global_stats(category_data)
            response_style = self._classify_response_style(global_stats)
            
            # Step 2: Category positioning
            category_scores = self._calculate_category_scores(category_data)
            positioning = self._calculate_category_positioning(category_scores)
            
            # Step 3: Apply corrections
            global_factor = self._calculate_global_correction(response_style, global_stats)
            corrected_categories = self._apply_category_corrections(
                positioning, response_style, global_factor
            )
            
            # Step 4: Generate results
            results = {
                'corrected_categories': corrected_categories,
                'original_categories': category_scores,
                'global_stats': global_stats,
                'response_style': response_style,
                'metadata': {
                    'global_factor': global_factor,
                    'total_categories': len(category_data),
                    'total_questions': global_stats['total_questions'],
                    'correction_applied': global_factor != 1.0 or response_style != 'balanced'
                }
            }
            
            if self.debug_mode:
                print("Correction completed successfully")
                
            return results
            
        except Exception as e:
            print(f"Error in multi-category correction: {e}")
            raise
    
    def _calculate_global_stats(self, category_data: Dict[str, Dict[str, int]]) -> Dict[str, Any]:
        """Calculate global statistics across all responses."""
        all_responses = []
        
        for responses in category_data.values():
            all_responses.extend(responses.values())
        
        total_questions = len(all_responses)
        global_responses_5 = sum(1 for val in all_responses if val == 5)
        global_responses_1 = sum(1 for val in all_responses if val == 1)
        global_mean = statistics.mean(all_responses)
        variance = statistics.variance(all_responses) if len(all_responses) > 1 else 0
        
        return {
            'total_questions': total_questions,
            'global_responses_5': global_responses_5,
            'global_responses_1': global_responses_1,
            'responses_5_percent': global_responses_5 / total_questions,
            'responses_1_percent': global_responses_1 / total_questions,
            'global_mean': global_mean,
            'variance': variance,
            'standard_deviation': math.sqrt(variance) if variance > 0 else 0
        }
    
    def _classify_response_style(self, global_stats: Dict[str, Any]) -> str:
        """Classify overall response style based on global patterns."""
        responses_5_percent = global_stats['responses_5_percent']
        responses_1_percent = global_stats['responses_1_percent']
        global_mean = global_stats['global_mean']
        variance = global_stats['variance']
        
        # High acquiescence (tendency to agree/rate high)
        if responses_5_percent >= 0.4 or global_mean >= 4.2:
            return 'high_acquiescence'
        
        # Low acquiescence (tendency to disagree/rate low)
        if responses_1_percent >= 0.4 or global_mean <= 2.2:
            return 'low_acquiescence'
        
        # Extreme response style (uses extremes, low variance)
        if (responses_5_percent + responses_1_percent) >= 0.6 and variance < 1.5:
            return 'extreme_style'
        
        # Central tendency (avoids extremes)
        if responses_5_percent < 0.1 and responses_1_percent < 0.1:
            return 'central_tendency'
        
        return 'balanced'
    
    def _calculate_category_scores(self, category_data: Dict[str, Dict[str, int]]) -> Dict[str, float]:
        """Calculate mean scores for each category."""
        category_scores = {}
        
        for category_id, responses in category_data.items():
            scores = list(responses.values())
            category_scores[category_id] = statistics.mean(scores)
        
        return category_scores
    
    def _calculate_category_positioning(self, category_scores: Dict[str, float]) -> Dict[str, Dict[str, Any]]:
        """Calculate relative positioning of categories."""
        scores = list(category_scores.values())
        sorted_scores = sorted(scores, reverse=True)
        global_mean = statistics.mean(scores)
        std_dev = max(0.5, statistics.stdev(scores)) if len(scores) > 1 else 0.5
        
        positioning = {}
        
        for category_id, score in category_scores.items():
            rank = sorted_scores.index(score) + 1
            percentile_rank = (len(scores) - rank + 1) / len(scores)
            relative_distance = (score - global_mean) / std_dev
            
            positioning[category_id] = {
                'score': score,
                'rank': rank,
                'percentile_rank': percentile_rank,
                'relative_distance': relative_distance,
                'is_above_average': score > global_mean,
                'distance_from_mean': abs(score - global_mean)
            }
        
        return positioning
    
    def _calculate_global_correction(self, response_style: str, global_stats: Dict[str, Any]) -> float:
        """Calculate global correction factor based on response style."""
        responses_5_percent = global_stats['responses_5_percent']
        responses_1_percent = global_stats['responses_1_percent']
        global_factor = 1.0
        
        if response_style == 'high_acquiescence':
            # Reduce scores based on extent of high rating bias
            high_bias = min(self.max_global_adjustment, responses_5_percent * 0.5)
            global_factor = 1 - high_bias
        elif response_style == 'low_acquiescence':
            # Boost scores based on extent of low rating bias
            low_bias = min(self.max_global_adjustment, responses_1_percent * 0.5)
            global_factor = 1 + low_bias
        elif response_style == 'extreme_style':
            # Moderate extreme scores toward center
            extreme_bias = (responses_5_percent + responses_1_percent) * 0.2
            global_factor = 1 - min(0.15, extreme_bias)
        elif response_style == 'central_tendency':
            # Slightly expand range to increase discrimination
            global_factor = 1.05
        
        return max(0.7, min(1.3, global_factor))
    
    def _calculate_relative_factor(self, category_position: Dict[str, Any], response_style: str) -> float:
        """Calculate relative preservation factor for a category."""
        relative_distance = category_position['relative_distance']
        is_above_average = category_position['is_above_average']
        relative_factor = 1.0
        
        # For balanced responses, no additional adjustment needed
        if response_style == 'balanced':
            return 1.0
        
        # Apply differential correction to maintain relative positioning
        if response_style == 'high_acquiescence':
            # Preserve higher-scoring categories' relative advantage
            if is_above_average:
                relative_factor = 1.0 + (relative_distance * 0.1)
            else:
                relative_factor = 1.0 - (abs(relative_distance) * 0.05)
        elif response_style == 'low_acquiescence':
            # Preserve lower-scoring categories' relative positioning
            if not is_above_average:
                relative_factor = 1.0 - (abs(relative_distance) * 0.1)
            else:
                relative_factor = 1.0 + (relative_distance * 0.05)
        elif response_style == 'extreme_style':
            # Moderate relative differences slightly
            relative_factor = 1.0 + (relative_distance * 0.05)
        elif response_style == 'central_tendency':
            # Enhance relative differences
            relative_factor = 1.0 + (relative_distance * 0.1)
        
        # Ensure relative factor stays within bounds
        return max(0.85, min(1.15, relative_factor))
    
    def _apply_category_corrections(self, 
                                  positioning: Dict[str, Dict[str, Any]], 
                                  response_style: str, 
                                  global_factor: float) -> Dict[str, Dict[str, Any]]:
        """Apply corrections to all categories."""
        corrected_categories = {}
        
        for category_id, position in positioning.items():
            relative_factor = self._calculate_relative_factor(position, response_style)
            
            # Apply combined correction
            original_score = position['score']
            corrected_score = original_score * global_factor * relative_factor
            
            # Ensure score bounds
            corrected_score = max(self.min_score, min(self.max_score, corrected_score))
            
            corrected_categories[category_id] = {
                'original_score': original_score,
                'corrected_score': corrected_score,
                'global_factor': global_factor,
                'relative_factor': relative_factor,
                'total_adjustment': corrected_score / original_score,
                'adjustment_percent': round((corrected_score / original_score - 1) * 100, 2),
                'position': position.copy()
            }
        
        return corrected_categories
    
    def generate_report(self, correction_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed correction report."""
        corrected_categories = correction_results['corrected_categories']
        global_stats = correction_results['global_stats']
        response_style = correction_results['response_style']
        metadata = correction_results['metadata']
        
        report = {
            'summary': {
                'response_style': response_style,
                'global_factor': metadata['global_factor'],
                'total_categories': metadata['total_categories'],
                'total_questions': metadata['total_questions'],
                'correction_applied': metadata['correction_applied']
            },
            'categories': {},
            'statistics': {
                'original_mean': 0,
                'corrected_mean': 0,
                'largest_adjustment': 0,
                'average_adjustment': 0
            }
        }
        
        total_original = 0
        total_corrected = 0
        adjustments = []
        
        for category_id, data in corrected_categories.items():
            total_original += data['original_score']
            total_corrected += data['corrected_score']
            adjustments.append(abs(data['total_adjustment'] - 1))
            
            report['categories'][category_id] = {
                'original_score': round(data['original_score'], 3),
                'corrected_score': round(data['corrected_score'], 3),
                'adjustment_percent': f"{data['adjustment_percent']}%",
                'rank': data['position']['rank'],
                'percentile': f"{data['position']['percentile_rank'] * 100:.1f}%"
            }
        
        # Calculate summary statistics
        category_count = len(corrected_categories)
        report['statistics']['original_mean'] = round(total_original / category_count, 3)
        report['statistics']['corrected_mean'] = round(total_corrected / category_count, 3)
        report['statistics']['largest_adjustment'] = f"{max(adjustments) * 100:.2f}%"
        report['statistics']['average_adjustment'] = f"{statistics.mean(adjustments) * 100:.2f}%"
        
        return report
    
    def _validate_category_data(self, category_data: Dict[str, Dict[str, int]]) -> bool:
        """Validate category data format."""
        if not isinstance(category_data, dict):
            raise ValueError("Category data must be a dictionary")
        
        if not category_data:
            raise ValueError("Category data cannot be empty")
        
        for category_id, responses in category_data.items():
            if not isinstance(responses, dict):
                raise ValueError(f"Invalid responses for category {category_id}")
            
            if not responses:
                raise ValueError(f"No responses found for category {category_id}")
            
            for question_id, value in responses.items():
                if not isinstance(value, (int, float)):
                    raise ValueError(f"Invalid response value {value} for category {category_id}, question {question_id}")
                
                if not (1 <= value <= 5):
                    raise ValueError(f"Response value {value} out of range (1-5) for category {category_id}, question {question_id}")
        
        return True
    
    def export_results(self, correction_results: Dict[str, Any], filename: str = None) -> str:
        """Export correction results to JSON file."""
        if filename is None:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"multi_category_correction_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(correction_results, f, indent=2, default=str)
        
        return filename


# Example usage and testing
if __name__ == "__main__":
    # Example data: 5 categories with 3 questions each
    sample_data = {
        'leadership': {'q1': 5, 'q2': 5, 'q3': 4},
        'communication': {'q1': 5, 'q2': 4, 'q3': 5},
        'teamwork': {'q1': 4, 'q2': 5, 'q3': 5},
        'problem_solving': {'q1': 3, 'q2': 4, 'q3': 4},
        'adaptability': {'q1': 5, 'q2': 5, 'q3': 5}
    }
    
    # Initialize corrector
    corrector = MultiCategoryDistortionCorrector(debug_mode=True)
    
    # Apply correction
    results = corrector.correct_multi_category(sample_data)
    
    # Generate report
    report = corrector.generate_report(results)
    
    print("\n" + "="*50)
    print("MULTI-CATEGORY CORRECTION RESULTS")
    print("="*50)
    print(f"Response Style: {results['response_style']}")
    print(f"Global Factor: {results['metadata']['global_factor']:.3f}")
    print(f"Correction Applied: {results['metadata']['correction_applied']}")
    
    print("\nCategory Results:")
    for category_id, data in results['corrected_categories'].items():
        print(f"{category_id:15} | Original: {data['original_score']:.2f} | "
              f"Corrected: {data['corrected_score']:.2f} | "
              f"Adjustment: {data['adjustment_percent']:>6}%")
    
    print(f"\nSummary Statistics:")
    print(f"Original Mean: {report['statistics']['original_mean']}")
    print(f"Corrected Mean: {report['statistics']['corrected_mean']}")
    print(f"Largest Adjustment: {report['statistics']['largest_adjustment']}")
    print(f"Average Adjustment: {report['statistics']['average_adjustment']}")