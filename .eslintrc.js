module.exports = {
    extends: [
        'airbnb-base',
    ],
    env: {
        node: true,
        es2021: true,
    },
    plugins: [
        '@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    ignorePatterns: ['**/*.d.ts'],
    rules: {
        'no-console': 0,
        indent: 0,
        'no-tabs': 0,
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                ts: 'never',
            },
        ],
        'import/no-import-module-exports': 0,
        'max-len': 0,
        'no-restricted-syntax': 0,
        'padded-blocks': 0,
        'no-underscore-dangle': 0,
        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 'error',
        'import/no-named-as-default': 0,
        'consistent-return': 0,
        'no-return-assign': 0,
        'no-nested-ternary': 0,
        'no-new': 0,
    },
    overrides: [
        {
            files: ['*.ts'],
            rules: {
                'no-undef': 'off',
                'no-multiple-empty-lines': 'off',
            },
        },
    ],
};

