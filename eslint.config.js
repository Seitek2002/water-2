import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      prettier
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [
              '^react$',
              '^react-router',
              '^react-dom',
              '^react-i18next',
              '^react-redux',
              'react-quilljs',
              'react-beautiful-dnd',
              '@reduxjs/toolkit',
              '@reduxjs/toolkit/query/react',
              '^antd',
              '^@ant-design/icons',
              '^@ant-design/plots',
              '^axios',
              '^dayjs',
              '^classnames',
              'dompurify',
              '^~',
              'app',
              'router',
              'pages',
              'containers',
              'common/ui',
              'components',
              'common/helpers',
              'common/hooks',
              'common/constants',
              'api/student',
              'api/guest',
              'api/instructor',
              'api/admin',
              'types/common',
              'types/entities',
              'types/request',
              'types/roles',
              'types/routes',
              'types/store',
              '^\\.\\.(?!/?$)',
              '^\\.\\./?$',
              '^\\./(?=.*/)(?!/?$)',
              '^\\.(?!/?$)',
              '^\\./?$',
              '.svg',
              '.png',
              '.jpg',
              '.jpeg',
              '^\\u0000',
              '^.+\\.s?css$'
            ]
          ]
        }
      ],
      'simple-import-sort/exports': 'warn'
    }
  }
);
