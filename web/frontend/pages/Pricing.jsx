import React, { useEffect, useMemo, useState } from "react";
import {
  Banner,
  Button,
  Card,
  Frame,
  Icon,
  Layout,
  Modal,
  Page,
  Stack,
  TextContainer,
} from "@shopify/polaris";
import { CircleTickMinor, CancelSmallMinor } from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../hooks";

const PREMIUM_PRICE = Number(import.meta.env.VITE_FLOATCART_PREMIUM_PRICE || "30");
const PREMIUM_TRIAL_DAYS = Number(
  import.meta.env.VITE_FLOATCART_PREMIUM_TRIAL_DAYS || "3"
);

const planCards = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    accent: "linear-gradient(135deg, #f7efe3 0%, #f3f4f6 100%)",
    badge: "Starter",
    description:
      "A simple floating cart button for testing the app in your theme before you go live.",
    features: [
      { label: "Floating cart button", enabled: true },
      { label: "Basic storefront visibility", enabled: true },
      { label: "Advanced customization settings", enabled: false },
      { label: "Design preset switching", enabled: false },
      { label: "Product total price display", enabled: false },
      { label: "Premium support", enabled: false },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: `$${PREMIUM_PRICE}`,
    accent: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #2563eb 100%)",
    badge: "Production",
    description:
      PREMIUM_TRIAL_DAYS > 0
        ? `Unlock the full FloatCart experience for live stores with advanced controls and conversion-focused storefront options, with a ${PREMIUM_TRIAL_DAYS}-day free trial.`
        : "Unlock the full FloatCart experience for live stores with advanced controls and conversion-focused storefront options.",
    features: [
      { label: "Floating cart button", enabled: true },
      { label: "Advanced customization settings", enabled: true },
      { label: "Design preset switching", enabled: true },
      { label: "Product total price display", enabled: true },
      { label: "Premium storefront styling", enabled: true },
      { label: "Priority support", enabled: true },
    ],
  },
];

