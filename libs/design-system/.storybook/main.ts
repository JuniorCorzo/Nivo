import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  addons: [],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  stories: ["../src/**/*.stories.@(ts|mdx)"],
};

export default config;
