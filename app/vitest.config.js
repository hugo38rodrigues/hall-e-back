import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Pas de DOM nécessaire (back Node)
		environment: 'node',
		// Patterns de découverte
		include: ['tests/**/*.test.js'],
		// Globals : false → on importe { describe, test, expect } depuis 'vitest'
		// Mets à `true` si tu préfères des globales façon Jest.
		globals: false,
		// Timeout par test
		testTimeout: 10_000,
		// Coverage
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			include: ['controllers/**/*.js'],
			exclude: ['controllers/**/*.test.js'],
		},
	},
})
