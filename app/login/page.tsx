"use client"

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import apiClient from '@/app/api/apiClient';
import { Chrome, Facebook } from "lucide-react";
import Link from "next/link" // Import Link for navigation
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("secret");
    const [email, setEmail] = useState("admin@argon.com");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await apiClient.post('/login', {
                email,
                password,
            });

            localStorage.setItem('authToken', response.data.access_token);
            localStorage.setItem('empresaSeleccionada', JSON.stringify(response.data.empresa));

            if (response.data.empresa) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/company';
            }
            
        } catch (err) {
            console.log('err: ',err);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        console.log("Iniciar sesión con Google")
        alert("Simulando inicio de sesión con Google.")
    }

    const handleFacebookLogin = () => {
        console.log("Iniciar sesión con Facebook")
        alert("Simulando inicio de sesión con Facebook.")
    }

    return (
        <html lang="en">
            <body>
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
                            <div className="absolute bottom-8 left-8 text-white text-left">
                            <h2 className="text-4xl font-bold mb-2">Gestión de Proyectos de Ingeniería Civil</h2>
                            <p className="text-lg">Optimiza tus presupuestos y recursos con nuestra plataforma avanzada.</p>
                        </div>
                    </div>


                    <div className="flex items-center justify-center p-4 bg-dollar-50">

                        <Card className="w-full max-w-md shadow-xl border-dollar-200">

                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl font-bold text-dollar-800">Bienvenido de Nuevo</CardTitle>
                                <CardDescription className="text-dollar-600">
                                    Accede a tu panel de control para gestionar tus proyectos.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-6">

                                <form onSubmit={handleSubmit} className="grid gap-4">
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
                                    <Button type="submit" className="w-full bg-dollar-600 hover:bg-dollar-700 text-white font-semibold">
                                        Iniciar Sesión
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-dollar-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-dollar-50 px-2 text-dollar-500">O continúa con</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-center gap-2 border-dollar-300 text-dollar-700 hover:bg-dollar-100 bg-transparent"
                                        onClick={handleGoogleLogin}
                                    >
                                        <Chrome className="h-4 w-4" />
                                        Google
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-center gap-2 border-dollar-300 text-dollar-700 hover:bg-dollar-100 bg-transparent"
                                        onClick={handleFacebookLogin}
                                    >
                                        <Facebook className="h-4 w-4" />
                                        Facebook
                                    </Button>
                                </div>

                            </CardContent>
                            
                            <CardFooter className="text-center text-sm text-dollar-600">
                                ¿No tienes una cuenta?{" "}
                                <Link href="/register" className="underline text-dollar-700 hover:text-dollar-800 font-medium">
                                Regístrate
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </body>
        </html>
    )
}
