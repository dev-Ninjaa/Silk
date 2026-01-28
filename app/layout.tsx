import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ditto Editor",
  description: "A minimalist text editor with slash commands",
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
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
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
      <body className="min-h-screen bg-white text-gray-900 cursor-text font-sans selection:bg-blue-100">
        {children}
      </body>
    </html>
  );
}
