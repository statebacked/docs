// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'State Backed',
  tagline: 'Deploy any state machine as an invincible cloud actor with one command and connect from any client in two lines of code',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://docs.statebacked.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'statebacked', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: [
    {src: 'https://plausible.io/js/script.js', defer: true, 'data-domain': 'docs.statebacked.dev'},
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/statebacked/docs/tree/main/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ]
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/statebacked/docs/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
      },
      navbar: {
        title: 'State Backed',
        logo: {
          alt: 'State Backed Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: "https://statebacked.dev",
            label: "Try State Backed",
          },
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/statebacked/smply',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Quick Start',
                to: '/docs/intro',
              },
              {
                label: "State Backed Dashboard",
                href: "https://statebacked.dev"
              },
              {
                label: 'API Reference',
                href: "https://api-docs.statebacked.dev"
              },
              {
                label: "Client library API reference",
                href: "https://statebacked.github.io/client-js/"
              },
              {
                label: "Types for machine definitions and migrations",
                href: "https://statebacked.github.io/machine/"
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/state-backed',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/abrgrBuilds',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: "Pricing",
                to: "/docs/pricing"
              },
              {
                label: 'Client library',
                href: 'https://github.com/statebacked/client-js',
              },
              {
                label: 'smply CLI',
                href: 'https://github.com/statebacked/smply',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/statebacked',
              },
            ],
          },
        ],
        copyright: `Copyright © 2023 Simply Stated Software, LLC.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
