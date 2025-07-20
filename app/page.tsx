import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirigir automáticamente al login como página de inicio
  redirect('/login')
}
