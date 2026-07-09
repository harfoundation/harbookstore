"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteSettlementResource } from "@/lib/actions/settlement";

export function DeleteSettlementResourceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSettlementResource(id);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDelete}>
      刪除
    </Button>
  );
}
