export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/"; // Default to Fitness dashboard

  // Prevent open redirects (external URLs or protocol-relative URLs)
  if (redirect.startsWith("http://") || redirect.startsWith("https://") || redirect.startsWith("//") || !redirect.startsWith("/")) {
    return "/";
  }

  // Allowed safe internal base paths
  const allowedBasePaths = [
    "/",
    "/profile"
  ];

  const isAllowed = allowedBasePaths.some(p => redirect === p || redirect.startsWith(p + "/"));
  
  if (isAllowed) {
    return redirect;
  }
  
  return "/";
}
