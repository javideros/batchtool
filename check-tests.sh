#!/bin/bash

echo "🧪 JSR-352 Batch Tool - Test Status Checker"
echo "==========================================="

# Check if we can run tests
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Run: nvm use node"
    exit 1
fi

# Run tests and capture output
echo "🚀 Running test suite..."
npm test -- --reporter=verbose --run 2>&1 | tee test-output.log

# Count results
PASSED=$(grep -c "✓" test-output.log 2>/dev/null || echo "0")
FAILED=$(grep -c "✗" test-output.log 2>/dev/null || echo "0")
# Ensure numeric values
PASSED=${PASSED//[^0-9]/}
FAILED=${FAILED//[^0-9]/}
PASSED=${PASSED:-0}
FAILED=${FAILED:-0}
TOTAL=$((PASSED + FAILED))

echo ""
echo "📊 Test Results Summary:"
echo "======================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📈 Total:  $TOTAL"

if [ "$FAILED" -gt 0 ] 2>/dev/null; then
    echo ""
    echo "🔍 Failed Test Details:"
    echo "======================"
    grep -A 2 "✗" test-output.log || echo "No detailed failure info found"
    
    echo ""
    echo "💡 Common Issues to Check:"
    echo "- Button text matches exactly (including emojis)"
    echo "- Component mocks are properly configured"
    echo "- All utility functions are mocked"
    echo "- Form field names match component implementation"
fi

# Clean up
rm -f test-output.log