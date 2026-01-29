"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chrome, Facebook } from "lucide-react";
import apiClient from "@/app/api/apiClient";
import { Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  // -------------------------
  // Estados del formulario
  // -------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // estado de carga

  // -------------------------
  // Envío del formulario
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // evita recarga de página

    // Validación básica en frontend
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true); // inicia loading

    try {
      // Llamada a la API 
      const response = await apiClient.post("/register", {
        name,
        email,
        password,
      });

      // Respuesta del backend
      console.log("Respuesta backend:", response.data);

      alert("Usuario registrado correctamente");

      // Limpia el formulario después del registro
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error registro:", error.response?.data || error.message);

      if (error.response?.status === 422) {
        alert("Error de validación. El correo ya puede existir.");
      } else {
        alert("Error al registrar usuario");
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center bg-dollar-900 p-8">
        <Image
          src="/images/construction-site.png"
          alt="Construcción de Obra de Ingeniería Civil"
          width={800}
          height={600}
          className="object-cover rounded-lg shadow-2xl"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dollar-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-4xl font-bold mb-2">Únete a Nuestra Plataforma</h2>
          <p className="text-lg">
            Comienza a optimizar tus proyectos de ingeniería hoy mismo.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 bg-dollar-50">
        <Card className="w-full max-w-md shadow-xl border-dollar-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-dollar-800">
              Crear Cuenta
            </CardTitle>
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
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-dollar-600 hover:bg-dollar-700 text-white"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-dollar-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dollar-50 px-2 text-dollar-500">
                  O regístrate con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert("Google próximamente")}
              >
                <Chrome className="h-4 w-4 mr-2" /> Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert("Facebook próximamente")}
              >
                <Facebook className="h-4 w-4 mr-2" /> Facebook
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-center text-sm text-dollar-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="underline text-dollar-700"
            >
              Iniciar Sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
