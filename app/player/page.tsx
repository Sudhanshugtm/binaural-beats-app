import dynamic from 'next/dynamic'

const ProductivityBinauralPlayer = dynamic(
  () => import('@/components/ProductivityBinauralPlayer'),
  { ssr: false }
)

export default function PlayerPage() {
  return <ProductivityBinauralPlayer />
}