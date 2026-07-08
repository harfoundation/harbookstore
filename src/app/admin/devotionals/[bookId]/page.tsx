import { notFound } from "next/navigation";
import Link from "next/link";
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
import { DevotionalVolumeFormDialog } from "@/components/admin/devotional-volume-form-dialog";
import { DevotionalBookFormDialog } from "@/components/admin/devotional-book-form-dialog";

export const dynamic = "force-dynamic";

const ENTRY_STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已發布",
  scheduled: "排程中",
};

export default async function AdminDevotionalBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select(
      "id, slug, title_zh, title_en, author_name, author_bio_markdown, declaration_markdown, preface_markdown, afterword_markdown, topic_index, status",
    )
    .eq("id", bookId)
    .single();

  if (!book) notFound();

  const { data: volumes } = await supabase
    .from("devotional_volumes")
    .select(
      "id, volume_number, title_zh, subtitle_zh, intro_markdown, devotional_entries(id, entry_number, title, status)",
    )
    .eq("book_id", bookId)
    .order("volume_number");

  const maxVolumeNumber = (volumes ?? []).reduce(
    (max, v) => Math.max(max, v.volume_number),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{book.title_zh}</h1>
          {book.author_name && (
            <p className="text-muted-foreground text-sm">作者：{book.author_name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <DevotionalBookFormDialog
            book={book}
            trigger={<Button variant="outline">編輯書籍（序言／聲明／後記等）</Button>}
          />
          <Button variant="outline" render={<Link href={`/devotionals/${book.slug}`} />}>
            預覽書籍
          </Button>
          <Button
            variant="outline"
            render={<a href={`/api/admin/devotionals/${bookId}/epub`} />}
          >
            下載 EPUB
          </Button>
          <DevotionalVolumeFormDialog
            bookId={bookId}
            nextVolumeNumber={maxVolumeNumber + 1}
            trigger={<Button variant="outline">新增卷次</Button>}
          />
          <Button render={<Link href={`/admin/devotionals/${bookId}/entries/new`} />}>
            新增篇章
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {(volumes ?? []).map((volume) => {
          const entries = (
            volume.devotional_entries as unknown as {
              id: string;
              entry_number: number;
              title: string;
              status: string;
            }[]
          ).sort((a, b) => a.entry_number - b.entry_number);

          return (
            <div key={volume.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  第{volume.volume_number}卷　{volume.title_zh}
                </h2>
                <DevotionalVolumeFormDialog
                  bookId={bookId}
                  volume={volume}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯卷次
                    </Button>
                  }
                />
              </div>
              {entries.length === 0 ? (
                <p className="text-muted-foreground text-sm">此卷尚無篇章。</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>編號</TableHead>
                      <TableHead>標題</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.entry_number}</TableCell>
                        <TableCell>{entry.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.status === "published" ? "default" : "secondary"
                            }
                          >
                            {ENTRY_STATUS_LABEL[entry.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            render={
                              <Link
                                href={`/devotionals/${book.slug}/${entry.entry_number}`}
                              />
                            }
                            variant="outline"
                            size="sm"
                          >
                            預覽
                          </Button>
                          <Button
                            render={
                              <Link
                                href={`/admin/devotionals/${bookId}/entries/${entry.id}/preview-ppt`}
                              />
                            }
                            variant="outline"
                            size="sm"
                          >
                            預覽 PPT
                          </Button>
                          <Button
                            render={
                              <a
                                href={`/api/admin/devotionals/${bookId}/entries/${entry.id}/pptx`}
                              />
                            }
                            variant="outline"
                            size="sm"
                          >
                            下載 PPT
                          </Button>
                          <Button
                            render={
                              <Link
                                href={`/admin/devotionals/${bookId}/entries/${entry.id}`}
                              />
                            }
                            variant="outline"
                            size="sm"
                          >
                            編輯
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
