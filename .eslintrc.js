module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'airbnb',
    ],
    parserOptions: {
        parser: 'babel-eslint',
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'array-callback-return': 'error',
        indent: ['error', 4, {
            SwitchCase: 1,
            ObjectExpression: 1,
        }],
        'no-mixed-spaces-and-tabs': 'off',
        'no-underscore-dangle': 'off',
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
        semi: ['error', 'always'],
        'no-var': 2,
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
