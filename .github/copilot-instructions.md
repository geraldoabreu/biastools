# BiasTools - Psychological Assessment Repository

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Quick Start (Development Ready in < 30 seconds)
- Bootstrap and test the repository:
  - `cd /home/runner/work/biastools/biastools` 
  - `python3 -m http.server 8080` -- starts immediately, server ready in 2-3 seconds. NEVER CANCEL.
  - Open `http://localhost:8080/solutions/distortion-correction-formula/examples/basic-assessment.html` in browser
- Alternative server methods:
  - PowerShell (Windows): `.\start-server.ps1` -- **WARNING**: Legacy script references non-existent `teste-psicologico.html`, works but needs URL correction
  - Node.js: `npx http-server` -- requires npm install first, starts in 5-10 seconds
  - **Live Demo**: `https://geraldoabreu.github.io/biastools/psychological-assessment-tool.html` (GitHub Pages - **NOTE**: May not be available/configured)
- **NO BUILD PROCESS REQUIRED** - This is a documentation and tutorial repository with static HTML/JavaScript files

### Core Application Testing
- Run the main psychological assessment tool:
  - Start server using any method above
  - Navigate to the basic assessment: `http://localhost:8080/solutions/distortion-correction-formula/examples/basic-assessment.html`
  - Complete assessment takes 2-3 minutes for 10 questions
  - Results include distortion correction algorithm validation
- External dependencies load automatically:
  - jQuery 3.6.0 from CDN (loads in <1 second)
  - XLSX library 0.18.5 from CDN (loads in <1 second)
  - No local dependency management required

### Validation Scenarios
After making any changes, ALWAYS complete this full validation:
1. **Server Test**: Start HTTP server and verify `http://localhost:8080` responds (should take <5 seconds)
2. **Assessment Workflow**: Complete the psychological assessment with test responses:
   - Normal responses: `[3,3,3,3,3,3,3,3,3,3]` → expect no distortion detected
   - High distortion: `[5,5,5,5,5,5,5,3,2,4]` → expect score reduction and "high" distortion
   - Low distortion: `[1,1,1,1,1,1,1,3,4,2]` → expect score boost and "low" distortion
3. **Algorithm Verification**: Confirm corrected scores differ from normalized scores when distortion is detected
4. **Export Functionality**: Verify Excel export generates downloadable file with results

### Complete Manual Testing Procedure
**CRITICAL**: Always run this end-to-end test after making changes:
1. Start server: `python3 -m http.server 8080` (wait 3 seconds)
2. Open in browser: `http://localhost:8080/solutions/distortion-correction-formula/examples/basic-assessment.html`
3. **Normal Test**: Answer all 10 questions with "3" (neutral) - verify score ~3.0, no distortion warning
4. **High Distortion Test**: Answer first 7 questions with "5", last 3 with "2,3,4" - verify score reduced below raw score, "high distortion" message
5. **Low Distortion Test**: Answer first 7 questions with "1", last 3 with "2,3,4" - verify score boosted above raw score, "low distortion" message  
6. **Export Test**: Complete any assessment and verify Excel file downloads automatically
7. **Console Check**: Open browser dev tools, verify no JavaScript errors in console

### Time Expectations
- **Server startup**: 2-3 seconds (Python HTTP server) - NEVER CANCEL
- **Page load**: <1 second for HTML application
- **Assessment completion**: 2-3 minutes for full 10-question test
- **Result calculation**: Instantaneous (JavaScript algorithm)
- **Excel export**: 1-2 seconds file generation

## Repository Structure Navigation

### Key Projects and Locations
- **Main Application**: `solutions/distortion-correction-formula/examples/basic-assessment.html` (686 lines, fully functional)
- **Alternative Application**: `solutions/distortion-correction-formula/examples/psychological-assessment-tool.html` (identical to basic-assessment.html)
- **Live Demo**: `https://geraldoabreu.github.io/biastools/psychological-assessment-tool.html`
- **Core Algorithm**: Embedded JavaScript in HTML file, bidirectional distortion correction
- **Documentation Hub**: `docs/` folder with contributing guidelines and implementation standards
- **Solution Tutorials**: 
  - `solutions/distortion-correction-formula/implementation/python/tutorial.md`
  - `solutions/distortion-correction-formula/implementation/javascript/tutorial.md`
  - `solutions/distortion-correction-formula/implementation/bubble/README.md`

### Common Locations Reference
```
Repository root: /home/runner/work/biastools/biastools/
├── README.md                    # Project overview and structure
├── solutions/                   # Primary solutions directory
│   └── distortion-correction-formula/
│       ├── examples/           # Working HTML applications
│       ├── implementation/     # Platform-specific tutorials
│       └── docs/              # Technical specifications
├── docs/                       # General project documentation
├── shared/                     # Shared resources and utilities
└── start-server.ps1           # Windows PowerShell server script
```

