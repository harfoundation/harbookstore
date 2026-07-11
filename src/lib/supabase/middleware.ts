import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: this call refreshes the session — do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStaff = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isStaff = !!profile && ["admin", "committee", "instructor"].includes(profile.role);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (!isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = "/articles/write";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Soft-launch gate: everything except a small allowlist is staff-only for
  // now — non-staff visitors only see the login/signup flow and the handful
  // of pages surfaced in the header nav for them (see PUBLIC_NAV_HREFS in
  // site-header.tsx, which must stay in sync with this list).
  // Remove this block once the rest of the site is ready to go fully public.
  const PUBLIC_ALLOWED_PATHS = [
    "/login",
    "/signup",
    "/branches",
    "/join",
    "/reading-shares",
    "/cart",
    "/checkout",
    "/auth/callback",
    "/robots.txt",
    "/sitemap.xml",
  ];
  const PUBLIC_ALLOWED_PREFIXES = ["/articles", "/catalog", "/categories"];
  const isPublicPath =
    PUBLIC_ALLOWED_PATHS.includes(request.nextUrl.pathname) ||
    PUBLIC_ALLOWED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isStaff && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/articles/write";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
