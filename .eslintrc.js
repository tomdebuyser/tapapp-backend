module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
    },
    env: {
        node: true,
    },
};
