'use client';

import type React from "react"
import AppSidebar from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TransportesLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="equipos-layout">
            {children}
        </div>
    );
}