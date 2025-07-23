"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Chrome, Facebook } from "lucide-react"
import Link from "next/link" // Import Link for navigation

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }
    // Aquí iría la lógica de registro real
    console.log("Nombre:", name)
    console.log("Email:", email)
    console.log("Contraseña:", password)
    alert("Intento de registro. Revisa la consola para ver los datos.")
  }

  const handleGoogleRegister = () => {
    console.log("Registrarse con Google")
    alert("Simulando registro con Google.")
  }

  const handleFacebookRegister = () => {
    console.log("Registrarse con Facebook")
    alert("Simulando registro con Facebook.")
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Sección izquierda: Imagen y texto alusivo */}
      <div className="relative hidden lg:flex items-center justify-center bg-dollar-900 p-8">
        <Image
          src="/images/construction-site.png" // Usando la misma imagen
          alt="Construcción de Obra de Ingeniería Civil"
          width={800}
          height={600}
          className="object-cover rounded-lg shadow-2xl"
          priority // Carga la imagen con prioridad
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dollar-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white text-left">
          <h2 className="text-4xl font-bold mb-2">Únete a Nuestra Plataforma</h2>
          <p className="text-lg">Comienza a optimizar tus proyectos de ingeniería hoy mismo.</p>
        </div>
      </div>

      {/* Sección derecha: Formulario de registro */}
      <div className="flex items-center justify-center p-4 bg-dollar-50">
        <Card className="w-full max-w-md shadow-xl border-dollar-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-dollar-800">Crear Cuenta</CardTitle>
            <CardDescription className="text-dollar-600">
              Ingresa tus datos para crear una nueva cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu Nombre"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="miejemplo@dominio.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>
              <Button type="submit" className="w-full bg-dollar-600 hover:bg-dollar-700 text-white font-semibold">
                Registrarse
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-dollar-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dollar-50 px-2 text-dollar-500">O regístrate con</span>
              </div>
            </div>

            {/* Botones de registro social */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-dollar-300 text-dollar-700 hover:bg-dollar-100 bg-transparent"
                onClick={handleGoogleRegister}
              >
                <Chrome className="h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-dollar-300 text-dollar-700 hover:bg-dollar-100 bg-transparent"
                onClick={handleFacebookRegister}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center text-sm text-dollar-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline text-dollar-700 hover:text-dollar-800 font-medium">
              Iniciar Sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
