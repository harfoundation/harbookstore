"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSecondhandOrder } from "@/lib/actions/secondhand";

export function SecondhandBuyButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "in_person">(
    "bank_transfer",
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createSecondhandOrder({ itemId, paymentMethod });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`訂單已建立：${result.orderNumber}`);
    setOpen(false);
    router.push(`/orders?created=${result.orderNumber}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">立即訂購</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>訂購此二手商品</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>付款方式</Label>
          <Select
            items={{ bank_transfer: "銀行轉帳", in_person: "親臨繳付" }}
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as "bank_transfer" | "in_person")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">銀行轉帳</SelectItem>
              <SelectItem value="in_person">親臨繳付</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "送出中…" : "確認訂購"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
