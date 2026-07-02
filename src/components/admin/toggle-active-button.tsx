"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setBookActive } from "@/lib/actions/books";

export function ToggleActiveButton({
  bookId,
  isActive,
}: {
  bookId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await setBookActive(bookId, !isActive);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success(isActive ? "已下架" : "已上架");
        });
      }}
    >
      {isActive ? "下架" : "上架"}
    </Button>
  );
}
