/**
 * Idempotent import of congregations + their standing roster (regular
 * attendees) from a structured JSON file, transcribed from the paper
 * "主日/下午崇拜出席表" sign-in sheets. Names marked "（?）" were hard to
 * read in the source photo — staff should verify these via
 * /admin/congregations before relying on the roster operationally.
 *
 * Usage: pnpm db:seed:attendance
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

type RosterJson = {
  congregations: Array<{
    name: string;
    servicePeriod: "morning" | "afternoon" | "evening";
    sortOrder: number;
    roster: string[];
  }>;
};

const data: RosterJson = JSON.parse(
  readFileSync(path.join(__dirname, "attendance-roster.json"), "utf-8"),
);

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
  for (const cong of data.congregations) {
    const { data: existing } = await supabase
      .from("congregations")
      .select("id")
      .eq("name", cong.name)
      .maybeSingle();

    let congregationId: string;
    if (existing) {
      congregationId = existing.id;
      await supabase
        .from("congregations")
        .update({ service_period: cong.servicePeriod, sort_order: cong.sortOrder })
        .eq("id", congregationId);
      console.log(`Updated congregation "${cong.name}" (${congregationId})`);
    } else {
      const { data: created, error } = await supabase
        .from("congregations")
        .insert({
          name: cong.name,
          service_period: cong.servicePeriod,
          sort_order: cong.sortOrder,
        })
        .select("id")
        .single();
      if (error) throw error;
      congregationId = created.id;
      console.log(`Created congregation "${cong.name}" (${congregationId})`);
    }

    for (let i = 0; i < cong.roster.length; i++) {
      const displayName = cong.roster[i];
      const { data: existingMember } = await supabase
        .from("congregation_members")
        .select("id")
        .eq("congregation_id", congregationId)
        .eq("display_name", displayName)
        .maybeSingle();

      if (existingMember) continue;

      const { error } = await supabase.from("congregation_members").insert({
        congregation_id: congregationId,
        display_name: displayName,
        sort_order: i + 1,
      });
      if (error) throw error;
    }
    console.log(`  Roster: ${cong.roster.length} people`);
  }

  console.log(
    "Done. Names marked（?）were hard to read in the source photo — please verify via /admin/congregations.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
