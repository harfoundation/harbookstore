import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <CartProvider>
      <SiteHeader
        user={
          profile
            ? { id: profile.id, email: profile.email, displayName: profile.displayName }
            : null
        }
        isStaff={isStaffRole(profile?.role)}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
