import type { Preview } from "@storybook/angular";

// Inject Google Fonts link into <head> so tokens.css @import url() doesn't need to be processed by webpack
const googleFontsLink = document.createElement("link");
googleFontsLink.rel = "stylesheet";
googleFontsLink.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@700&display=swap";
document.head.append(googleFontsLink);

const preview: Preview = {
  decorators: [
    (storyFn, context) => {
      const theme = context.globals["theme"] ?? "light";
      document.documentElement.dataset.theme = theme;
      document.body.style.backgroundColor =
        theme === "dark" ? "#09090b" : "#ffffff";
      return storyFn();
    },
  ],
  globalTypes: {
    theme: {
      defaultValue: "light",
      description: "Global theme",
      toolbar: {
        dynamicTitle: true,
        icon: "circlehollow",
        items: ["light", "dark"],
        title: "Theme",
      },
    },
  },
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#09090b" },
      ],
    },
    controls: {
      matchers: {
        color: /(?<matched>background|color)$/iu,
        date: /Date$/iu,
      },
    },
  },
};

export default preview;
