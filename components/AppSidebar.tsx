'use client';

import type React from "react"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { User, Building2, Home, UserCog, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";

const AppSidebar = () => {
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