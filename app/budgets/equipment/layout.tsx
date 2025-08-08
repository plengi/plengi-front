'use client';

import type React from "react"
import AppSidebar from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function EquiposLayout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}