export default function Pricing() {
  const fetchAuth = useAuthenticatedFetch();
  const tick = useMemo(
    () => <Icon source={CircleTickMinor} color="success" />,
    []
  );
  const cross = useMemo(
    () => <Icon source={CancelSmallMinor} color="subdued" />,
    []
  );

  const [serverTier, setServerTier] = useState("free");
  const [loading, setLoading] = useState({ page: false, action: null });
  const [confirm, setConfirm] = useState({ open: false, target: null });
  const [banner, setBanner] = useState({ status: null, msg: "" });
  const [isTestBilling, setIsTestBilling] = useState(false);

  const activePlan = serverTier && serverTier !== "free" ? "premium" : "free";

  useEffect(() => {
    refreshTier();
  }, []);

  async function refreshTier() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      setLoading((current) => ({ ...current, page: true }));
      const response = await fetchAuth("/api/hasActiveSubscription", {
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch subscription.");
      }

      setServerTier(data?.tier || "free");
      setIsTestBilling(Boolean(data?.isTest));
    } catch (error) {
      console.error(error);
      setServerTier("free");
      setBanner({
        status: "critical",
        msg:
          error?.name === "AbortError"
            ? "Subscription status took too long to load, so we showed the Free plan. You can retry."
            : "We couldn't load your subscription status. You can still retry.",
      });
    } finally {
      window.clearTimeout(timeoutId);
      setLoading((current) => ({ ...current, page: false }));
    }
  }

  function openConfirm(target) {
    if (target === activePlan) {
      setBanner({
        status: "info",
        msg: `Your store is already on the ${target === "premium" ? "Premium" : "Free"} plan.`,
      });
      return;
    }

    setConfirm({ open: true, target });
  }

  async function runConfirm() {
    const target = confirm.target;
    setConfirm({ open: false, target: null });

    if (!target) return;

    try {
      setLoading((current) => ({ ...current, action: target }));

      if (target === "free") {
        const response = await fetchAuth("/api/cancelSubscription");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Failed to cancel subscription.");
        }

        setBanner({
          status: "success",
          msg:
            data?.status === "No subscription found"
              ? "No active premium subscription was found."
              : "Premium cancelled. Your store is back on the Free plan.",
        });
        await refreshTier();
        return;
      }

      setBanner({
        status: "success",
        msg: "Redirecting you to Shopify billing...",
      });
      window.top.location.href = `/api/startSubscription${window.location.search}`;
      return;
    } catch (error) {
      console.error(error);
      setBanner({
        status: "critical",
        msg:
          target === "free"
            ? "Cancelling Premium failed."
            : "Starting Premium billing failed.",
      });
    } finally {
      setLoading((current) => ({ ...current, action: null }));
    }
  }

  const FeatureRow = ({ enabled, label }) => (
    <Stack spacing="tight" alignment="center">
      {enabled ? tick : cross}
      <span style={{ color: enabled ? "#111827" : "#6b7280" }}>{label}</span>
    </Stack>
  );

  return (
    <Frame>
      <Modal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, target: null })}
        title={
          confirm.target === "premium"
            ? "Upgrade to Premium"
            : "Switch back to Free"
        }
        primaryAction={{
          content:
            confirm.target === "premium"
              ? PREMIUM_TRIAL_DAYS > 0
                ? `Start ${PREMIUM_TRIAL_DAYS}-day trial, then $${PREMIUM_PRICE}/month`
                : `Continue for $${PREMIUM_PRICE}/month`
              : "Cancel Premium",
          onAction: runConfirm,
          loading: loading.action === confirm.target,
          destructive: confirm.target === "free",
        }}
        secondaryActions={[
          {
            content: "Back",
            onAction: () => setConfirm({ open: false, target: null }),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            {confirm.target === "premium" ? (
              <p>
                {PREMIUM_TRIAL_DAYS > 0
                  ? `Premium unlocks the full storefront experience, advanced customization, and product total price support for your dedicated FloatCart Pro domain. Your store will start with a ${PREMIUM_TRIAL_DAYS}-day free trial, then move to $${PREMIUM_PRICE}/month.`
                  : `Premium unlocks the full storefront experience, advanced customization, and product total price support for your dedicated FloatCart Pro domain.`}
              </p>
            ) : (
              <p>
                Cancelling Premium will return the store to the Free plan and
                remove premium-only storefront controls.
              </p>
            )}
          </TextContainer>
        </Modal.Section>
      </Modal>

      <Page
        title="Pricing"
        subtitle="Choose a plan for your live storefront experience."
        fullWidth
      >
        {banner.msg ? (
          <Banner
            status={banner.status}
            onDismiss={() => setBanner({ status: null, msg: "" })}
          >
            {banner.msg}
          </Banner>
        ) : null}

        {isTestBilling ? (
          <Banner status="info">
            Billing test mode is enabled for this environment.
          </Banner>
        ) : null}

        <div
          style={{
            marginTop: 20,
            marginBottom: 20,
            padding: 24,
            borderRadius: 24,
            background:
              "radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 30%), linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fafc 100%)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#1d4ed8",
              }}
            >
              FloatCart Pro
            </div>
            <h2
              style={{
                margin: "10px 0 8px",
                fontSize: 34,
                lineHeight: 1.15,
                color: "#111827",
              }}
            >
              Launch the polished version when your store is ready to convert.
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: "#4b5563" }}>
              Free keeps setup simple. Premium gives merchants the version
              intended for production storefronts.
            </p>
          </div>
        </div>

        <Layout>
          {planCards.map((plan) => {
            const isActive = activePlan === plan.key;
            const isBusy = loading.action === plan.key;

            return (
              <Layout.Section oneHalf key={plan.key}>
                <Card sectioned>
                  <div
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      border: isActive
                        ? "2px solid #2563eb"
                        : "1px solid rgba(17,24,39,0.08)",
                      boxShadow: isActive
                        ? "0 18px 50px rgba(37,99,235,0.18)"
                        : "0 10px 30px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      style={{
                        padding: 24,
                        background: plan.accent,
                        color: plan.key === "premium" ? "#fff" : "#111827",
                      }}
                    >
                      <Stack alignment="center" distribution="equalSpacing">
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              letterSpacing: 1,
                              textTransform: "uppercase",
                              opacity: 0.86,
                            }}
                          >
                            {plan.badge}
                          </div>
                          <div
                            style={{
                              fontSize: 30,
                              fontWeight: 700,
                              marginTop: 8,
                            }}
                          >
                            {plan.name}
                          </div>
                        </div>
                        {isActive ? (
                          <div
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              background:
                                plan.key === "premium"
                                  ? "rgba(255,255,255,0.16)"
                                  : "rgba(17,24,39,0.08)",
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            Current
                          </div>
                        ) : null}
                      </Stack>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          marginTop: 18,
                        }}
                      >
                        <span style={{ fontSize: 40, fontWeight: 700 }}>
                          {plan.price}
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            opacity: 0.86,
                          }}
                        >
                          {plan.key === "premium" ? "/month" : "forever"}
                        </span>
                      </div>
                      <p
                        style={{
                          marginTop: 12,
                          marginBottom: 0,
                          fontSize: 15,
                          lineHeight: 1.6,
                          color:
                            plan.key === "premium"
                              ? "rgba(255,255,255,0.88)"
                              : "#4b5563",
                        }}
                      >
                        {plan.description}
                      </p>
                    </div>

                    <div style={{ padding: 24, background: "#fff" }}>
                      <Stack vertical spacing="loose">
                        {plan.features.map((feature) => (
                          <FeatureRow
                            key={`${plan.key}-${feature.label}`}
                            enabled={feature.enabled}
                            label={feature.label}
                          />
                        ))}
                      </Stack>

                      <div style={{ marginTop: 24 }}>
                        <Button
                          primary={plan.key === "premium"}
                          destructive={plan.key === "free" && activePlan === "premium"}
                          fullWidth
                          loading={isBusy}
                          disabled={isActive}
                          onClick={() => openConfirm(plan.key)}
                        >
                          {isActive
                            ? `${plan.name} active`
                            : plan.key === "premium"
                            ? `Upgrade to Premium`
                            : "Switch to Free"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Layout.Section>
            );
          })}
        </Layout>
      </Page>
    </Frame>
  );
}
