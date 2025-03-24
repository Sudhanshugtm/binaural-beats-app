import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Binaural Beats App
        </h1>
        <p className="text-sm text-muted-foreground">
          This is a demo application - no registration needed!
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Link 
          className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2" 
          href="/player"
        >
          Go to Player
        </Link>
      </div>
    </div>
  )
}