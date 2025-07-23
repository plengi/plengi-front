'use client';

import type React from "react"

import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}