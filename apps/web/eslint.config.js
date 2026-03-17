//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config';

export default [
    ...tanstackConfig,
    {
        rules: {
            'no-shadow': 'off',
            'no-case-declarations': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
        },
    },
];
