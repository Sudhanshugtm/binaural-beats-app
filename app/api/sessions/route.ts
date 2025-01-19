import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { duration, mode, frequency, noiseType } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    // Find user and update their stats
    const user = await users.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const sessionData = {
      _id: new ObjectId(),
      userId: user._id,
      duration,
      mode,
      frequency,
      noiseType,
      startedAt: new Date(),
    };

    // Update user stats
    await users.updateOne(
      { _id: user._id },
      {
        $push: { sessions: sessionData },
        $inc: { 
          "stats.totalSessions": 1,
          "stats.totalMinutes": Math.floor(duration / 60)
        },
        $set: { "stats.lastSession": new Date() },
        $inc: { [`stats.preferredModes.${mode}`]: 1 }
      }
    );

    return NextResponse.json(
      { message: "Session saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "Error saving session" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const user = await users.findOne(
      { email: session.user.email },
      { 
        projection: { 
          stats: 1,
          sessions: { 
            $slice: -5  // Get only the last 5 sessions
          }
        }
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}