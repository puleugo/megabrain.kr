import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Megabrain',
  tagline: '인제대학교 컴퓨터공학과 웹 개발 동아리 메가브레인',
  favicon: 'img/favicon/favicon.ico',

  url: 'https://megabrain.kr',
  baseUrl: '/',

  organizationName: 'inje-megabrain',
  projectName: 'megabrain.kr',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/megaton',
            to: '/activities/megathon/2023',
          },
        ],
      },
    ]
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/inje-megabrain/megabrain.kr/tree/main',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          editUrl: 'https://github.com/inje-megabrain/megabrain.kr/tree/main',
        },
        theme: {customCss: './src/css/custom.css',},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/megabrain_opengraph.jpg',
    docs: {
      sidebar: {autoCollapseCategories: false,}
    },
    navbar: {
      title: 'Megabrain',
      logo: {
        alt: 'My Site Logo',
        src: 'img/icons/logo.svg',
      },
      items: [
        {
          to: '/intro',
          label: '소개',
          position: 'left',
        },
        {
          to: '/histories',
          label: '연혁',
          position: 'left'
        },
        {
          to: '/projects',
          label: '프로젝트',
          position: 'left',
        },
        {
          to: '/activities',
          label: '활동',
          position: 'left',
        },
        {
          to: '/recruit',
          label: '모집',
          position: 'left',
        },
        {
          to: '/blog',
          label: '블로그',
          position: 'left',
        },
        { // 주요 행사
          to: '/recruit',
          label: '신입회원 모집중!',
          className: "navbar-highlight",
          position: 'left',
        },
        { // 코딩테스트 개최
          href: 'https://ijo.megabrain.kr/',
          label: '코딩테스트 개최중!',
          className: "navbar-highlight",
          position: 'left',
        },
        {
          href: 'https://github.com/inje-megabrain',
          label: 'Github',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '문서',
          items: [
            {
              label: '소개',
              to: '/intro',
            },
          ],
        },
        {
          title: '커뮤니티',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/inje-megabrain',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Megabrain.kr, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
