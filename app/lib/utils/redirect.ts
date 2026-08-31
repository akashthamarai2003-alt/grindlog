export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/";

  // Prevent open redirects (external URLs or protocol-relative URLs).
  if (
    redirect.startsWith("http://") ||
    redirect.startsWith("https://") ||
    redirect.startsWith("//") ||
    !redirect.startsWith("/")
  ) {
    return "/";
  }

  // `/fitness` was the old route-group prefix. Route groups do not appear in
  // production URLs, so retain compatibility with existing auth/payment links
  // while sending users to the current public path.
  const normalizedRedirect = redirect === "/fitness"
    ? "/"
    : redirect.startsWith("/fitness/")
      ? redirect.slice("/fitness".length)
      : redirect;

  let parsed: URL;
  try {
    parsed = new URL(normalizedRedirect, "https://grindlog.internal");
  } catch {
    return "/";
  }

  if (parsed.origin !== "https://grindlog.internal") {
    return "/";
  }

  // Only allow real in-app destinations. Payment is deliberately excluded so
  // a return link can never create a payment-page loop.
  const allowedBasePaths = [
    "/onboarding",
    "/report",
    "/plan-setup",
    "/roadmap",
    "/profile",
    "/workout",
    "/nutrition",
    "/diet",
    "/progress",
    "/scanner",
    "/coach",
    "/reminders",
    "/exercises",
    "/pro",
  ];

  const isAllowed = parsed.pathname === "/" || allowedBasePaths.some(
    (path) => parsed.pathname === path || parsed.pathname.startsWith(`${path}/`),
  );

  if (isAllowed) {
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  return "/";
}
