import Header from "@/components/Header";
import { Layout, Typography, Button, Space } from "antd";
import Head from "next/head";
import Link from "next/link";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        {/* Content for the home page will go here */}
        {/* <p className="text-gray-500 text-xl">Welcome to the application!</p> */}
        <Layout className="layout">
          <Head>
            <title>AI Trip Planner - Craft Unforgettable Itineraries</title>
            <meta
              name="description"
              content="Your personal trip planner and travel curator"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Content style={{ padding: "100px 50px" }}>
            <div
              className="site-layout-content"
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Title
                  level={1}
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    marginBottom: "0",
                  }}
                >
                  Craft Unforgettable
                  <br />
                  Itineraries with
                </Title>
                <Title
                  level={1}
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#FF6B57",
                    margin: "0",
                  }}
                >
                  Da Nang Trip
                </Title>

                <Paragraph
                  style={{ fontSize: "18px", marginTop: "30px", color: "#666" }}
                >
                  Discover the stunning beaches, vibrant culture, and
                  breathtaking landscapes of Da Nang. Let &quot;Da Nang
                  Trip&quot; be your expert guide, crafting personalized
                  itineraries that perfectly match your interests, budget, and
                  travel style. From the Marble Mountains to the Dragon Bridge,
                  explore it all with a seamlessly planned adventure.
                </Paragraph>

                <div style={{ marginTop: "40px" }}>
                  <Link href="/chat">
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        height: "50px",
                        padding: "0 30px",
                        fontSize: "18px",
                        borderRadius: "8px",
                        background: "#000",
                        borderColor: "#000",
                      }}
                    >
                      Start Planning Your Adventure
                    </Button>
                  </Link>
                </div>
              </Space>
            </div>
          </Content>
        </Layout>
      </main>
    </div>
  );
}
