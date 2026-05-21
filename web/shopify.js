import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import dotenv from "dotenv";
import { billingConfig } from "./config/plans.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const mongoDatabase = process.env.MONGODB_DATABASE || "floatcart_pro";
const appHost =
  process.env.SHOPIFY_APP_URL ||
  process.env.HOST ||
  "https://pvp8i6ljdc2w2l99ac012ma7.91.239.208.85.sslip.io";

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: appHost.replace(/https?:\/\//, ""),
    scopes: process.env.SCOPES.split(","),
    billing: billingConfig,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new MongoDBSessionStorage(mongoUri, mongoDatabase),
});

export default shopify;
