import type React from "react"
import type { Metadata } from "next"
import { TreeProvider } from "@/lib/tree-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Visualizador de Árvores",
  description: "Sistema educativo para visualizar estruturas de dados de árvores",
  generator: "Visualizador de Árvores",
  icons: {
    icon: "/tree-icon.svg",
    shortcut: "/tree-icon.svg",
    apple: "/tree-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TreeProvider>{children}</TreeProvider>
      </body>
    </html>
  )
}
