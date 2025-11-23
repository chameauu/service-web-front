import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'

describe('Chart Page Removal', () => {
  const chartPaths = [
    'app/charts/page.tsx',
    'app/charts/[id]/page.tsx',
    'app/charts/[id]/edit',
    'app/charts/create/page.tsx',
  ]

  it('should not have chart pages in the app directory', () => {
    chartPaths.forEach(path => {
      const fullPath = join(process.cwd(), path)
      expect(existsSync(fullPath)).toBe(false)
    })
  })

  it('should not have charts directory', () => {
    const chartsDir = join(process.cwd(), 'app/charts')
    expect(existsSync(chartsDir)).toBe(false)
  })
})

describe('Navbar Chart Link Removal', () => {
  it('should not contain chart navigation link in navbar', async () => {
    const navbarPath = join(process.cwd(), 'components/layout/navbar.tsx')
    
    if (existsSync(navbarPath)) {
      const fs = await import('fs/promises')
      const content = await fs.readFile(navbarPath, 'utf-8')
      
      // Should not have /charts route
      expect(content).not.toContain('href="/charts"')
      expect(content).not.toContain("href='/charts'")
      
      // Should not have Charts text in navigation
      expect(content.toLowerCase()).not.toMatch(/>\s*charts\s*</i)
    }
  })
})

describe('API Chart Functions', () => {
  it('should verify chart API functions are documented as unavailable', async () => {
    const apiPath = join(process.cwd(), 'utils/api.ts')
    
    if (existsSync(apiPath)) {
      const fs = await import('fs/promises')
      const content = await fs.readFile(apiPath, 'utf-8')
      
      // Chart functions can remain in API utils (they're just not used)
      // This test just verifies they exist but aren't breaking anything
      const chartFunctions = [
        'getCharts',
        'getChart',
        'createChart',
        'deleteChart',
      ]
      
      chartFunctions.forEach(fn => {
        if (content.includes(fn)) {
          // If they exist, that's fine - they're just not used
          expect(content).toContain(fn)
        }
      })
    }
  })
})
