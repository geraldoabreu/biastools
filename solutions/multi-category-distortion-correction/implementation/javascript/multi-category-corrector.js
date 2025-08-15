/**
 * Multi-Category Distortion Correction
 * Advanced bias correction for multi-category psychological assessments
 * 
 * @version 1.0.0
 * @author Bias Tools Project
 */

class MultiCategoryDistortionCorrector {
    constructor(options = {}) {
        this.options = {
            maxGlobalAdjustment: 0.3,      // 30% max global correction
            maxRelativeAdjustment: 0.15,   // 15% max relative adjustment
            minScore: 1.01,                // Minimum allowed score
            maxScore: 5.0,                 // Maximum allowed score
            debugMode: false,              // Enable detailed logging
            zeroVarianceThreshold: 0.01,   // Threshold for detecting zero variance
            categoryDifficultyAdjustment: 0.08, // Strength of CDI adjustment
            ...options
        };
        
        // Category Difficulty Indices (CDI) based on psychometric research
        // Higher values = more difficult/socially desirable = lower corrected scores
        this.categoryDifficultyIndices = {
            // Leadership categories
            'leadership': 0.15,
            'decision_making': 0.12,
            'strategic_thinking': 0.14,
            
            // Complex cognitive skills  
            'problem_solving': 0.10,
            'critical_thinking': 0.08,
            'creativity_innovation': 0.06,
            
            // Social/interpersonal skills
            'communication': 0.05,
            'emotional_intelligence': 0.03,
            'conflict_resolution': 0.04,
            
            // Collaborative skills (baseline)
            'teamwork': 0.00,
            'customer_service': -0.02,
            'negotiation': 0.01,
            
            // Adaptive skills
            'adaptability': -0.05,
            'time_management': -0.08,
            'project_management': -0.06,
            
            // Technical/concrete skills
            'technical_skills': -0.10,
            
            // Default for unknown categories
            'default': 0.00
        };
    }

    /**
     * Get Category Difficulty Index for a given category
     */
    getCategoryDifficultyIndex(categoryId) {
        // Normalize category ID to handle variations
        const normalizedId = categoryId.toLowerCase().replace(/[_\-\s]/g, '_');
        
        // Direct match
        if (this.categoryDifficultyIndices[normalizedId] !== undefined) {
            return this.categoryDifficultyIndices[normalizedId];
        }
        
        // Partial matching for common variations
        for (const [key, value] of Object.entries(this.categoryDifficultyIndices)) {
            if (normalizedId.includes(key) || key.includes(normalizedId)) {
                return value;
            }
        }
        
        // Default for unknown categories
        return this.categoryDifficultyIndices.default;
    }

    /**
     * Detect if we have a zero-variance scenario (all scores identical)
     */
    isZeroVarianceScenario(categoryScores) {
        const scores = Object.values(categoryScores);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((acc, val) => 
            acc + Math.pow(val - mean, 2), 0
        ) / scores.length;
        
        return variance < this.options.zeroVarianceThreshold;
    }

    /**
     * Main entry point for multi-category correction
     * @param {Object} categoryData - Object with categoryId as keys, responses as values
     * @returns {Object} Correction results and metadata
     */
    correctMultiCategory(categoryData) {
        try {
            if (this.options.debugMode) {
                console.log('Starting multi-category correction...', categoryData);
            }

            // Step 1: Global analysis
            const globalStats = this.calculateGlobalStats(categoryData);
            const responseStyle = this.classifyResponseStyle(globalStats);

            // Step 2: Category positioning
            const categoryScores = this.calculateCategoryScores(categoryData);
            const positioning = this.calculateCategoryPositioning(categoryScores);

            // Step 3: Apply corrections
            const globalFactor = this.calculateGlobalCorrection(responseStyle, globalStats);
            const correctedCategories = this.applyCategoryCorrections(
                positioning, responseStyle, globalFactor
            );

            // Step 4: Generate results
            const results = {
                correctedCategories,
                originalCategories: categoryScores,
                globalStats,
                responseStyle,
                metadata: {
                    globalFactor,
                    totalCategories: Object.keys(categoryData).length,
                    totalQuestions: globalStats.totalQuestions,
                    correctionApplied: globalFactor !== 1.0 || responseStyle !== 'balanced'
                }
            };

            if (this.options.debugMode) {
                console.log('Correction completed:', results);
            }

            return results;

        } catch (error) {
            console.error('Error in multi-category correction:', error);
            throw error;
        }
    }

