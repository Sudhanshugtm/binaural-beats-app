import { render, screen } from "@testing-library/react";
import { Header } from "../header";

vi.mock("@/components/AccessibilityProvider", () => ({
  useAccessibility: () => ({ announceToScreenReader: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }),
}));

describe("Header", () => {
  it("links Sign In CTA to /login", async () => {
    render(<Header />);
    const link = await screen.findByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
