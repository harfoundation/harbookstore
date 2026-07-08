import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function CourseNudgeEmail({ lessonTitle }: { lessonTitle: string }) {
  return (
    <Html>
      <Head />
      <Preview>山書坊課程陪伴提醒</Preview>
      <Body
        style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}
      >
        <Container
          style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px" }}
        >
          <Heading as="h2">還記得您的學習旅程嗎？</Heading>
          <Text>
            您上次在「{lessonTitle}
            」停下了腳步。歡迎隨時回來繼續，我們在山書坊陪伴您一起成長。
          </Text>
          <Text>山書坊 Har Book Club 敬上</Text>
        </Container>
      </Body>
    </Html>
  );
}
