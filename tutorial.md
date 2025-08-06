# Bubble.io Implementation Tutorial: Bidirectional Distortion Correction Formula

## Overview
This tutorial provides step-by-step instructions for implementing the bidirectional distortion correction formula **specifically in Bubble.io** (no-code platform). The formula detects and corrects response bias in psychological tests by adjusting scores when there are too many extreme responses (either 5s or 1s).

> **Note:** This tutorial is designed for Bubble.io's visual programming environment. For code-based implementations, see:
> - `tutorial-python.md` - Python implementation
> - `tutorial-javascript.md` - JavaScript implementation

## Prerequisites
- Active **Bubble.io** account with editor access
- Basic understanding of Bubble.io workflows and data types
- Familiarity with Bubble.io's visual expression editor
- Understanding of no-code development concepts

## Step 1: Database Setup

### 1.1 Create Data Types

**TestResponse Data Type:**
- `user` (User)
- `question_1` through `question_10` (Number)
- `total_score` (Number)
- `normalized_score` (Number)
- `corrected_score` (Number)
- `responses_5_count` (Number)
- `responses_1_count` (Number)
- `distortion_type` (Text)
- `distortion_factor_high` (Number)
- `distortion_factor_low` (Number)
- `correction_factor_high` (Number)
- `correction_factor_low` (Number)
- `threshold_high` (Number)
- `threshold_low` (Number)
- `created_date` (Date)

## Step 2: User Interface Setup

### 2.1 Create Test Page Elements

**Question Groups (Repeat for questions 1-10):**
- Group: `Question_Group_1`
- Text: "Question 1: [Your question text]"
- RadioButton Group: `q1_response`
  - Options: 1, 2, 3, 4, 5
  - Default: (none)

**Results Section:**
- Group: `Results_Group` (Initially hidden)
- Text: `Total_Score_Text`
- Text: `Normalized_Score_Text`
- Text: `Corrected_Score_Text`
- Text: `Responses_5_Text`
- Text: `Responses_1_Text`
- Text: `Distortion_Warning_Text`

**Submit Button:**
- Button: `Submit_Test_Button`
- Text: "Submit Test"

## Step 3: Workflow Implementation

### 3.1 Main Calculation Workflow

**Trigger:** When `Submit_Test_Button` is clicked

**Step 1: Calculate Basic Scores**
- Action: Create a new TestResponse
- Fields to set:
  ```
  question_1 = q1_response's value
  question_2 = q2_response's value
  ...
  question_10 = q10_response's value
  
  total_score = q1_response's value + q2_response's value + ... + q10_response's value
  
  normalized_score = (total_score - 10) / (50 - 10) * (5 - 1) + 1
  ```

**Step 2: Count Extreme Responses and Calculate Dynamic Threshold**
- Add to TestResponse:
  ```
  total_questions = [Count of all question fields with responses]
  responses_5_count = [Count of responses where value = 5]
  responses_1_count = [Count of responses where value = 1]
  threshold = total_questions * 0.7:rounded up
  ```

### 3.2 Distortion Detection and Correction

**Step 3: Detect Distortion and Apply Correction**
- Action: Make changes to TestResponse
- Conditional logic:
  ```
  distortion_type = 
    If responses_5_count >= threshold AND responses_1_count >= threshold: "both"
    Else if responses_5_count >= threshold: "high"
    Else if responses_1_count >= threshold: "low"
    Else: "none"
  
  corrected_score = normalized_score
  
  If distortion_type contains "high":
    distortion_factor = responses_5_count / total_questions
    correction_factor = 1 - (distortion_factor * 0.3)
    corrected_score = corrected_score * correction_factor
  
  If distortion_type contains "low":
    distortion_factor = responses_1_count / total_questions
    boost_factor = 1 + (distortion_factor * 0.3)
    corrected_score = corrected_score * boost_factor
  
  corrected_score = max(1.01, min(corrected_score, 5))
  ```

## Step 4: Display Results

### 4.1 Show Results Workflow

**Trigger:** After TestResponse is created

**Actions:**
1. Show `Results_Group`
2. Set text values:
   ```
   Total_Score_Text = "Total Score: " & TestResponse's total_score
   Normalized_Score_Text = "Normalized Score: " & TestResponse's normalized_score:formatted as 1.23
   Corrected_Score_Text = "Corrected Score: " & TestResponse's corrected_score:formatted as 1.23
   Responses_5_Text = "Responses with value 5: " & TestResponse's responses_5_count & "/" & TestResponse's total_questions
   Responses_1_Text = "Responses with value 1: " & TestResponse's responses_1_count & "/" & TestResponse's total_questions
   Threshold_Text = "Distortion Threshold: " & TestResponse's threshold
   ```

3. Set distortion warning:
   ```
   Distortion_Warning_Text = 
     If TestResponse's distortion_type = "high": 
       "⚠️ Possible Distortion (Many 5s) - Threshold: " & TestResponse's threshold
     Else if TestResponse's distortion_type = "low": 
       "⚠️ Possible Distortion (Many 1s) - Threshold: " & TestResponse's threshold
     Else if TestResponse's distortion_type = "both": 
       "⚠️ Ambiguous Pattern - Both high and low distortion detected"
     Else: ""
   ```

## Step 5: Advanced Features (Optional)

### 5.1 Export Functionality

Add a "Download Results" button that:
1. Formats the data as CSV
2. Uses Bubble's file download capabilities
3. Includes all calculated values and metadata

### 5.3 Historical Analysis

Create a repeating group to show:
- Previous test results
- Distortion patterns over time
- Score trends

## Step 6: Testing and Validation

### 6.1 Test Cases

**High Distortion Test:**
- Set 8 responses to value 5
- Set 2 responses to value 3
- Verify score reduction

**Low Distortion Test:**
- Set 8 responses to value 1
- Set 2 responses to value 3
- Verify score boost

**Normal Response Test:**
- Set varied responses (2,3,4 values)
- Verify no correction applied

### 6.2 Validation Checklist

- [ ] All questions capture responses correctly
- [ ] Total score calculation is accurate
- [ ] Normalized score ranges from 1-5
- [ ] Dynamic threshold calculation works (70% of total questions)
- [ ] Extreme response counting works
- [ ] Distortion detection triggers correctly
- [ ] Correction factors apply properly
- [ ] Final score respects min/max bounds (1.01-5)
- [ ] Results display correctly
- [ ] Data saves to database

## Step 7: Performance Optimization

### 7.1 Workflow Optimization
- Combine multiple "Make changes" actions where possible
- Use conditional workflows for complex logic
- Minimize database operations

### 7.2 User Experience
- Add loading states during calculation
- Implement progress indicators
- Provide clear error messages
- Add form validation

## Troubleshooting

### Common Issues

**Issue:** Corrected score shows as 0 or null
**Solution:** Check that all conditional expressions have proper else clauses

**Issue:** Distortion not detected when expected
**Solution:** Verify threshold calculations and comparison operators

**Issue:** Score goes below 1 or above 5
**Solution:** Ensure min/max functions are applied correctly

**Issue:** Responses not counting correctly
**Solution:** Check that radio button values are set as numbers, not text

## Conclusion

This implementation provides a robust psychological testing platform with bidirectional distortion correction. The formula automatically detects response bias and applies appropriate corrections while maintaining score validity.

### Next Steps
- Implement user authentication
- Add test administration features
- Create reporting dashboards
- Integrate with external systems
- Add multi-language support

### Support Resources
- Bubble.io Documentation: https://manual.bubble.io/
- Bubble Forum: https://forum.bubble.io/
- Formula Documentation: See `distortion-correction-formula.md`