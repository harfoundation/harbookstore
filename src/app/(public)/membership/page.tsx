import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { MembershipRegisterButton } from "@/components/membership-register-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "會員登記" };

export default async function MembershipPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: settings } = await supabase
    .from("membership_fee_settings")
    .select("fee_cents, currency, usage_note")
    .single();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">會員登記</h1>
        <p className="text-muted-foreground mt-1">
          {settings?.fee_cents != null
            ? `會員年費：${settings.currency} $${(settings.fee_cents / 100).toFixed(2)} ／ 年`
            : "會員年費尚未公布，請洽詢我們。"}
        </p>
      </div>

      {settings?.usage_note && (
        <div className="space-y-1.5">
          <h2 className="font-semibold">費用用途說明</h2>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {settings.usage_note}
          </p>
        </div>
      )}

      <MembershipRegisterButton isLoggedIn={!!profile} />
    </div>
  );
}
