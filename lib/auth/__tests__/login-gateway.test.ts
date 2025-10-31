import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLoginGateway } from "../login-gateway";

describe("login gateway", () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ALLOWLISTED_LOGIN_EMAIL = "owner@example.com";
  });

  it("rejects non-allowlisted email", async () => {
    const gateway = createLoginGateway(() => mockSupabase, async () => "device");
    const result = await gateway.handle({
      email: "intruder@example.com",
      password: "pw",
      ip: "1.1.1.1",
      userAgent: "ua",
    });
    expect(result.status).toBe(401);
    expect(result.error?.message).toMatch(/not authorized/i);
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("allows allowlisted email and forwards to supabase", async () => {
    const gateway = createLoginGateway(() => mockSupabase, async () => "device");
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    const result = await gateway.handle({
      email: "owner@example.com",
      password: "pw",
      ip: "1.1.1.1",
      userAgent: "ua",
    });
    expect(result.error).toBeNull();
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "pw",
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("auth_attempts");
  });
});
