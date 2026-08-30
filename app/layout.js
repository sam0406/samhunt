import "./globals.css";

export const metadata = {
    title: "SamHunt",
    description:
        "SamHunt Research Console"
};

export default function RootLayout({
    children
}) {

    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
