"use client";

import type React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Wrench,
    Truck,
    HardHat,
    Package,
    ChevronDown,
    User,
    Building2,
    Home,
    UserCog,
    LayoutDashboard,
    FolderKanban,
    BarChart3,
    Calculator,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
    const pathname = usePathname();
    const [empresa, setEmpresa] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userFromStorage = localStorage.getItem("user");
        let userData = userFromStorage
            ? JSON.parse(userFromStorage)
            : null;
        setUser(userData);
    }, []);

    useEffect(() => {
        const empresaFromStorage = localStorage.getItem("empresaSeleccionada");
        let empresaData = empresaFromStorage
            ? JSON.parse(empresaFromStorage)
            : null;
        setEmpresa(empresaData);
    }, []);

    const menuItems = [
        {
            title: "Empresa",
            url: "/company",
            icon: Home,
        },
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        }
    ];

    const suppliesItems = [];
    const analysisItems = [];

    if (empresa) {
        menuItems.push({
            title: "Clientes",
            url: "/clientes",
            icon: User,
        });
        menuItems.push({
            title: "Proyectos",
            url: "/projects",
            icon: FolderKanban,
        });
        menuItems.push({
            title: "Presupuestos",
            url: "/budgets",
            icon: Calculator,
        });

        suppliesItems.push({
            title: "Materiales",
            url: "/budgets/materials",
            icon: Package,
            description: "Gestión de materiales",
        });

        suppliesItems.push({
            title: "Equipos",
            url: "/budgets/equipment",
            icon: Wrench,
            description: "Equipos y herramientas",
        });

        suppliesItems.push({
            title: "Transporte",
            url: "/budgets/transport",
            icon: Truck,
            description: "Costos de transporte",
        });

        suppliesItems.push({
            title: "Mano de Obra",
            url: "/budgets/labor",
            icon: HardHat,
            description: "Recursos humanos",
        });
        
        analysisItems.push({
            title: "APU",
            url: "/budgets/apu",
            icon: BarChart3,
            description: "Análisis de Precios Unitarios",
        }); 
    }

    menuItems.push({
        title: "Perfil",
        url: "/profile",
        icon: UserCog,
    });

    return (
        <Sidebar className="bg-white border-r border-green-100 shadow-sm">
            {/* Fondo sólido y borde para asegurar visibilidad */}
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-green-800 truncate">
                            {empresa && empresa.razon_social
                                ? empresa.razon_social
                                : "PLENGI"}
                        </h2>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-white">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-green-700 px-4">
                        Navegación
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800 hover:bg-green-50"
                                    >
                                        <Link href={item.url}>
                                            <item.icon
                                                className={
                                                    pathname === item.url
                                                        ? "text-green-600"
                                                        : "text-gray-600"
                                                }
                                            />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {
                    analysisItems.length > 0 && (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild className="px-4">
                                    <CollapsibleTrigger className="w-full hover:bg-green-50 rounded-md p-2">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4 text-green-600" />
                                                <span>Análisis de Precios</span>
                                            </div>
                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </div>
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>

                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {analysisItems.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={pathname === item.url}
                                                        className="hover:bg-green-50 hover:text-green-800 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                                                        tooltip={item.description}
                                                    >
                                                        <Link href={item.url}>
                                                            <item.icon
                                                                className={
                                                                    pathname === item.url
                                                                        ? "text-green-600"
                                                                        : "text-gray-600"
                                                                }
                                                            />
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    )
                }

                {
                    suppliesItems.length > 0 && (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild className="px-4">
                                    <CollapsibleTrigger className="w-full hover:bg-green-50 rounded-md p-2">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-green-600" />
                                                <span>Insumos</span>
                                            </div>
                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </div>
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>

                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {suppliesItems.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={pathname === item.url}
                                                        className="hover:bg-green-50 hover:text-green-800 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                                                        tooltip={item.description}
                                                    >
                                                        <Link href={item.url}>
                                                            <item.icon
                                                                className={
                                                                    pathname === item.url
                                                                        ? "text-green-600"
                                                                        : "text-gray-600"
                                                                }
                                                            />
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    )
                }
            </SidebarContent>

            <SidebarFooter className="bg-white border-t border-green-100">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:bg-green-50">
                                    <User className="text-green-600" />
                                    <span className="truncate">
                                        {user?.username ?? "Usuario"}
                                    </span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width] bg-white"
                            >
                                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Perfil</Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Configuración</Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem className="hover:bg-red-50 text-red-600">
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
