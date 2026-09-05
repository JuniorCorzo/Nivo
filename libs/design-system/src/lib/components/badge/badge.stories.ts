import type { Meta, StoryObj } from "@storybook/angular";

import { BadgeComponent } from "./badge";

const meta: Meta<BadgeComponent> = {
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "success",
        "warning",
        "info",
        "outline",
      ],
    },
  },
  component: BadgeComponent,
  render: (args) => ({
    props: args,
    template: `<nv-badge [variant]="variant">Badge</nv-badge>`,
  }),
  tags: ["autodocs"],
  title: "Components/Badge",
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Info: Story = { args: { variant: "info" } };
export const Outline: Story = { args: { variant: "outline" } };

export const AllVariants: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: [BadgeComponent] },
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <nv-badge variant="default">Default</nv-badge>
        <nv-badge variant="secondary">Secondary</nv-badge>
        <nv-badge variant="destructive">Error</nv-badge>
        <nv-badge variant="success">Success</nv-badge>
        <nv-badge variant="warning">Warning</nv-badge>
        <nv-badge variant="info">Info</nv-badge>
        <nv-badge variant="outline">Outline</nv-badge>
      </div>
    `,
  }),
};
