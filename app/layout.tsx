import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriPlay — Indian Sports Nutrition Decision-Support System",
  description: "A scientific decision-support system generating personalized one-day meal and hydration plans for Indian athletes based on IFCT data, training load, and environmental heat stress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                NP
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">NutriPlay</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Decision Support v1.0
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Indian Sports Nutrition System | ICMR-NIN & IFCT Aligned
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-600">
              Disclaimer: NutriPlay is an engineering decision-support tool, NOT a medical diagnosis or replacement for a qualified sports dietitian.
            </p>
            <p className="mt-1 text-slate-400">
              Built with Indian Food Composition Tables (IFCT) reference guidelines &copy; 2026 NutriPlay Project.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

