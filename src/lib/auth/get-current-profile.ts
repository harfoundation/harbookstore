import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  displayName: string | null;
  role: "member" | "admin" | "committee" | "instructor" | "partner";
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    displayName: profile?.display_name ?? null,
    role: (profile?.role as CurrentProfile["role"]) ?? "member",
  };
}

export function isStaffRole(role: CurrentProfile["role"] | undefined) {
  return role === "admin" || role === "committee" || role === "instructor";
}
