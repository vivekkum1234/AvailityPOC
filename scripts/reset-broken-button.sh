#!/bin/bash

# Script to reset the broken button for demo purposes
# This reverts the "Take Me Home" button to its broken state

echo "🔄 Resetting broken button for demo..."

# Check if we're in the right directory
if [ ! -f "frontend/src/components/QuestionnaireWizard.tsx" ]; then
    echo "❌ Error: Must run from repository root"
    exit 1
fi

# Find the line with the working button and replace with broken version
FILE="frontend/src/components/QuestionnaireWizard.tsx"

# Check if the button is already broken
if grep -q "onClick={() => navigate('/')}" "$FILE"; then
    echo "⚠️  Button is currently FIXED. Reverting to broken state..."
    
    # Replace the working button with broken version
    # This removes the onClick handler
    sed -i.bak 's/onClick={() => navigate(.*//' "$FILE"
    
    echo "✅ Button is now BROKEN (ready for demo)"
    echo "🎬 You can now demo the AI agent fixing it!"
else
    echo "✅ Button is already BROKEN (ready for demo)"
fi

echo ""
echo "📝 To test again:"
echo "   1. Enable Agentic Mode in Testing section"
echo "   2. Click 'Take Me Home' button"
echo "   3. Click '🤖 Call AI Agent to Fix It'"
echo "   4. After PR is merged, run this script again"

