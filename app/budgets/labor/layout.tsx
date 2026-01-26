'use client';

import type React from "react"

export default function LaboresLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white">
            {children}
        </div>
    );
}