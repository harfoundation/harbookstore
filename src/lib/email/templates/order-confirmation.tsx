import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function OrderConfirmationEmail({
  orderNumber,
  subtotalCents,
}: {
  orderNumber: string;
  subtotalCents: number;
}) {
  const amount = (subtotalCents / 100).toFixed(2);

  return (
    <Html>
      <Head />
      <Preview>山書坊訂單確認 {orderNumber}</Preview>
      <Body
        style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}
      >
        <Container
          style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px" }}
        >
          <Heading as="h2">感謝您的訂購！</Heading>
          <Text>您的訂單編號：{orderNumber}</Text>
          <Text>訂單金額：AUD ${amount}</Text>
          <Text>
            請透過銀行轉帳完成付款，並在轉帳備註中註明訂單編號，以便我們儘快確認。
            如有任何問題，歡迎隨時聯絡我們。
          </Text>
          <Text>山書坊 Har Book Club 敬上</Text>
        </Container>
      </Body>
    </Html>
  );
}
