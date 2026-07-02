import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "分店" };

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: branches } = await supabase
    .from("branches")
    .select("id, state, city, suburb, address, is_default")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分店</h1>
        <p className="text-muted-foreground mt-1">
          目前於澳洲維多利亞州設有據點，歡迎親臨取書。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(branches ?? []).map((branch) => (
          <Card key={branch.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {branch.suburb}
                {branch.is_default && <Badge>總部</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {branch.city}, {branch.state}
              </p>
              {branch.address && <p className="mt-1 text-sm">{branch.address}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
