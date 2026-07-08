import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChurchRegistrationForm } from "@/components/churches/church-registration-form";

export const dynamic = "force-dynamic";

export default async function ChurchRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: church } = await supabase
    .from("churches")
    .select("id, slug, name_zh, is_active")
    .eq("slug", slug)
    .single();

  if (!church || !church.is_active) notFound();

  const { data: congregations } = await supabase
    .from("congregations")
    .select("id, name")
    .eq("church_id", church.id)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href={`/church/${church.slug}`} className="text-muted-foreground text-sm hover:underline">
          ← {church.name_zh}
        </Link>
        <h1 className="text-xl font-bold">新朋友／同工登記</h1>
      </div>
      <ChurchRegistrationForm churchId={church.id} congregations={congregations ?? []} />
    </div>
  );
}
