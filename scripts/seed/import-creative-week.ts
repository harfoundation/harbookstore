/**
 * Idempotent upsert of the "山書坊創意文化周 · HAR Creative Week 2026" event
 * (14–19 Sep 2026) into the `events` table, so it shows on the homepage
 * (近期活動) and /events. Transcribed from the printed "Program at a Glance"
 * poster; the poster image lives at public/events/har-creative-week-2026.jpg.
 *
 * Re-run any time to sync copy changes — it matches on the unique `slug`.
 *
 * Usage: pnpm db:seed:creative-week
 *   Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *   To target production without editing .env.local, drop the prod values in
 *   .env.production.local (e.g. `vercel env pull .env.production.local
 *   --environment=production`) — it is gitignored and overrides .env.local here.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
config({ path: path.join(root, ".env.local") });
const prodEnv = path.join(root, ".env.production.local");
if (existsSync(prodEnv)) {
  config({ path: prodEnv, override: true });
  console.log("Using overrides from .env.production.local");
}

const meta: {
  slug: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  poster_image_url: string;
  status: "draft" | "published";
} = JSON.parse(
  readFileSync(path.join(__dirname, "creative-week-2026.json"), "utf-8"),
);

const bodyMarkdown = readFileSync(
  path.join(__dirname, "creative-week-2026.md"),
  "utf-8",
).trim();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { error } = await supabase.from("events").upsert(
    {
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      body_markdown: bodyMarkdown,
      event_date: meta.event_date,
      event_time: meta.event_time,
      location: meta.location,
      poster_image_url: meta.poster_image_url,
      status: meta.status,
    },
    { onConflict: "slug" },
  );

  if (error) {
    console.error("Failed to upsert event:", error.message);
    process.exit(1);
  }

  console.log(
    `Done. Event "${meta.title}" is ${meta.status} at /events/${meta.slug}.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
