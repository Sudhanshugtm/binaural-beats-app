import { NextResponse } from "next/server";

// This is a simplified mock implementation since we don't need real registration
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    // Simply return a success message - no actual user creation
    return NextResponse.json(
      { 
        message: "This is a demo app - no real registration is needed",
        demoUserId: "demo-user-123"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}