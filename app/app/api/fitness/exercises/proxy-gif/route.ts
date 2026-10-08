import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".gif", ".png", ".jpg", ".webp"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path || typeof path !== "string") {
      return new NextResponse("Missing path parameter", { status: 400 });
    }

    // Safety checks against directory traversal
    if (path.includes("..") || path.startsWith("/") || path.startsWith("\\")) {
      return new NextResponse("Invalid path parameter", { status: 400 });
    }

    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      return new NextResponse("Invalid file extension", { status: 400 });
    }

    // Candidate sources for reliable streaming
    const candidateUrls = [
      `https://fastly.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/${path}`,
      `https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/${path}`,
      `https://raw.githubusercontent.com/JahelCuadrado/ExerciseGymGifsDB/main/${path}`,
    ];

    for (const url of candidateUrls) {
      try {
        const upstreamRes = await fetch(url, {
          headers: {
            "User-Agent": "GrindLog-Exercise-Service/1.0",
          },
        });

        if (upstreamRes.ok) {
          const contentType = upstreamRes.headers.get("content-type") || "image/gif";
          const arrayBuffer = await upstreamRes.arrayBuffer();

          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch {
        // Try next candidate
      }
    }

    return new NextResponse("Exercise animation not found", { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new NextResponse(message, { status: 500 });
  }
}
