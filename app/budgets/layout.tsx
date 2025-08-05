export const metadata = {
    title: 'PLENGI',
    description: 'Generated Abdel Cartagena',
}

export default function RootLayout({
        children,
    }: {
        children: React.ReactNode
    }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
