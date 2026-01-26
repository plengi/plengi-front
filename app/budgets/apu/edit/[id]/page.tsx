'use client';

import { useParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import ApuForm from "../../components/ApuForm";

export default function EditAPUPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <>
            <ApuForm mode="edit" apuId={Number(id)} />
            <Toaster />
        </>
    );
}