import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Recipe } from "@/lib/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("title", { ascending: true })
      .limit(1000)

    if (error || !data || data.length === 0) {
      const { recipes } = await import("@/lib/data")
      return NextResponse.json(recipes)
    }

    const recipes: Recipe[] = data.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image || "",
      category: r.category as Recipe["category"],
      prepTime: r.prep_time,
      cookTime: r.cook_time,
      servings: r.servings,
      difficulty: r.difficulty as Recipe["difficulty"],
      counts: {
        lean: r.lean_count,
        green: r.green_count,
        fat: r.fat_count,
        condiment: r.condiment_count,
      },
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
      favoriteCount: r.favorite_count || 0,
    }))

    return NextResponse.json(recipes, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    })
  } catch {
    const { recipes } = await import("@/lib/data")
    return NextResponse.json(recipes)
  }
}
