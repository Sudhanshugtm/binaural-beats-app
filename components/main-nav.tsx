import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function MainNav() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">Binaural Beats</Link>
        <nav className="flex items-center gap-4">
          <Link href="/player">
            <Button variant="ghost">Player</Button>
          </Link>
          <Link href="/favorites">
            <Button variant="ghost">Favorites</Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}

