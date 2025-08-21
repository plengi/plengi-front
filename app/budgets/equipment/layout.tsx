'use client';

import type React from "react"

export default function EquiposLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}