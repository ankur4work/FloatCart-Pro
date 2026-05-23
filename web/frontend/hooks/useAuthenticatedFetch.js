import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";

/**
 * A hook that returns an auth-aware fetch function.
 * @returns {Function} fetch function
 */
export function useAuthenticatedFetch() {
  return async (uri, options = {}) => {
    const response = await fetch(uri, {
      credentials: "same-origin",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    const redirected = await checkForReauthorization(response);
    if (redirected) {
      return new Promise(() => {});
    }

    return response;
  };
}

async function checkForReauthorization(response) {
  if (response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
    redirectToAuth(
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ||
        "/api/auth"
    );
    return true;
  }

  if (response.status !== 401) {
    return false;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return false;
  }

  const data = await response.clone().json().catch(() => null);
  if (!data?.reauthUrl) {
    return false;
  }

  redirectToAuth(data.reauthUrl);
  return true;
}

function redirectToAuth(targetUrl) {
  const currentShop = new URLSearchParams(window.location.search).get("shop");
  const host = new URLSearchParams(window.location.search).get("host");
  let authUrl;

  try {
    authUrl = new URL(targetUrl || "/api/auth", window.location.origin);
  } catch {
    authUrl = new URL("/api/auth", window.location.origin);
  }

  if (currentShop && !authUrl.searchParams.get("shop")) {
    authUrl.searchParams.set("shop", currentShop);
  }

  if (host) {
    const app = createApp({
      apiKey: process.env.SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, authUrl.toString());
    return;
  }

  window.location.assign(authUrl.toString());
}

