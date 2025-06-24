#!/bin/bash

echo "🔍 Real-time Error Monitor Active"
echo "=================================="
echo "Watching for errors while you interact with the app..."
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to check for errors
check_errors() {
    # Check server logs for errors
    if curl -s http://localhost:3001/api/workflows > /dev/null 2>&1; then
        echo -n "✅"
    else
        echo -n "❌"
    fi
    
    # Check client logs for errors
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -n "✅"
    else
        echo -n "❌"
    fi
    
    echo -n " "
    date '+%H:%M:%S'
}

# Monitor in real-time
while true; do
    check_errors
    sleep 2
done 