    /**
     * Calculate global statistics across all responses
     */
    calculateGlobalStats(categoryData) {
        const allResponses = [];
        
        for (const responses of Object.values(categoryData)) {
            allResponses.push(...Object.values(responses));
        }

        const totalQuestions = allResponses.length;
        const globalResponses5 = allResponses.filter(val => val === 5).length;
        const globalResponses1 = allResponses.filter(val => val === 1).length;
        const globalSum = allResponses.reduce((a, b) => a + b, 0);
        const globalMean = globalSum / totalQuestions;

        // Calculate variance
        const variance = allResponses.reduce((acc, val) => 
            acc + Math.pow(val - globalMean, 2), 0
        ) / totalQuestions;

        return {
            totalQuestions,
            globalResponses5,
            globalResponses1,
            responses5Percent: globalResponses5 / totalQuestions,
            responses1Percent: globalResponses1 / totalQuestions,
            globalMean,
            variance,
            standardDeviation: Math.sqrt(variance)
        };
    }

    /**
     * Classify overall response style based on global patterns
     */
    classifyResponseStyle(globalStats) {
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

    /**
     * Calculate mean scores for each category
     */
    calculateCategoryScores(categoryData) {
        const categoryScores = {};
        
        for (const [categoryId, responses] of Object.entries(categoryData)) {
            const sum = Object.values(responses).reduce((a, b) => a + b, 0);
            categoryScores[categoryId] = sum / Object.keys(responses).length;
        }
        
        return categoryScores;
    }

    /**
     * Calculate relative positioning of categories
     */
    calculateCategoryPositioning(categoryScores) {
        const scores = Object.values(categoryScores);
        const sortedScores = [...scores].sort((a, b) => b - a);
        const globalMean = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Calculate variance for standardization
        const variance = scores.reduce((acc, val) => 
            acc + Math.pow(val - globalMean, 2), 0
        ) / scores.length;
        const stdDev = Math.max(0.5, Math.sqrt(variance)); // Prevent division by zero
        
        const positioning = {};
        
        for (const [categoryId, score] of Object.entries(categoryScores)) {
            const rank = sortedScores.indexOf(score) + 1;
            const percentileRank = (scores.length - rank + 1) / scores.length;
            const relativeDistance = (score - globalMean) / stdDev;
            
            positioning[categoryId] = {
                score,
                rank,
                percentileRank,
                relativeDistance,
                isAboveAverage: score > globalMean,
                distanceFromMean: Math.abs(score - globalMean)
            };
        }
        
        return positioning;
    }

    /**
     * Calculate global correction factor based on response style
     */
    calculateGlobalCorrection(responseStyle, globalStats) {
        const { responses5Percent, responses1Percent } = globalStats;
        let globalFactor = 1.0;
        
        switch (responseStyle) {
            case 'high_acquiescence':
                // Reduce scores based on extent of high rating bias
                const highBias = Math.min(this.options.maxGlobalAdjustment, responses5Percent * 0.5);
                globalFactor = 1 - highBias;
                break;
                
            case 'low_acquiescence':
                // Boost scores based on extent of low rating bias
                const lowBias = Math.min(this.options.maxGlobalAdjustment, responses1Percent * 0.5);
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

    /**
     * Calculate relative preservation factor for a category
     */
    calculateRelativeFactor(categoryPosition, responseStyle, categoryId, isZeroVariance = false) {
        const { relativeDistance, isAboveAverage } = categoryPosition;
        let relativeFactor = 1.0;
        
        // Handle zero-variance scenario (all scores identical)
        if (isZeroVariance) {
            const cdi = this.getCategoryDifficultyIndex(categoryId);
            
            // Use Category Difficulty Index to create minimal differentiation
            // More difficult/socially desirable categories get slightly lower relative factors
            relativeFactor = 1.0 - (cdi * this.options.categoryDifficultyAdjustment);
            
            if (this.options.debugMode) {
                console.log(`Zero-variance CDI adjustment for ${categoryId}: CDI=${cdi.toFixed(3)}, factor=${relativeFactor.toFixed(3)}`);
            }
            
            // Ensure factor stays within reasonable bounds for zero-variance scenarios
            return Math.max(0.92, Math.min(1.08, relativeFactor));
        }
        
        // For balanced responses, no additional adjustment needed
        if (responseStyle === 'balanced') {
            return 1.0;
        }
        
        // Apply differential correction to maintain relative positioning
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
        } else if (responseStyle === 'extreme_style') {
            // Moderate relative differences slightly
            relativeFactor = 1.0 + (relativeDistance * 0.05);
        } else if (responseStyle === 'central_tendency') {
            // Enhance relative differences
            relativeFactor = 1.0 + (relativeDistance * 0.1);
        }
        
        // Ensure relative factor stays within bounds
        return Math.max(0.85, Math.min(1.15, relativeFactor));
    }

    /**
     * Apply corrections to all categories
     */
    applyCategoryCorrections(positioning, responseStyle, globalFactor) {
        const correctedCategories = {};
        
        // Extract scores for variance detection
        const categoryScores = {};
        for (const [categoryId, position] of Object.entries(positioning)) {
            categoryScores[categoryId] = position.score;
        }
        
        // Detect if we have zero variance (all scores identical)
        const isZeroVariance = this.isZeroVarianceScenario(categoryScores);
        
        if (this.options.debugMode && isZeroVariance) {
            console.log('Zero-variance scenario detected - applying Category Difficulty Index corrections');
        }
        
        for (const [categoryId, position] of Object.entries(positioning)) {
            const relativeFactor = this.calculateRelativeFactor(position, responseStyle, categoryId, isZeroVariance);
            
            // Apply combined correction
            const originalScore = position.score;
            let correctedScore = originalScore * globalFactor * relativeFactor;
            
            // Ensure score bounds
            correctedScore = Math.max(this.options.minScore, 
                Math.min(this.options.maxScore, correctedScore));
            
            correctedCategories[categoryId] = {
                originalScore,
                correctedScore,
                globalFactor,
                relativeFactor,
                totalAdjustment: correctedScore / originalScore,
                adjustmentPercent: ((correctedScore / originalScore - 1) * 100).toFixed(2),
                position: { ...position },
                categoryDifficultyIndex: isZeroVariance ? this.getCategoryDifficultyIndex(categoryId) : null,
                zeroVarianceCorrection: isZeroVariance
            };
        }
        
        return correctedCategories;
    }

    /**
     * Generate detailed correction report
     */
    generateReport(correctionResults) {
        const { correctedCategories, globalStats, responseStyle, metadata } = correctionResults;
        
        const report = {
            summary: {
                responseStyle,
                globalFactor: metadata.globalFactor,
                totalCategories: metadata.totalCategories,
                totalQuestions: metadata.totalQuestions,
                correctionApplied: metadata.correctionApplied
            },
            categories: {},
            statistics: {
                originalMean: 0,
                correctedMean: 0,
                originalVariance: 0,
                correctedVariance: 0,
                largestAdjustment: 0,
                averageAdjustment: 0
            }
        };

        let totalOriginal = 0, totalCorrected = 0;
        let adjustments = [];

        for (const [categoryId, data] of Object.entries(correctedCategories)) {
            totalOriginal += data.originalScore;
            totalCorrected += data.correctedScore;
            adjustments.push(Math.abs(data.totalAdjustment - 1));

            report.categories[categoryId] = {
                originalScore: parseFloat(data.originalScore.toFixed(3)),
                correctedScore: parseFloat(data.correctedScore.toFixed(3)),
                adjustmentPercent: data.adjustmentPercent + '%',
                rank: data.position.rank,
                percentile: (data.position.percentileRank * 100).toFixed(1) + '%'
            };
        }

        // Calculate summary statistics
        const categoryCount = Object.keys(correctedCategories).length;
        report.statistics.originalMean = parseFloat((totalOriginal / categoryCount).toFixed(3));
        report.statistics.correctedMean = parseFloat((totalCorrected / categoryCount).toFixed(3));
        report.statistics.largestAdjustment = (Math.max(...adjustments) * 100).toFixed(2) + '%';
        report.statistics.averageAdjustment = (adjustments.reduce((a, b) => a + b, 0) / adjustments.length * 100).toFixed(2) + '%';

        return report;
    }

    /**
     * Validate category data format
     */
    validateCategoryData(categoryData) {
        if (!categoryData || typeof categoryData !== 'object') {
            throw new Error('Category data must be an object');
        }

        for (const [categoryId, responses] of Object.entries(categoryData)) {
            if (!responses || typeof responses !== 'object') {
                throw new Error(`Invalid responses for category ${categoryId}`);
            }

            for (const [questionId, value] of Object.entries(responses)) {
                if (typeof value !== 'number' || value < 1 || value > 5) {
                    throw new Error(`Invalid response value ${value} for category ${categoryId}, question ${questionId}`);
                }
            }
        }

        return true;
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiCategoryDistortionCorrector;
} else if (typeof window !== 'undefined') {
    window.MultiCategoryDistortionCorrector = MultiCategoryDistortionCorrector;
}