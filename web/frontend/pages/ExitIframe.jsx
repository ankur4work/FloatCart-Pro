import { Banner, Layout, Page } from "@shopify/polaris";

export default function ExitIframe() {
  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: "100px" }}>
            <Banner status="info" title="This route is no longer used.">
              Reopen the app from Shopify admin if you were redirected here.
            </Banner>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
