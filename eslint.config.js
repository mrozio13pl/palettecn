//  @ts-check

import stylistic from '@stylistic/eslint-plugin';
import { tanstackConfig } from '@tanstack/eslint-config';

export default [
    ...tanstackConfig,
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: true,
        jsx: true,
    }),
    {
        rules: {
            'no-shadow': 'off',
            'no-case-declarations': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
        },
    },
];
