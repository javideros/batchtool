#!/bin/bash

# Test runner script for raven-app
echo "🧪 Running JSR-352 Batch Tool Tests..."
echo "======================================"

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please ensure Node.js is installed and in PATH."
    echo "💡 Try: nvm use node"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please ensure npm is installed."
    exit 1
fi

# Run tests with verbose output
echo "🚀 Starting test suite..."
npm test -- --reporter=verbose

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check output above for details."
    echo ""
    echo "🔧 Common fixes:"
    echo "  - Check button text matches component (emojis included)"
    echo "  - Verify form field labels and placeholders"
    echo "  - Ensure mock functions are properly configured"
fi