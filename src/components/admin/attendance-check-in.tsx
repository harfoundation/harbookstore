"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toggleCheckin, addWalkInCheckin, removeCheckin } from "@/lib/actions/attendance";

type Congregation = { id: string; name: string };
type Member = { id: string; display_name: string; member_type: "regular" | "co_worker" };
type WalkIn = { id: string; display_name: string };

export function AttendanceCheckIn({
  congregations,
  selectedCongregationId,
  serviceDate,
  members,
  initialCheckedInMemberIds,
  initialWalkIns,
}: {
  congregations: Congregation[];
  selectedCongregationId: string;
  serviceDate: string;
  members: Member[];
  initialCheckedInMemberIds: string[];
  initialWalkIns: WalkIn[];
}) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(new Set(initialCheckedInMemberIds));
  const [walkIns, setWalkIns] = useState(initialWalkIns);
  const [newFriendName, setNewFriendName] = useState("");
  const [isPending, startTransition] = useTransition();

  function navigate(nextCongregationId: string, nextDate: string) {
    router.push(`/admin/check-in?congregationId=${nextCongregationId}&date=${nextDate}`);
  }

  function handleToggle(member: Member) {
    const wasCheckedIn = checkedIn.has(member.id);
    setCheckedIn((prev) => {
      const next = new Set(prev);
      if (wasCheckedIn) next.delete(member.id);
      else next.add(member.id);
      return next;
    });

    startTransition(async () => {
      const result = await toggleCheckin({
        congregationId: selectedCongregationId,
        serviceDate,
        memberId: member.id,
        displayName: member.display_name,
        memberType: member.member_type,
      });
      if (!result.success) {
        toast.error(result.error);
        setCheckedIn((prev) => {
          const next = new Set(prev);
          if (wasCheckedIn) next.add(member.id);
          else next.delete(member.id);
          return next;
        });
      }
    });
  }

  function handleAddWalkIn() {
    if (!newFriendName.trim()) return;
    const name = newFriendName.trim();
    setNewFriendName("");

    startTransition(async () => {
      const result = await addWalkInCheckin({
        congregationId: selectedCongregationId,
        serviceDate,
        displayName: name,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemoveWalkIn(walkInId: string) {
    setWalkIns((prev) => prev.filter((w) => w.id !== walkInId));
    startTransition(async () => {
      const result = await removeCheckin({ checkinId: walkInId });
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  const totalCount = checkedIn.size + walkIns.length;

  return (
    <div className="space-y-4 pb-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          items={Object.fromEntries(congregations.map((c) => [c.id, c.name]))}
          value={selectedCongregationId}
          onValueChange={(v) => v && navigate(v, serviceDate)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {congregations.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={serviceDate}
          onChange={(e) => navigate(selectedCongregationId, e.target.value)}
        />
      </div>

      <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3 text-sm font-medium">
        <span>總人數：{totalCount}</span>
        <span>新朋友：{walkIns.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {members.map((member) => {
          const isChecked = checkedIn.has(member.id);
          return (
            <button
              key={member.id}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(member)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                isChecked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <span>{member.display_name}</span>
              {member.member_type === "co_worker" && (
                <span className="ml-1 text-xs opacity-70">（同工）</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">新朋友打卡</p>
        <div className="flex gap-2">
          <Input
            placeholder="輸入新朋友姓名"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddWalkIn();
            }}
          />
          <Button disabled={isPending || !newFriendName.trim()} onClick={handleAddWalkIn}>
            加入
          </Button>
        </div>
        {walkIns.length > 0 && (
          <ul className="space-y-1 text-sm">
            {walkIns.map((w) => (
              <li key={w.id} className="flex items-center justify-between">
                <span>{w.display_name}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive text-xs"
                  onClick={() => handleRemoveWalkIn(w.id)}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
