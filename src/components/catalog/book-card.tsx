import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_LABEL: Record<string, string> = {
  available: "現貨",
  preorder: "預購中",
  out_of_stock: "缺貨",
  discontinued: "已下架",
};

export function BookCard({
  book,
}: {
  book: {
    id: string;
    title: string;
    author: string | null;
    price_cents: number | null;
    procurement_status: string;
    poster_number: number | null;
  };
}) {
  return (
    <Link href={`/catalog/${book.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{book.title}</CardTitle>
            {book.poster_number && (
              <span className="text-muted-foreground shrink-0 text-xs">
                #{book.poster_number}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {book.author && <p className="text-muted-foreground text-sm">{book.author}</p>}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {book.price_cents != null
                ? `AUD $${(book.price_cents / 100).toFixed(2)}`
                : "價格待定"}
            </span>
            <Badge
              variant={book.procurement_status === "available" ? "default" : "secondary"}
            >
              {STATUS_LABEL[book.procurement_status] ?? book.procurement_status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
