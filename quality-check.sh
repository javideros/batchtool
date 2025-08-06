#!/bin/bash

echo "🔍 JSR-352 Batch Tool - Quality & Performance Check"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to run a check and report status
run_check() {
    local name="$1"
    local command="$2"
    local description="$3"
    
    echo -e "\n${BLUE}🔍 $name${NC}"
    echo "   $description"
    echo "   Running: $command"
    
    if eval "$command"; then
        echo -e "   ${GREEN}✅ PASSED${NC}"
        return 0
    else
        echo -e "   ${RED}❌ FAILED${NC}"
        OVERALL_STATUS=1
        return 1
    fi
}

# 1. TypeScript Type Checking
run_check "TypeScript Type Check" \
    "npm run type-check" \
    "Checking for TypeScript compilation errors"

# 2. ESLint Code Quality
run_check "ESLint Code Quality" \
    "npm run lint" \
    "Checking code quality and style issues"

# 3. Test Suite
run_check "Test Suite" \
    "npm run test:run" \
    "Running all unit tests"

# 4. Build Process
run_check "Build Process" \
    "npm run build" \
    "Testing production build"

# 5. Bundle Analysis (if build succeeded)
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "\n${BLUE}📊 Bundle Analysis${NC}"
    echo "   Analyzing bundle size and optimization opportunities"
    node analyze-bundle.js
fi

# Summary
echo -e "\n${'='*50}"
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 All Quality Checks PASSED!${NC}"
    echo -e "${GREEN}✅ Code is ready for production${NC}"
    
    echo -e "\n${BLUE}📈 Performance Metrics:${NC}"
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        echo "   Bundle Size: $BUNDLE_SIZE"
    fi
    
    TEST_COUNT=$(npm run test:run 2>&1 | grep -o '[0-9]* passed' | head -1 | cut -d' ' -f1)
    if [ ! -z "$TEST_COUNT" ]; then
        echo "   Tests Passing: $TEST_COUNT"
    fi
    
    echo -e "\n${YELLOW}💡 Next Steps:${NC}"
    echo "   • Review bundle analysis for optimization opportunities"
    echo "   • Consider implementing React.lazy() for code splitting"
    echo "   • Monitor performance in production"
    
else
    echo -e "${RED}❌ Quality Checks FAILED!${NC}"
    echo -e "${RED}🚨 Please fix the issues above before proceeding${NC}"
    
    echo -e "\n${YELLOW}💡 Common Fixes:${NC}"
    echo "   • Run 'npm run lint:fix' to auto-fix linting issues"
    echo "   • Check TypeScript errors and add proper types"
    echo "   • Review failing tests and update as needed"
fi

exit $OVERALL_STATUS