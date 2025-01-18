import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    stats?: {
      totalSessions: number;
      totalMinutes: number;
      preferredModes: Record<string, number>;
      lastSession: Date | null;
    };
  }
}