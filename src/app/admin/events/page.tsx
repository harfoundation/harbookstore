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
import { EventFormDialog } from "@/components/admin/event-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "活動公告管理" };

const STATUS_LABEL: Record<string, string> = { draft: "草稿", published: "已發布" };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, slug, description, body_markdown, event_date, event_time, location, poster_image_url, status",
    )
    .order("event_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">活動公告管理</h1>
        <EventFormDialog trigger={<Button>新增活動</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>活動名稱</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>地點</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(events ?? []).map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>
                {event.event_date}
                {event.event_time ? `　${event.event_time}` : ""}
              </TableCell>
              <TableCell className="text-muted-foreground">{event.location}</TableCell>
              <TableCell>
                <Badge variant={event.status === "published" ? "default" : "secondary"}>
                  {STATUS_LABEL[event.status]}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <EventFormDialog
                  event={event}
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
