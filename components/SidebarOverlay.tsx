'use client';

import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarOverlay() {
    const { open, setOpen } = useSidebar();

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
        />
    );
}