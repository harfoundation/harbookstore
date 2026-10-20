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
import { createCourseEnrollmentOrder } from "@/lib/actions/orders";

type Fees = {
  priceCents: number | null;
  trainingFeeCents: number | null;
  bookFeeCents: number | null;
  instructorFeeCents: number | null;
};

const aud = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function CourseEnrollCard({
  courseId,
  fees,
  isLoggedIn,
  existingOrderNumber,
}: {
  courseId: string;
  fees: Fees;
  isLoggedIn: boolean;
  existingOrderNumber: string | null;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "in_person">(
    "bank_transfer",
  );
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState(existingOrderNumber);

  const breakdown = [
    { label: "培訓費", cents: fees.trainingFeeCents },
    { label: "書費", cents: fees.bookFeeCents },
    { label: "講師費", cents: fees.instructorFeeCents },
  ].filter((row) => row.cents != null);
  const isFree = !fees.priceCents;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">報名費用</h2>
      {isFree ? (
        <p className="text-sm">免費</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {breakdown.map((row) => (
              <tr key={row.label}>
                <td className="text-muted-foreground py-0.5">{row.label}</td>
                <td className="py-0.5 text-right">{aud(row.cents ?? 0)}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold">
              <td className="pt-1">合計（澳幣）</td>
              <td className="pt-1 text-right">{aud(fees.priceCents ?? 0)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {!isLoggedIn ? (
        <div className="flex gap-2">
          <Button render={<Link href={`/signup?next=/courses/${courseId}`} />}>
            註冊後報名
          </Button>
          <Button
            variant="outline"
            render={<Link href={`/login?next=/courses/${courseId}`} />}
          >
            登入
          </Button>
        </div>
      ) : orderNumber ? (
        <p className="text-sm">
          已報名，訂單編號：{orderNumber}。
          {!isFree && "我們會與您聯繫安排繳費，收款確認後即可開始上課。"}{" "}
          <Link href="/orders" className="underline">
            查看我的訂單
          </Link>
        </p>
      ) : (
        <>
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
              const result = await createCourseEnrollmentOrder({
                courseId,
                paymentMethod,
              });
              setSubmitting(false);
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              setOrderNumber(result.orderNumber);
              toast.success("報名成功");
            }}
          >
            {submitting ? "送出中…" : "報名這個培訓"}
          </Button>
        </>
      )}
    </div>
  );
}
