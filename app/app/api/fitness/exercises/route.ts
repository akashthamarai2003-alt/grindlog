import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(req.url);
    
    const query = searchParams.get("q") || "";
    const muscle = searchParams.get("muscle");
    const equipment = searchParams.get("equipment");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let dbQuery = supabase
      .from("fitness_exercises_library")
      .select("*", { count: "exact" });

    if (query) {
      // Use full-text search on name, or simple ilike if no index
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    if (muscle && muscle !== "All") {
      dbQuery = dbQuery.eq("target_muscle", muscle);
    }

    if (equipment && equipment !== "All") {
      dbQuery = dbQuery.eq("equipment", equipment);
    }

    const { data: exercises, count, error } = await dbQuery
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      exercises, 
      total: count || 0,
      hasMore: count ? (offset + limit) < count : false
    });

  } catch (error: any) {
    console.error("GET exercises error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch exercises" }, { status: 500 });
  }
}
