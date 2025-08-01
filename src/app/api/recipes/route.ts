import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  note?: string;
}

interface RecipeInput {
  name: string;
  cuisine?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  difficulty?: string;
  dietary_tags?: string[];
  ingredients?: Ingredient[];
  steps?: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipe: RecipeInput | undefined = body?.output?.recipe;

    if (!recipe) {
      return NextResponse.json({ error: 'No recipe found in request' }, { status: 400 });
    }

    const savedRecipe = await prisma.recipe.create({
      data: {
        name: recipe.name,
        cuisine: recipe.cuisine || null,
        prepTime: recipe.prep_time_minutes || null,
        cookTime: recipe.cook_time_minutes || null,
        difficulty: recipe.difficulty || null,
        dietaryTags: recipe.dietary_tags || [],
        ingredients: recipe.ingredients as unknown as Prisma.InputJsonValue, // ✅ fix type error
        steps: recipe.steps || []
      }
    });

    return NextResponse.json(savedRecipe);

  } catch (error) {
    console.error('Error in recipe route:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
