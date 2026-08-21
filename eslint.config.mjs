// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'app/*'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Tes préférences ---
      'no-useless-escape': 'off',
      'class-methods-use-this': 'off',
      'no-underscore-dangle': ['error', { allow: ['_id'] }],

      // --- Bonnes pratiques TS ---
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  // Fichiers de test Vitest
  {
    files: ['**/*.{test,spec}.{ts,js}', 'test/**/*.{ts,js}'],
    ...vitest.configs.recommended,
  },

  // Coupe les règles type-aware sur les fichiers JS/MJS purs (dont ce fichier)
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  eslintConfigPrettier, // toujours en dernier
)