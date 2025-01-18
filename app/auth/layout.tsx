export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-[350px] space-y-6">
        {children}
      </div>
    </div>
  )
}