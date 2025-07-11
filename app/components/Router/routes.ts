export const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/[token]",
]
 
export const protectedRoutes: string[] = [
    "/settings",
    "/portfolio",
    "/profile",
    // "/cp/account/[id]/perp",
    // "/cp/account/[id]/spot",
]