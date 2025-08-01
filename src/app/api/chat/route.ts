// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { marked } from "marked";

const uri = process.env.DATABASE_URL as string; 
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.message) {
      return NextResponse.json(
        { error: "Please provide a recipe name." },
        { status: 400 }
      );
    }

    // Call n8n webhook
    const n8nRes = await fetch(
      "https://sibwali.app.n8n.cloud/webhook/recipe-maker",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Prompt: body.message }),
      }
    );

    const rawData = await n8nRes.text();
    console.log("n8n Raw Response:", rawData);

    // Extract HTML from srcdoc if present
    const match = rawData.match(/srcdoc="([\s\S]*?)"/);
    let recipeHTML: string = match ? match[1] : rawData;

    // If not HTML, convert Markdown/plain text to HTML
    if (!/<[a-z][\s\S]*>/i.test(recipeHTML)) {
      recipeHTML = (await marked.parse(recipeHTML)) as string;
    }

    // Save to MongoDB
    await client.connect();
    const db = client.db("recipesDB");
    const collection = db.collection("recipes");
    const recipeDoc = {
      title: body.message,
      html: recipeHTML,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(recipeDoc);
    console.log("Recipe saved with ID:", result.insertedId);

    // Return HTML + saved ID
    return NextResponse.json({
      html: recipeHTML,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
