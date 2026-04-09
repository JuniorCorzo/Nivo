import type { Preview } from '@storybook/angular';

// Inject Google Fonts link into <head> so tokens.css @import url() doesn't need to be processed by webpack
const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@700&display=swap';
document.head.appendChild(googleFontsLink);

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#09090b' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (storyFn, context) => {
      const theme = context.globals['theme'] ?? 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.body.style.backgroundColor =
        theme === 'dark' ? '#09090b' : '#ffffff';
      return storyFn();
    },
  ],
};

export default preview;
