import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function BookingRespondedEmail({
  serviceName,
  preferredDate,
  preferredTime,
  status,
  adminReplyMessage,
}: {
  serviceName: string;
  preferredDate: string;
  preferredTime: string | null;
  status: "confirmed" | "declined";
  adminReplyMessage: string | null;
}) {
  const statusLabel = status === "confirmed" ? "已確認" : "無法安排";

  return (
    <Html>
      <Head />
      <Preview>
        山書坊預約{statusLabel} — {serviceName}
      </Preview>
      <Body
        style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}
      >
        <Container
          style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px" }}
        >
          <Heading as="h2">您的預約{statusLabel}</Heading>
          <Text>預約項目：{serviceName}</Text>
          <Text>
            希望日期：{preferredDate}
            {preferredTime ? `　時段：${preferredTime}` : ""}
          </Text>
          {adminReplyMessage && <Text>山書坊回覆：{adminReplyMessage}</Text>}
          <Text>如有任何問題，歡迎隨時聯絡我們。</Text>
          <Text>山書坊 Har Book Club 敬上</Text>
        </Container>
      </Body>
    </Html>
  );
}