## Algorithm and Implementation Details

### Distortion Correction Formula
The core algorithm detects extreme response patterns (many 5s or 1s on Likert scales):
- **Detection threshold**: 70% of total questions (dynamic)
- **High distortion**: Score reduced by up to 30% when excessive 5s detected
- **Low distortion**: Score boosted by up to 30% when excessive 1s detected  
- **Bidirectional**: Both corrections applied when both patterns present
- **Bounds enforcement**: Final scores kept between 1.0001 and 5.0

### No Build System
This repository contains:
- Static HTML/CSS/JavaScript files (no compilation needed)
- Markdown documentation and tutorials
- No package.json, requirements.txt, or traditional build files
- No unit test framework (validation done through manual testing)

### Content Types
- **Tutorials**: Complete implementation guides for Python, JavaScript, Bubble.io
- **Documentation**: Scientific background, algorithm specifications
- **Examples**: Working HTML assessment tools
- **Resources**: Shared utilities and datasets (documentation only)

## Development Workflow

### Making Changes
- Edit HTML/JavaScript directly in `solutions/distortion-correction-formula/examples/`
- Update documentation in respective tutorial files
- Test immediately using HTTP server (no build step required)
- Validate with complete assessment workflow

### Testing Changes
1. Start server: `python3 -m http.server 8080`
2. Open application: `http://localhost:8080/solutions/distortion-correction-formula/examples/basic-assessment.html`
3. Complete assessment with known test patterns
4. Verify distortion detection and correction logic
5. Test Excel export functionality
6. Check browser console for JavaScript errors

### Documentation Updates
- Tutorial modifications: Edit respective `.md` files in `implementation/` folders
- General documentation: Update files in `docs/` folder
- No additional processing or building required for documentation changes

## External Dependencies

### CDN Dependencies (Auto-loaded)
- jQuery 3.6.0: `https://code.jquery.com/jquery-3.6.0.min.js`
- XLSX Library 0.18.5: `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- Both load automatically when HTML page opens (1-2 seconds total)
- **CRITICAL**: External CDN resources may be blocked in headless/testing environments causing JavaScript errors

### No Local Dependencies
- No npm packages to install
- No Python pip requirements
- No build tools or package managers required
- Works entirely with static file serving

## Troubleshooting

### Common Issues
- **Port 8080 in use**: Use `python3 -m http.server 8081` (or any available port)
- **Server not responding**: Wait 5 seconds after startup before testing
- **Assessment not loading**: Check browser console, ensure internet connection for CDN dependencies
- **Results not calculating**: Verify all 10 questions answered before submitting
- **JavaScript Errors**: CDN dependencies (jQuery, XLSX) may be blocked - application form will still work but calculations/export won't function
- **PowerShell Script Issue**: `start-server.ps1` references non-existent `teste-psicologico.html` - use Python HTTP server instead

### Validation Commands
```bash
# Test server startup and response
python3 -m http.server 8080 &
sleep 3
curl -s http://localhost:8080/solutions/distortion-correction-formula/examples/basic-assessment.html | grep -i "psychological"

# Verify HTML file integrity  
wc -l solutions/distortion-correction-formula/examples/basic-assessment.html  # Should show 686 lines

# Check for core algorithm
grep -c "correctedScore" solutions/distortion-correction-formula/examples/basic-assessment.html  # Should show 8+ matches

# Test external dependencies availability
curl -s -w "jQuery Load Time: %{time_total}s\n" -o /dev/null https://code.jquery.com/jquery-3.6.0.min.js
curl -s -w "XLSX Load Time: %{time_total}s\n" -o /dev/null https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
```

### Browser Compatibility
- Modern browsers: Chrome, Firefox, Safari, Edge (all current versions)
- Requires JavaScript enabled for assessment functionality
- Mobile browsers supported (responsive design)
- Internet connection required for CDN dependencies

## File System Organization

### What Each Directory Contains
- `solutions/distortion-correction-formula/examples/`: Ready-to-use HTML applications
- `solutions/distortion-correction-formula/implementation/`: Platform-specific implementation tutorials  
- `solutions/distortion-correction-formula/docs/`: Technical specifications and scientific background
- `docs/`: General project documentation (contributing, standards, research guidelines)
- `shared/`: Shared resource documentation (no actual implementation files)

### Important: No Executable Code Outside HTML
- Python code exists only in tutorial documentation (not runnable files)
- JavaScript code exists only in tutorial documentation and embedded in HTML
- Bubble.io implementation exists only as tutorial documentation
- Only working application is the HTML file with embedded JavaScript

This repository is designed for education, tutorials, and demonstration of bias correction algorithms across multiple platforms.