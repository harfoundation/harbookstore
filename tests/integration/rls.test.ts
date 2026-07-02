import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * These tests hit a real local Supabase instance (`supabase start`) — RLS
 * policies cannot be verified against mocks, since the whole point is
 * Postgres-enforced row visibility. Run `pnpm db:reset` first if data from a
 * previous run is stale.
 */
const skip = !ANON_KEY || !SERVICE_ROLE_KEY;

async function createTestUser(admin: SupabaseClient<Database>, email: string) {
  const password = "TestPass123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY);
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return { client, userId: data.user!.id };
}

describe.skipIf(skip)("RLS policies", () => {
  let admin: SupabaseClient<Database>;
  let anon: SupabaseClient<Database>;
  let userA: { client: SupabaseClient<Database>; userId: string };
  let userB: { client: SupabaseClient<Database>; userId: string };
  let bookId: string;
  let orderAId: string;

  beforeAll(async () => {
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    anon = createClient<Database>(SUPABASE_URL, ANON_KEY);

    const suffix = Date.now();
    userA = await createTestUser(admin, `rls-test-a-${suffix}@example.com`);
    userB = await createTestUser(admin, `rls-test-b-${suffix}@example.com`);

    const { data: book } = await admin
      .from("books")
      .insert({ title: `RLS test book ${suffix}`, price_cents: 1000, is_active: true })
      .select("id")
      .single();
    bookId = book!.id;

    const { data: order } = await userA.client
      .from("orders")
      .insert({ buyer_id: userA.userId, order_type: "retail" })
      .select("id")
      .single();
    orderAId = order!.id;
  });

  it("owner can read their own order", async () => {
    const { data, error } = await userA.client
      .from("orders")
      .select("id")
      .eq("id", orderAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("a different authenticated user cannot read another user's order", async () => {
    const { data, error } = await userB.client
      .from("orders")
      .select("id")
      .eq("id", orderAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anon cannot read any orders", async () => {
    const { data, error } = await anon.from("orders").select("id").eq("id", orderAId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("a non-admin owner cannot self-confirm payment on their own order", async () => {
    const { error } = await userA.client
      .from("orders")
      .update({ status: "confirmed", payment_received_at: new Date().toISOString() })
      .eq("id", orderAId);
    // Blocked either by the RLS UPDATE policy or the column-protection trigger.
    expect(error).not.toBeNull();

    const { data: check } = await admin
      .from("orders")
      .select("status")
      .eq("id", orderAId)
      .single();
    expect(check?.status).toBe("pending_review");
  });

  it("admin can confirm payment on any order", async () => {
    const { error } = await admin
      .from("orders")
      .update({ status: "confirmed", payment_received_at: new Date().toISOString() })
      .eq("id", orderAId);
    expect(error).toBeNull();

    const { data: check } = await admin
      .from("orders")
      .select("status")
      .eq("id", orderAId)
      .single();
    expect(check?.status).toBe("confirmed");
  });

  it("anon can submit a reader question but cannot read any reader questions", async () => {
    const { error: insertError } = await anon
      .from("reader_questions")
      .insert({ question_body: "RLS test question", is_anonymous: true });
    expect(insertError).toBeNull();

    const { data, error } = await anon.from("reader_questions").select("id");
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("public_answered_questions view never exposes submitter_id or display_name", async () => {
    const { data, error } = await anon
      .from("public_answered_questions")
      .select("*")
      .limit(1);
    expect(error).toBeNull();
    if (data && data.length > 0) {
      expect(data[0]).not.toHaveProperty("submitter_id");
      expect(data[0]).not.toHaveProperty("submitter_display_name");
    }
  });

  it("owner can request to borrow a book and read their own request", async () => {
    const { data: request, error } = await userA.client
      .from("borrow_requests")
      .insert({ requester_id: userA.userId, book_id: bookId })
      .select("id")
      .single();
    expect(error).toBeNull();

    const { data: check } = await userB.client
      .from("borrow_requests")
      .select("id")
      .eq("id", request!.id);
    expect(check).toHaveLength(0);
  });

  it("non-admin cannot approve their own borrow request", async () => {
    const { data: request } = await userA.client
      .from("borrow_requests")
      .insert({ requester_id: userA.userId, book_id: bookId })
      .select("id")
      .single();

    const { error } = await userA.client
      .from("borrow_requests")
      .update({ status: "approved" })
      .eq("id", request!.id);
    expect(error).not.toBeNull();
  });
});

describe.skipIf(skip)("Partner submission workflow", () => {
  let admin: SupabaseClient<Database>;
  let partner: { client: SupabaseClient<Database>; userId: string };
  let otherPartner: { client: SupabaseClient<Database>; userId: string };
  let member: { client: SupabaseClient<Database>; userId: string };

  beforeAll(async () => {
    admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const suffix = Date.now();
    partner = await createTestUser(admin, `rls-partner-a-${suffix}@example.com`);
    otherPartner = await createTestUser(admin, `rls-partner-b-${suffix}@example.com`);
    member = await createTestUser(admin, `rls-member-${suffix}@example.com`);

    await admin.from("profiles").update({ role: "partner" }).eq("id", partner.userId);
    await admin
      .from("profiles")
      .update({ role: "partner" })
      .eq("id", otherPartner.userId);
  });

  it("a plain member cannot submit a book", async () => {
    const { error } = await member.client
      .from("books")
      .insert({ title: "member-submitted book should fail" });
    expect(error).not.toBeNull();
  });

  it("a partner can submit their own book as pending_review/inactive", async () => {
    const { data, error } = await partner.client
      .from("books")
      .insert({
        title: "partner book",
        submitted_by: partner.userId,
        approval_status: "pending_review",
        is_active: false,
      })
      .select("id, approval_status, is_active")
      .single();
    expect(error).toBeNull();
    expect(data?.approval_status).toBe("pending_review");
    expect(data?.is_active).toBe(false);
  });

  it("a partner cannot self-approve or self-activate their own submission", async () => {
    const { data: book } = await partner.client
      .from("books")
      .insert({
        title: "partner book to self-approve",
        submitted_by: partner.userId,
        approval_status: "pending_review",
        is_active: false,
      })
      .select("id")
      .single();

    const { error } = await partner.client
      .from("books")
      .update({ approval_status: "approved", is_active: true })
      .eq("id", book!.id);
    expect(error).not.toBeNull();

    const { data: check } = await admin
      .from("books")
      .select("approval_status, is_active")
      .eq("id", book!.id)
      .single();
    expect(check?.approval_status).toBe("pending_review");
    expect(check?.is_active).toBe(false);
  });

  it("a different partner cannot see another partner's pending submission", async () => {
    const { data: book } = await partner.client
      .from("books")
      .insert({
        title: "partner book visibility check",
        submitted_by: partner.userId,
        approval_status: "pending_review",
        is_active: false,
      })
      .select("id")
      .single();

    const { data: check } = await otherPartner.client
      .from("books")
      .select("id")
      .eq("id", book!.id);
    expect(check).toHaveLength(0);
  });

  it("admin can approve a partner's submission", async () => {
    const { data: book } = await partner.client
      .from("books")
      .insert({
        title: "partner book admin approves",
        submitted_by: partner.userId,
        approval_status: "pending_review",
        is_active: false,
      })
      .select("id")
      .single();

    const { error } = await admin
      .from("books")
      .update({ approval_status: "approved", is_active: true })
      .eq("id", book!.id);
    expect(error).toBeNull();

    const { data: check } = await admin
      .from("books")
      .select("approval_status, is_active")
      .eq("id", book!.id)
      .single();
    expect(check?.approval_status).toBe("approved");
    expect(check?.is_active).toBe(true);
  });
});
