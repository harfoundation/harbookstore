import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getWhatsappCommunityLink } from "@/lib/whatsapp";

export function JoinWhatsappCommunityButton({
  variant = "outline",
  className,
}: {
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const communityLink = getWhatsappCommunityLink();
  if (!communityLink) return null;

  return (
    <Button
      variant={variant}
      className={className}
      render={
        <Link href={communityLink} target="_blank" rel="noopener noreferrer" />
      }
    >
      加入 WhatsApp 社群
    </Button>
  );
}
