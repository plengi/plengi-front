'use client';

import type React from "react"

import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}