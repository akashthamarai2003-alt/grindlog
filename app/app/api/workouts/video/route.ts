import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    // Remove anything in parentheses (e.g. "(using a bench or chair)") to improve search match rate
    const sanitizedQuery = query.replace(/\s*\(.*?\)\s*/g, '').trim();
    const url = `https://oss.exercisedb.dev/api/v1/exercises?name=${encodeURIComponent(sanitizedQuery)}`;
    
    const res = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error(`ExerciseDB responded with ${res.status}`);
    }

    const json = await res.json();
    
    if (json.data && json.data.length > 0) {
      // Find the exact match or the first one
      const exactMatch = json.data.find((ex: any) => ex.name.toLowerCase() === sanitizedQuery.toLowerCase());
      const bestMatch = exactMatch || json.data[0];
      
      return NextResponse.json({ gifUrl: bestMatch.gifUrl });
    } else {
      return NextResponse.json({ error: "Exercise not found in database" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("ExerciseDB fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
