import type { Meta, StoryObj } from "@storybook/angular";

import { ButtonComponent } from "./button";

const meta: Meta<ButtonComponent> = {
  argTypes: {
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "ghost", "outline"],
    },
  },
  component: ButtonComponent,
  render: (args) => ({
    props: args,
    template: `<nv-button [variant]="variant" [size]="size" [disabled]="disabled">Button</nv-button>`,
  }),
  tags: ["autodocs"],
  title: "Components/Button",
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: { disabled: false, size: "md", variant: "default" },
};

export const Secondary: Story = {
  args: { disabled: false, size: "md", variant: "secondary" },
};

export const Destructive: Story = {
  args: { disabled: false, size: "md", variant: "destructive" },
};

export const Outline: Story = {
  args: { disabled: false, size: "md", variant: "outline" },
};

export const Ghost: Story = {
  args: { disabled: false, size: "md", variant: "ghost" },
};

export const Disabled: Story = {
  args: { disabled: true, size: "md", variant: "default" },
};

export const AllVariants: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: [ButtonComponent] },
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <nv-button variant="default">Default</nv-button>
        <nv-button variant="secondary">Secondary</nv-button>
        <nv-button variant="destructive">Destructive</nv-button>
        <nv-button variant="outline">Outline</nv-button>
        <nv-button variant="ghost">Ghost</nv-button>
        <nv-button disabled>Disabled</nv-button>
      </div>
    `,
  }),
};

export const AllSizes: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: [ButtonComponent] },
    template: `
      <div style="display:flex; gap:8px; align-items:center;">
        <nv-button size="sm">Small</nv-button>
        <nv-button size="md">Medium</nv-button>
        <nv-button size="lg">Large</nv-button>
      </div>
    `,
  }),
};
