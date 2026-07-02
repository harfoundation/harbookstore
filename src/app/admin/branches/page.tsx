import type { Metadata } from "next";
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
import { BranchFormDialog } from "@/components/admin/branch-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理分店" };

export default async function AdminBranchesPage() {
  const supabase = await createClient();
  const { data: branches } = await supabase
    .from("branches")
    .select("id, state, city, suburb, address, is_default, is_active, sort_order")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">分店管理</h1>
        <BranchFormDialog trigger={<Button>新增分店</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>州別</TableHead>
            <TableHead>城市</TableHead>
            <TableHead>區域</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(branches ?? []).map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>{branch.state}</TableCell>
              <TableCell>{branch.city}</TableCell>
              <TableCell>
                {branch.suburb}
                {branch.is_default && (
                  <Badge className="ml-2" variant="default">
                    預設
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={branch.is_active ? "default" : "secondary"}>
                  {branch.is_active ? "啟用中" : "已停用"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <BranchFormDialog
                  branch={branch}
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
