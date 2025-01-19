import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Insert new user with initialized session stats
    const result = await users.insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      sessions: [],
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        preferredModes: {},
        lastSession: null,
      }
    });

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}