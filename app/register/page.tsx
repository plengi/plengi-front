"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chrome, Eye, EyeOff, Facebook } from "lucide-react";
import apiClient from "@/app/api/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  // -------------------------
  // Estados
  // -------------------------
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------
  // Validación
  // -------------------------
  const validateForm = () => {
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "El nombre es obligatorio",
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "El correo electrónico es obligatorio",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "El correo electrónico no es válido",
      });
      return false;
    }

    if (password.length < 5) {
      toast({
        variant: "destructive",
        title: "Contraseña inválida",
        description: "Debe tener al menos 5 caracteres",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
      });
      return false;
    }

    return true;
  };

  // -------------------------
  // Envío
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiClient.post("/register", {
        username,
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast({
        variant: "success",
        title: "Registro exitoso",
        description: "Usuario registrado correctamente",
      });

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      router.push("/login");
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;

        if (errors) {
          const firstError = Object.values(errors)[0] as string[];
          toast({
            variant: "destructive",
            title: "Error de validación",
            description: firstError[0],
          });
        } else {
          toast({
            variant: "destructive",
            title: "Datos inválidos",
            description: "Revisa tu información",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error del servidor",
          description: "No se pudo registrar el usuario",
        });
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
          <h2 className="text-4xl font-bold mb-2">
            Únete a Nuestra Plataforma
          </h2>
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
                <Label htmlFor="username">Nombre Completo</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                />
              </div>

              {/* PASSWORD */}
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 border-dollar-300 focus:border-dollar-500 focus:ring-dollar-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-dollar-600 hover:bg-dollar-700 text-white"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            {/* Divider */}
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
                className="border-dollar-300 text-dollar-700 hover:bg-dollar-100"
                onClick={() =>
                  toast({
                    title: "Próximamente",
                    description: "Registro con Google disponible pronto 😎",
                  })
                }
              >
                <Chrome className="h-4 w-4 mr-2" /> Google
              </Button>

              <Button
                variant="outline"
                className="border-dollar-300 text-dollar-700 hover:bg-dollar-100"
                onClick={() =>
                  toast({
                    title: "Próximamente",
                    description: "Registro con Facebook disponible pronto 😎",
                  })
                }
              >
                <Facebook className="h-4 w-4 mr-2" /> Facebook
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-center text-sm text-dollar-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline text-dollar-700">
              Iniciar Sesión
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}
