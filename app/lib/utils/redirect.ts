export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/dashboard"; // Default to GrindLog dashboard

  // Prevent open redirects (external URLs or protocol-relative URLs)
  if (redirect.startsWith("http://") || redirect.startsWith("https://") || redirect.startsWith("//") || !redirect.startsWith("/")) {
    return "/dashboard";
  }

  // Allowed safe internal base paths
  const allowedBasePaths = [
    "/dashboard",
    "/app",
    "/fitness",
    "/calendar",
    "/habits",
    "/quests",
    "/store",
    "/profile"
  ];

  const isAllowed = allowedBasePaths.some(p => redirect === p || redirect.startsWith(p + "/"));
  
  if (isAllowed) {
    return redirect;
  }
  
  return "/dashboard";
}
