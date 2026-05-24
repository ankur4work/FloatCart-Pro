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
  let authUrl;

  try {
    authUrl = new URL(targetUrl || "/api/auth", window.location.origin);
  } catch {
    authUrl = new URL("/api/auth", window.location.origin);
  }

  if (currentShop && !authUrl.searchParams.get("shop")) {
    authUrl.searchParams.set("shop", currentShop);
  }

  const exitIframeUrl = new URL("/exitiframe", window.location.origin);
  exitIframeUrl.searchParams.set("redirectUri", encodeURIComponent(authUrl.toString()));
  window.location.assign(`${exitIframeUrl.pathname}${exitIframeUrl.search}`);
}

