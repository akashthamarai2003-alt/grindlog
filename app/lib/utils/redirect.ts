export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/fitness/workout"; // Default to Fitness workout

  // Prevent open redirects (external URLs or protocol-relative URLs)
  if (redirect.startsWith("http://") || redirect.startsWith("https://") || redirect.startsWith("//") || !redirect.startsWith("/")) {
    return "/fitness/workout";
  }

  // Allowed safe internal base paths
  const allowedBasePaths = [
    "/fitness",
    "/profile"
  ];

  const isAllowed = allowedBasePaths.some(p => redirect === p || redirect.startsWith(p + "/"));
  
  if (isAllowed) {
    return redirect;
  }
  
  return "/dashboard";
}
