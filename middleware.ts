import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRoutes, protectedRoutes } from "./app/components/Router/routes";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const currentUser = request.cookies.get("user-token");

    if (pathname.startsWith("/_next") || pathname.includes("/api/") || PUBLIC_FILE.test(pathname)) {
        return;
    }

    const authPathnameRegex = new RegExp(
        `^(${authRoutes
            .map((route) => (route.includes("[") ? route.replace(/\[.*?\]/g, "[^/]+") : route))
            .join("|")})/?$`,
        "i"
    );

    const protectedPathnameRegex = new RegExp(
        `^(${protectedRoutes
            .map((route) => (route.includes("[") ? route.replace(/\[.*?\]/g, "[^/]+") : route))
            .join("|")})/?$`,
        "i"
    );

    //   const authPathnameRegex = new RegExp(`^(/(${i18n.locales.join("|")}))?(${authRoutes.map((route) => (route.includes("[") ? route.replace(/\[.*?\]/g, "[^/]+") : route)).join("|")})/?$`, "i");

    //   const protectedPathnameRegex = new RegExp(`^(/(${i18n.locales.join("|")}))?(${protectedRoutes.map((route) => (route.includes("[") ? route.replace(/\[.*?\]/g, "[^/]+") : route)).join("|")})/?$`, "i");
    //   const locale = getLocale(request);

    if (protectedPathnameRegex.test(pathname) && !currentUser?.value) {
        request.cookies.delete("user-token");
        const response = NextResponse.redirect(new URL("/", request.url));
        return response;
    }

    if (authPathnameRegex.test(pathname) && currentUser) {
        return NextResponse.redirect(new URL(request.url));
    }

}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};