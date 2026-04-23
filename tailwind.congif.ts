import type { Config } from "tailwindcss";

const config: Config = {
  // ... your other config
  plugins: [
    require('@tailwindcss/typography'),
    // ... other plugins
  ],
};
export default config;