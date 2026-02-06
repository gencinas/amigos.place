import { Plane } from 'lucide-react'

export function EmptyTrips() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Plane className="w-12 h-12 text-muted-foreground mb-3" />
      <p className="font-medium text-muted-foreground">No tenés viajes todavía</p>
      <p className="text-sm text-muted-foreground/70">
        Buscá amigos que te puedan recibir y pediles alojamiento
      </p>
    </div>
  )
}
