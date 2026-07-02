import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test("signup, browse catalog, add to cart, and check out", async ({ page }) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("名稱").fill("E2E 測試用戶");
  await page.getByLabel("電郵").fill(uniqueEmail);
  await page.getByLabel("密碼").fill("TestPass123!");
  await page.getByRole("button", { name: "註冊", exact: true }).click();

  await expect(page.getByRole("button", { name: "E2E 測試用戶" })).toBeVisible({
    timeout: 10_000,
  });

  await page.goto("/catalog");
  await page.locator('a[href*="/catalog/"]').first().click();

  await page.getByRole("button", { name: "加入購物車" }).click();
  await expect(page.getByRole("button", { name: /購物車 \(1\)/ })).toBeVisible();

  await page.goto("/checkout");
  await page.getByRole("button", { name: "送出訂單" }).click();

  await expect(page).toHaveURL(/\/orders/);
  await expect(page.getByText(/HB-\d{8}-\d{4}/).first()).toBeVisible({ timeout: 10_000 });
});

test("submit a borrow request for a lendable book requires login", async ({ page }) => {
  // Test-owned fixture: mark one book lendable via the service role, rather
  // than depending on incidental seed/admin state (no book is lendable by
  // default — that's a real admin decision, not a test concern).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(!supabaseUrl || !serviceRoleKey, "Supabase service role key not available");

  const admin = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: book } = await admin
    .from("books")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .single();
  await admin.from("books").update({ is_lendable: true }).eq("id", book!.id);

  await page.goto("/lending");
  await page.getByRole("button", { name: "免費借閱" }).first().click();
  await expect(page.getByText("請先登入才能借閱")).toBeVisible();

  await admin.from("books").update({ is_lendable: false }).eq("id", book!.id);
});
