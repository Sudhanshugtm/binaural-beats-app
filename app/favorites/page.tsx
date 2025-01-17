import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from 'lucide-react'
import Link from "next/link"

export default function FavoritesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Favorite Presets</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deep Meditation</CardTitle>
              <p className="text-sm text-gray-500">Theta waves • 6 Hz</p>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p>Base: 200 Hz • Beat: 6 Hz</p>
              <Link href="/player?preset=meditation">
                <Button size="icon">
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Play preset</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Power Focus</CardTitle>
              <p className="text-sm text-gray-500">Beta waves • 20 Hz</p>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p>Base: 400 Hz • Beat: 20 Hz</p>
              <Link href="/player?preset=focus">
                <Button size="icon">
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Play preset</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

