import { defineConfig, loadEnv } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

// Vite 2.x predefines __dirname via esbuild so we use a different name
const _configDir = dirname(fileURLToPath(import.meta.url));
process.env = { ...process.env, ...loadEnv("", process.cwd()) };

console.log("API key: ", process.env.SHOPIFY_API_KEY);
console.log("Host: ", process.env.HOST);

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = { protocol: "ws", host: "localhost", port: 64999, clientPort: 64999 };
} else {
  hmrConfig = { protocol: "wss", host, port: process.env.FRONTEND_PORT, clientPort: 443 };
}

export default defineConfig({
  root: _configDir,
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "import.meta.env.VITE_FLOATCART_ACTIVATE_APP_ID": JSON.stringify(
      process.env.VITE_FLOATCART_ACTIVATE_APP_ID || "ce516e3a-72dd-314a-b704-6d9d0416841f2fceedf0/floating-button"
    ),
    "import.meta.env.VITE_FLOATCART_PREMIUM_PRICE": JSON.stringify(
      process.env.FLOATCART_PREMIUM_PRICE || "30"
    ),
    "import.meta.env.VITE_FLOATCART_PREMIUM_TRIAL_DAYS": JSON.stringify(
      process.env.FLOATCART_PREMIUM_TRIAL_DAYS || "3"
    ),
  },
  server: {
    host: "localhost",
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
