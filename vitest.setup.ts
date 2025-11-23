import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock localStorage with actual storage
const storage: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value },
  removeItem: (key: string) => { delete storage[key] },
  clear: () => { Object.keys(storage).forEach(key => delete storage[key]) },
}

global.localStorage = localStorageMock as any

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Don't clear localStorage between tests to maintain auth state
})
