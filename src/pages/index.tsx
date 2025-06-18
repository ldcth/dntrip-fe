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
      <main
        className="flex-grow flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/tour-du-lich-da-nang-1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1,
          }}
        />

        {/* Content for the home page */}
        <Layout
          className="layout"
          style={{ background: "transparent", position: "relative", zIndex: 2 }}
        >
          <Head>
            <title>AI Trip Planner - Craft Unforgettable Itineraries</title>
            <meta
              name="description"
              content="Your personal trip planner and travel curator"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Content style={{ padding: "100px 50px", background: "transparent" }}>
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
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
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
                    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                  }}
                >
                  Da Nang Trip
                </Title>

                <Paragraph
                  style={{
                    fontSize: "18px",
                    marginTop: "30px",
                    color: "white",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    padding: "20px",
                    borderRadius: "8px",
                  }}
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
                        background: "#FF6B57",
                        borderColor: "#FF6B57",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
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
