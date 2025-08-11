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
            ...options
        };
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
    calculateRelativeFactor(categoryPosition, responseStyle) {
        const { relativeDistance, isAboveAverage } = categoryPosition;
        let relativeFactor = 1.0;
        
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
        
        for (const [categoryId, position] of Object.entries(positioning)) {
            const relativeFactor = this.calculateRelativeFactor(position, responseStyle);
            
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
                position: { ...position }
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