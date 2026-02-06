import { Sofa } from 'lucide-react'

export function EmptyRequests() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Sofa className="w-12 h-12 text-muted-foreground mb-3" />
      <p className="font-medium text-muted-foreground">Todavía no tenés solicitudes</p>
      <p className="text-sm text-muted-foreground/70">
        Compartí tu perfil para que tus amigos te pidan alojamiento
      </p>
    </div>
  )
}
