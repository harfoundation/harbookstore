import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CongregationMemberFormDialog } from "@/components/admin/congregation-member-form-dialog";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = { regular: "老朋友", co_worker: "同工" };

export default async function CongregationRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: congregation } = await supabase
    .from("congregations")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!congregation) notFound();

  const { data: members } = await supabase
    .from("congregation_members")
    .select("id, display_name, member_type, notes, is_active")
    .eq("congregation_id", id)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{congregation.name} — 名單管理</h1>
        <CongregationMemberFormDialog
          congregationId={id}
          trigger={<Button>新增成員</Button>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>類型</TableHead>
            <TableHead>備註</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(members ?? []).map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.display_name}</TableCell>
              <TableCell>{TYPE_LABELS[member.member_type]}</TableCell>
              <TableCell className="text-muted-foreground">{member.notes}</TableCell>
              <TableCell>
                <Badge variant={member.is_active ? "default" : "secondary"}>
                  {member.is_active ? "在名單中" : "已停用"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <CongregationMemberFormDialog
                  congregationId={id}
                  member={member}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
