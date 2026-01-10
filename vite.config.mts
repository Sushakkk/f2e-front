import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import { defineConfig, loadEnv, type AliasOptions } from 'vite';
import checker from 'vite-plugin-checker';
import { createHtmlPlugin } from 'vite-plugin-html';
import mkcert from 'vite-plugin-mkcert';
import svgr from 'vite-plugin-svgr';

import { buildFontsInject } from './tools/fonts';
import tsConfig from './tsconfig.json';

const SRC_PATH = path.resolve(__dirname, 'src');
const BUILD_PATH = path.resolve(__dirname, 'public');

const defineEnvVariables = (variables: string[]): Record<string, any> =>
  variables.reduce(
    (accumulator, variable) => ({
      ...accumulator,
      [`process.env.${variable}`]: JSON.stringify(process.env[variable]),
    }),
    {}
  );

const getAliases = (): AliasOptions =>
  Object.fromEntries(
    Object.keys(tsConfig.compilerOptions.paths)
      .map((alias) => alias.replace('/*', ''))
      .map((alias) => [alias, path.join(SRC_PATH, alias)])
  );

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const {
    NODE_ENV = '',
    CI_COMMIT_REF_SLUG = '',
    CI_COMMIT_SHORT_SHA = '',
    SENTRY_AUTH_TOKEN = '',
    SENTRY_URL = '',
    SENTRY_ORG = '',
    SENTRY_PROJECT = '',
  } = process.env;

  const IS_PROD = NODE_ENV === 'production';

  const IS_DEFAULT_BRANCH = new Set(['main', 'master']).has(CI_COMMIT_REF_SLUG);

  const { INJECT_FONTS_PRELOAD_LINKS, INJECT_FONTS_FACES } = buildFontsInject();

  const proxyPort = process.env.API_PROXY_PORT;

  const proxyTarget = proxyPort ? `https://localhost:${proxyPort}` : 'http://localhost:3000';

  const serverConfig = {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  } satisfies import('vite').UserConfig['server'];

  return {
    define: defineEnvVariables(['NODE_ENV', 'API_URL', 'SENTRY_DSN', 'SENTRY_AUTH_TOKEN']),
    base:  '/',
    publicDir: 'static',
    build: {
      outDir: BUILD_PATH,
      assetsDir: 'static',
      sourcemap: 'hidden',
    },
    server: serverConfig,
    css: {
      modules: {
        generateScopedName: IS_PROD ? '[hash:base64]' : '[name]__[local]__[hash:base64:5]',
      },
      postcss: {
        plugins: [autoprefixer()],
      },
    },
    resolve: {
      alias: getAliases(),
    },
    plugins: [
      mkcert(),
      checker({
        typescript: true,
      }),
      createHtmlPlugin({
        minify: IS_PROD,
        inject: {
          ejsOptions: {
            delimiter: '|',
            openDelimiter: '{',
            closeDelimiter: '}',
          },
          data: {
            INJECT_FONTS_PRELOAD_LINKS,
            INJECT_FONTS_FACES,
          },
        },
      }),
      react({
        plugins: [
          [
            '@swc/plugin-styled-components',
            {
              displayName: true,
              fileName: true,
              meaninglessFileNames: ['index', 'styles'],
            },
          ],
        ],
      }),
      svgr({
        svgrOptions: {
          ref: true,
          memo: true,
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
              {
                name: 'cleanupIds',
                params: {
                  remove: false,
                },
              },
              'prefixIds',
            ],
          },
        },
      }),
      legacy({
        targets: IS_PROD
          ? '> 0.2%, not dead, not op_mini all, not IE 11'
          : 'last 1 chrome version, last 1 firefox version, last 1 safari version',
      }),
      SENTRY_AUTH_TOKEN &&
        IS_DEFAULT_BRANCH &&
        sentryVitePlugin({
          url: SENTRY_URL,
          authToken: SENTRY_AUTH_TOKEN,
          org: SENTRY_ORG,
          project: SENTRY_PROJECT,
          release: {
            name: CI_COMMIT_SHORT_SHA,
          },
          sourcemaps: {
            ignore: ['node_modules', 'vite.config.mts'],
          },
        }),
    ],
  };
});
