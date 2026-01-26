'use client';

import { Toaster } from "@/components/ui/toaster";
import ApuForm from "../components/ApuForm";

export default function NewAPUPage() {
    return (
        <>
            <ApuForm mode="create" />
            <Toaster />
        </>
    );
}