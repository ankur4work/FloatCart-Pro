import shopify from "./shopify.js";

export default async function cancelSubscription(session) {
  const subscriptionId = await getActiveSubscriptionId(session);

  if (!subscriptionId) {
    return "No subscription found";
  }

  return appSubscriptionCancel(session, subscriptionId);
}

async function getActiveSubscriptionId(session) {
  const client = new shopify.api.clients.Graphql({ session });
  const currentInstallations = await client.request(RECURRING_PURCHASES_QUERY);
  const subscriptions =
    currentInstallations?.currentAppInstallation?.activeSubscriptions ||
    currentInstallations?.data?.currentAppInstallation?.activeSubscriptions ||
    [];

  return subscriptions[0]?.id || null;
}

async function appSubscriptionCancel(session, subscriptionId) {
  const client = new shopify.api.clients.Graphql({ session });
  const mutationResponse = await client.request(CANCEL_SUBSCRIPTION, {
    variables: { id: subscriptionId },
  });

  const payload =
    mutationResponse?.appSubscriptionCancel ||
    mutationResponse?.data?.appSubscriptionCancel;
  const userErrors = payload?.userErrors || [];

  if (userErrors.length) {
    throw new Error(userErrors.map((error) => error.message).join(", "));
  }

  return payload?.appSubscription?.status || "cancelled";
}

const CANCEL_SUBSCRIPTION = `
mutation appSubscriptionCancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    appSubscription {
      id
      name
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

const RECURRING_PURCHASES_QUERY = `
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
      name
      id
      test
    }
  }
}
`;
