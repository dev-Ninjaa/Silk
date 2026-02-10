import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Pulm Notes",
  description: "A personal note taking app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          *::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none;
          }
          
          [contenteditable]:focus {
            outline: none;
          }
          
          .empty-node:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            display: block;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-white text-gray-900 cursor-text font-sans selection:bg-blue-100 scrollbar-none">
        {children}
      </body>
    </html>
  );
}
