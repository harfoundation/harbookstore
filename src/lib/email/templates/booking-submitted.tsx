import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function BookingSubmittedEmail({
  serviceName,
  preferredDate,
  preferredTime,
}: {
  serviceName: string;
  preferredDate: string;
  preferredTime: string | null;
}) {
  return (
    <Html>
      <Head />
      <Preview>山書坊預約已收到 — {serviceName}</Preview>
      <Body
        style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}
      >
        <Container
          style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px" }}
        >
          <Heading as="h2">已收到您的預約申請</Heading>
          <Text>預約項目：{serviceName}</Text>
          <Text>
            希望日期：{preferredDate}
            {preferredTime ? `　時段：${preferredTime}` : ""}
          </Text>
          <Text>我們會盡快確認您的預約，並以電郵回覆確認結果。</Text>
          <Text>山書坊 Har Book Club 敬上</Text>
        </Container>
      </Body>
    </Html>
  );
}
