# BiasTools: Psychological Assessment with Dynamic Distortion Correction

BiasTools is a comprehensive project that implements sophisticated psychological assessment tools with bidirectional distortion correction capabilities. The system automatically detects and corrects response bias patterns in psychological evaluations, providing more accurate and reliable assessment results.

## Project Overview

This project addresses a critical challenge in psychological testing: response bias. When individuals take psychological assessments, they often exhibit extreme response patterns (consistently choosing the highest or lowest ratings) that can skew results and reduce the validity of the evaluation. BiasTools solves this problem through intelligent detection and correction algorithms.

## Core Features

- **Dynamic Distortion Detection**: Automatically identifies when respondents show extreme response patterns (too many 5s or 1s)
- **Bidirectional Correction**: Applies appropriate corrections for both high and low response distortions
- **Real-time Calculation**: Instant score computation and interpretation
- **Professional Interface**: Clean, user-friendly design suitable for professional assessments
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Multi-Platform Support**: Implementation guides for Bubble.io, Python, and JavaScript

## Main Assessment Tool

The primary file `psychological-assessment-tool.html` contains a complete psychological competency evaluation system. This tool:

### Assessment Process
1. Presents 10 carefully designed competency questions
2. Collects responses on a 1-5 Likert scale
3. Calculates normalized scores based on responses
4. Detects distortion patterns using a dynamic threshold (70% of total questions)
5. Applies correction factors when distortion is detected
6. Provides detailed competency level interpretation

### Distortion Correction Algorithm
- **High Distortion** (too many 5s): Reduces score by up to 30% to account for positive response bias
- **Low Distortion** (too many 1s): Increases score by up to 30% to account for negative response bias
- **Both Distortions**: Applies both corrections when mixed patterns are detected
- **No Distortion**: Maintains original score when response patterns are balanced

### Technical Specifications
- **Language**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Vanilla JavaScript (no external dependencies)
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **File Size**: Optimized for fast loading and offline use

## Quick Start

### Option 1: Direct File Access
Simply open `psychological-assessment-tool.html` in your web browser for immediate use.

### Option 2: Local Server (Recommended for Development)
```bash
# Using Python
python -m http.server 8000

# Using PowerShell (Windows)
.\start-server.ps1

# Using Node.js
npx http-server
```

Then navigate to `http://localhost:8000/psychological-assessment-tool.html`

## Demo

🔗 **Live Demo**: [Access the psychological assessment tool](http://localhost:8000/psychological-assessment-tool.html)

*Note: The demo link will work when the local server is running.*

## Scientific Foundation

The distortion correction formula is based on extensive psychological assessment research that demonstrates how extreme response styles can significantly impact test validity. Our implementation provides more accurate assessments by:

- Identifying systematic response patterns through statistical analysis
- Applying evidence-based correction factors derived from psychometric research
- Maintaining score validity while reducing measurement bias
- Preserving the interpretability of results across different populations

For detailed information about the formula and its scientific foundation, see `distortion-correction-formula.md` and `scientific-background-article.md`.

## Implementation Guides

BiasTools includes comprehensive tutorials for implementing the distortion correction algorithm across different platforms:

- **Bubble.io**: `tutorial.md` - Complete no-code implementation guide for visual development
- **Python**: `tutorial-python.md` - Full Python implementation with classes, unit testing, web integration, and data analysis
- **JavaScript**: `tutorial-javascript.md` - Browser and Node.js implementations with React components, REST APIs, and performance optimization

## Project Structure

```
├── psychological-assessment-tool.html   # Main assessment application
├── README.md                           # Project documentation (this file)
├── tutorial.md                         # Bubble.io implementation guide
├── tutorial-python.md                  # Python implementation guide
├── tutorial-javascript.md              # JavaScript implementation guide
├── distortion-correction-formula.md    # Technical formula documentation
├── scientific-background-article.md    # Research background and validation
└── start-server.ps1                   # PowerShell server script for Windows
```

## Use Cases

- **HR Assessments**: Employee competency evaluations with bias correction
- **Educational Testing**: Student assessment tools with improved accuracy
- **Research Applications**: Psychological studies requiring unbiased response collection
- **Clinical Settings**: Mental health assessments with response pattern analysis
- **Training Programs**: Skill evaluation tools for professional development

## Contributing

We welcome contributions to BiasTools! Whether you're interested in:
- Improving the assessment interface
- Enhancing the distortion correction algorithm
- Adding new platform implementations
- Expanding the scientific documentation
- Creating additional assessment tools

Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source and available under the MIT License, making it free for both commercial and non-commercial use.