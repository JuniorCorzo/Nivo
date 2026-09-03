import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,ts}"],
  plugins: [],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      colors: {
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        background: "var(--background)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        foreground: "var(--foreground)",
        info: "var(--info)",
        input: "var(--input)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        ring: "var(--ring)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
    },
  },
} satisfies Config;
