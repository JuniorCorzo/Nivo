import type { Meta, StoryObj } from "@storybook/angular";
import { ButtonComponent } from "./button";

const meta: Meta<ButtonComponent> = {
  title: "Components/Button",
  component: ButtonComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "ghost", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    disabled: { control: "boolean" },
  },
  render: (args) => ({
    props: args,
    template: `<nv-button [variant]="variant" [size]="size" [disabled]="disabled">Button</nv-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: { variant: "default", size: "md", disabled: false },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", disabled: false },
};

export const Destructive: Story = {
  args: { variant: "destructive", size: "md", disabled: false },
};

export const Outline: Story = {
  args: { variant: "outline", size: "md", disabled: false },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "md", disabled: false },
};

export const Disabled: Story = {
  args: { variant: "default", size: "md", disabled: true },
};

export const AllVariants: StoryObj = {
  render: () => ({
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
    moduleMetadata: { imports: [ButtonComponent] },
  }),
};

export const AllSizes: StoryObj = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px; align-items:center;">
        <nv-button size="sm">Small</nv-button>
        <nv-button size="md">Medium</nv-button>
        <nv-button size="lg">Large</nv-button>
      </div>
    `,
    moduleMetadata: { imports: [ButtonComponent] },
  }),
};
