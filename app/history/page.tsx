import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Session History</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Delta (Sleep) Session</CardTitle>
              <p className="text-sm text-gray-500">Today at 2:30 PM • 20 minutes</p>
            </CardHeader>
            <CardContent>
              <p>Base Frequency: 100 Hz • Beat Frequency: 2 Hz</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alpha (Relaxation) Session</CardTitle>
              <p className="text-sm text-gray-500">Yesterday at 10:00 AM • 15 minutes</p>
            </CardHeader>
            <CardContent>
              <p>Base Frequency: 300 Hz • Beat Frequency: 10 Hz</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

