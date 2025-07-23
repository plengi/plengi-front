'use client';

import type React from "react"

import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AppHeader = () => {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar proyectos, clientes..."
                        className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>
                <Button variant="outline" size="icon" className="border-green-200 hover:bg-green-50 hover:border-green-300">
                <Bell className="h-4 w-4 text-green-600" />
                </Button>
            </div>
        </header>
    );
}

export default AppHeader;