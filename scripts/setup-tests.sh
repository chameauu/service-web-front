#!/bin/bash

echo "Installing test dependencies..."
npm install --save-dev vitest@^2.1.8 @vitest/ui@^2.1.8 @vitejs/plugin-react@^4.3.4 jsdom@^25.0.1 @testing-library/react@^16.0.1 @testing-library/jest-dom@^6.6.3

echo ""
echo "✅ Test dependencies installed!"
echo ""
echo "Available test commands:"
echo "  npm test              - Run all tests in watch mode"
echo "  npm run test:run      - Run all tests once"
echo "  npm run test:ui       - Run tests with UI"
echo ""
echo "To run specific tests:"
echo "  npm test api.test.ts                    - Unit tests only"
echo "  npm test api.integration.test.ts        - Integration tests only"
echo ""
echo "Note: Integration tests require the backend server running on http://localhost:5000"
