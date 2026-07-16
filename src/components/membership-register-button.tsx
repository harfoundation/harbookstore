"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitMembershipRegistration } from "@/lib/actions/membership";
import { JoinWhatsappCommunityButton } from "@/components/join-whatsapp-community-button";

export function MembershipRegisterButton({
  isLoggedIn,
  isFree = false,
}: {
  isLoggedIn: boolean;
  isFree?: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "in_person">(
    "bank_transfer",
  );
  const [submitting, setSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="space-y-2 rounded-lg border p-4 text-center">
        <p className="font-medium">請先登入才能登記成為會員</p>
        <div className="flex justify-center gap-2">
          <Button render={<Link href="/signup?next=/membership" />}>立即註冊</Button>
          <Button variant="outline" render={<Link href="/login?next=/membership" />}>
            登入
          </Button>
        </div>
      </div>
    );
  }

  if (registrationNumber) {
    return (
      <div className="space-y-1 rounded-lg border p-4 text-center">
        <p className="font-medium">登記已送出，登記編號：{registrationNumber}</p>
        {isFree ? (
          <p className="text-muted-foreground text-sm">
            您已成為會員，即可使用免費借閱等會員福利。歡迎前往
            <Link href="/donate" className="underline">
              奉獻支持
            </Link>
            頁面自願支持事工營運。
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            我們會盡快與您聯繫安排繳費，完成後工作人員將手動確認收款。
          </p>
        )}
        <div className="flex justify-center pt-1">
          <JoinWhatsappCommunityButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {!isFree && (
        <Select
          items={{ bank_transfer: "銀行轉帳", in_person: "親臨繳付" }}
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">銀行轉帳</SelectItem>
            <SelectItem value="in_person">親臨繳付</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button
        className="w-full"
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          const result = await submitMembershipRegistration(
            isFree ? {} : { paymentMethod },
          );
          setSubmitting(false);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          setRegistrationNumber(result.registrationNumber);
        }}
      >
        {submitting ? "送出中…" : "登記成為會員"}
      </Button>
    </div>
  );
}
