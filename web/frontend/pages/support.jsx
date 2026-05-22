import React, { useMemo } from "react";
import {
  Button,
  Card,
  Layout,
  Page,
  Stack,
  TextContainer,
} from "@shopify/polaris";
import { useLocation, useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "Which themes are supported?",
    answer:
      "FloatCart Pro is designed for Online Store 2.0 themes where app embeds can be enabled directly from the theme editor.",
  },
  {
    question: "Where does the floating cart button appear?",
    answer:
      "The app embed is intended for storefront product experiences and should be checked on both desktop and mobile after activation.",
  },
  {
    question: "What does Premium add?",
    answer:
      "Premium unlocks advanced storefront customization, richer cart presentation, and the polished production-ready FloatCart experience.",
  },
  {
    question: "How do I get setup help?",
    answer:
      "Reach out at REPLACE-WITH-SUPPORT-EMAIL and include your shop domain plus a short note about the issue you are seeing.",
  },
];

export default function Support() {
  const navigate = useNavigate();
  const location = useLocation();
  const shopQuery = useMemo(() => {
    const shop = new URLSearchParams(location.search).get("shop");
    return shop ? `?shop=${encodeURIComponent(shop)}` : "";
  }, [location.search]);

  return (
    <Page
      title="Support"
      subtitle="Clear help for setup, billing, and storefront activation."
      fullWidth
    >
      <div
        style={{
          marginBottom: 24,
          padding: 28,
          borderRadius: 26,
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 24%), linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #2563eb 100%)",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 720 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            FloatCart Pro support
          </div>
          <h1
            style={{
              marginTop: 16,
              marginBottom: 12,
              fontSize: 36,
              lineHeight: 1.1,
            }}
          >
            Support that matches the storefront you are building.
          </h1>
          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              maxWidth: 620,
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Whether you are activating the embed for the first time or moving a
            store onto Premium, we want the next step to feel straightforward.
          </p>
          <Stack spacing="tight">
            <Button primary onClick={() => window.open("mailto:REPLACE-WITH-SUPPORT-EMAIL")}>
              Email support
            </Button>
            <Button onClick={() => navigate(`/install${shopQuery}`)}>Open setup guide</Button>
            <Button onClick={() => navigate(`/pricing${shopQuery}`)}>Review pricing</Button>
          </Stack>
        </div>
      </div>

      <Layout>
        <Layout.Section oneHalf>
          <Card sectioned title="Best way to reach us">
            <TextContainer>
              <p>
                Email <strong>REPLACE-WITH-SUPPORT-EMAIL</strong> with your shop domain,
                theme name, and a short description of what you want the floating
                cart experience to do.
              </p>
              <p>
                For billing questions, mention whether the store is on the Free
                or Premium plan so we can point you to the right next step.
              </p>
            </TextContainer>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card sectioned title="Helpful shortcuts">
            <Stack vertical spacing="tight">
              <div>Use the dashboard to jump directly into the current theme editor.</div>
              <div>Use the pricing page to start or cancel the Premium plan.</div>
              <div>Use the setup guide when you need a quick storefront checklist.</div>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Frequently asked questions">
            <Stack vertical spacing="loose">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{faq.question}</div>
                  <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.7 }}>
                    {faq.answer}
                  </div>
                </div>
              ))}
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
