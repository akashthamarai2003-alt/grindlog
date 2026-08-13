import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(query + " exercise tutorial short");
    
    // Simulate browser request to avoid 403s
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      next: { revalidate: 86400 } // Cache for 24 hours to avoid rate limiting
    });

    if (!res.ok) {
      throw new Error(`YouTube responded with ${res.status}`);
    }

    const text = await res.text();
    // YouTube's internal state usually contains videoId
    const match = text.match(/"videoId":"([^"]{11})"/);

    if (match) {
      return NextResponse.json({ videoId: match[1] });
    } else {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("YouTube scraper error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
