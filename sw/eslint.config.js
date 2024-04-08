import stylistic from '@stylistic/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                    modules: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.test.ts'],
        plugins: {
            '@stylistic': stylistic,
            '@typescript-eslint': ts,
            'react': react,
            'react-hooks': reactHooks,
        },
        rules: {
            '@stylistic/indent': ['error', 4, { SwitchCase: 0 }],
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/space-before-function-paren': ['error', {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            }],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/no-trailing-spaces': ['error'],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/arrow-parens': ['error', 'as-needed'],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
            '@stylistic/eol-last': ['error', 'always'],
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            ...ts.configs.recommended.rules,
            ...ts.configs['eslint-recommended'].rules,
        },
    },
];
