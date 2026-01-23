'use client';

import type React from "react"

export default function LaboresLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="equipos-layout">
            {children}
        </div>
    );
}