'use client';

import type React from "react"

export default function EquiposLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="equipos-layout">
            {children}
        </div>
    );
}