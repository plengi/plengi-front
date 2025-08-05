'use client';

import type React from "react"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wrench, Truck, HardHat, Package, ChevronDown, User, Building2, Home, UserCog, LayoutDashboard, FolderKanban } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from "@/components/ui/sidebar";

const AppSidebar = () => {
    const { open } = useSidebar();
    const pathname = usePathname();
    const [empresa, setEmpresa] = useState('');

    useEffect(() => {
        const empresaFromStorage = localStorage.getItem('empresaSeleccionada');
        
        let empresaData = empresaFromStorage ? JSON.parse(empresaFromStorage) : null;
        setEmpresa(empresaData);
    }, []);

    const menuItems = [
        {
            title: "Empresa",
            url: "/company",
            icon: Home,
        }
    ];

    if (empresa) {
        menuItems.push({
            title: "Proyectos",
            url: "/projects",
            icon: FolderKanban,
        });
        menuItems.push({
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        });
        menuItems.push({
            title: "Perfil",
            url: "/profile",
            icon: UserCog,
        });
    }

    const suppliesItems = [
        {
            title: "Materiales",
            url: "/budgets/materials",
            icon: Package,
            description: "Gestión de materiales",
        },
        {
            title: "Equipos",
            url: "/budgets/equipment",
            icon: Wrench,
            description: "Equipos y herramientas",
        },
        {
            title: "Transporte",
            url: "/budgets/transport",
            icon: Truck,
            description: "Costos de transporte",
        },
        {
            title: "Mano de Obra",
            url: "/budgets/labor",
            icon: HardHat,
            description: "Recursos humanos",
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2 justify-center">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div>
                        <h2 className="text-lg font-semibold text-green-800">
                            { empresa && empresa.razon_social ? empresa.razon_social : 'PLENGI' }
                        </h2>
                        
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-green-700 justify-center">Navegación</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                                    >
                                        <Link href={item.url}>
                                            <item.icon className={pathname === item.url ? "text-green-600" : ""} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarGroup>

                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger className="w-full">
                                <span className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-green-600" />
                                    <span className={open ? "" : "hidden"}>
                                        Insumos
                                    </span>
                                </span>
                                <ChevronDown className={`ml-auto transition-transform ${open ? "" : "hidden"} group-data-[state=open]/collapsible:rotate-180`}/>
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
                                                className="hover:bg-green-50 hover:text-green-800 pl-6 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                                                tooltip={item.description}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className={pathname === item.url ? "text-green-600" : "text-green-600"} />
                                                    <span className={open ? "" : "hidden"}>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>

                    </SidebarGroup>
                </Collapsible>

            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:bg-green-50">
                                    <User className="text-green-600" />
                                    <span>Ing. Juan Pérez</span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;