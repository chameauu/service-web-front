# API Tests

This directory contains tests for the API utilities using a TDD (Test-Driven Development) approach.

## Test Types

### Unit Tests (`api.test.ts`)
- Tests the API utility functions in isolation
- Uses mocked fetch responses
- Fast and doesn't require backend server
- Run with: `npm test api.test.ts`

### Integration Tests (`api.integration.test.ts`)
- Tests actual API calls to the backend
- Requires backend server to be running
- Tests the full request/response cycle
- Run with: `npm test api.integration.test.ts`

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm test api.test.ts
```

### Run Integration Tests Only
```bash
npm test api.integration.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

## Integration Test Setup

Before running integration tests, ensure:

1. Backend server is running on `http://localhost:5000`
2. Database is properly configured
3. Set environment variable if using different URL:
   ```bash
   export NEXT_PUBLIC_API_URL=http://your-backend-url/api/v1
   ```

## Test Coverage

The tests cover:

- ✅ Authentication (login, register, logout)
- ✅ Device Management (CRUD operations)
- ✅ Device Status
- ✅ Telemetry Data (get, filter, latest, aggregated)
- ✅ Chart Management (CRUD operations)
- ✅ Chart-Device Associations
- ✅ Chart Measurements
- ✅ User Management
- ✅ Admin Operations

## TDD Workflow

1. **Write Test First**: Create a failing test for new functionality
2. **Implement Feature**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Repeat**: Continue for next feature

## Example: Adding New API Endpoint

1. Add test in `api.test.ts`:
```typescript
it('should call new endpoint', async () => {
  const mockResponse = { data: 'test' }
  ;(global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await api.newEndpoint()
  
  expect(result).toEqual(mockResponse)
})
```

2. Add implementation in `utils/api.ts`:
```typescript
newEndpoint: () => apiCall('/new-endpoint')
```

3. Add integration test in `api.integration.test.ts`:
```typescript
it('should call new endpoint with real backend', async () => {
  const result = await api.newEndpoint()
  expect(result).toBeDefined()
})
```

4. Run tests: `npm test`

## Troubleshooting

### Tests Failing
- Check if backend server is running
- Verify API URL is correct
- Check network connectivity
- Review error messages in test output

### Slow Tests
- Integration tests are slower (they hit real API)
- Use unit tests for rapid development
- Run integration tests before commits

### Mock Issues
- Clear mocks between tests with `vi.clearAllMocks()`
- Check mock setup in `vitest.setup.ts`
- Verify fetch is properly mocked
