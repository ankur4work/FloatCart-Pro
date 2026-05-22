import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ExitIframe() {
  const { search } = useLocation();

  useEffect(() => {
    if (!search) return;

    const params = new URLSearchParams(search);
    const redirectUri = params.get("redirectUri");
    if (!redirectUri) return;

    const decodedUri = decodeURIComponent(redirectUri);
    let url;

    try {
      url = new URL(decodedUri);
    } catch {
      return;
    }

    if (url.hostname === window.location.hostname) {
      window.top.location.href = decodedUri;
    }
  }, [search]);

  return null;
}
