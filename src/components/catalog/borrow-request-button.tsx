"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBorrowRequest } from "@/lib/actions/borrow-requests";

export function BorrowRequestButton({
  bookId,
  isLoggedIn,
}: {
  bookId: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"self_pickup" | "mail">(
    "self_pickup",
  );
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        onClick={() => {
          if (!isLoggedIn) {
            toast.error("請先登入才能借閱");
            return;
          }
          setOpen(true);
        }}
      >
        免費借閱
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>申請借閱</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm font-medium">領取方式</p>
          <Select
            items={{ self_pickup: "自取", mail: "郵寄" }}
            value={deliveryMethod}
            onValueChange={(v) => setDeliveryMethod(v as typeof deliveryMethod)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_pickup">自取</SelectItem>
              <SelectItem value="mail">郵寄</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await createBorrowRequest({ bookId, deliveryMethod });
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                toast.success("借閱申請已送出，我們會儘快處理");
                setOpen(false);
              });
            }}
          >
            送出申請
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
