import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import dotenv from "dotenv";
import { billingConfig } from "./config/plans.js";

dotenv.config();

const DEFAULT_APP_URL = "https://pvp8i6ljdc2w2l99ac012ma7.91.239.208.85.sslip.io";

function resolveAppUrl() {
  const candidates = [
    process.env.SHOPIFY_APP_URL,
    process.env.HOST,
    DEFAULT_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const parsed = new URL(candidate);
      const hasInvalidAuth = Boolean(parsed.username || parsed.password);
      const hasInvalidSearch = Boolean(parsed.search || parsed.hash);
      const hasInvalidPath = parsed.pathname && parsed.pathname !== "/";
      const hasInvalidPort = Boolean(parsed.port && parsed.port !== "443");

      if (
        parsed.protocol !== "https:" ||
        !parsed.hostname ||
        hasInvalidAuth ||
        hasInvalidSearch ||
        hasInvalidPath ||
        hasInvalidPort
      ) {
        continue;
      }

      return parsed.origin;
    } catch {
      continue;
    }
  }

  return DEFAULT_APP_URL;
}

const mongoUri = process.env.MONGODB_URI;
const mongoDatabase = process.env.MONGODB_DATABASE || "floatcart_pro";
const appHost = resolveAppUrl();

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: appHost.replace(/https?:\/\//, ""),
    scopes: process.env.SCOPES.split(","),
    billing: billingConfig,
    isEmbeddedApp: true,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new MongoDBSessionStorage(mongoUri, mongoDatabase),
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
});

export default shopify;
