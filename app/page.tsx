export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          NutriPlay
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Indian Sports Nutrition Decision-Support System
        </p>
        <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 text-left">
          <p className="font-semibold">Phase 1 Foundation Initialized:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
            <li>Strict TypeScript & Next.js App Router configured</li>
            <li>Tailwind CSS styling pipeline active</li>
            <li>Vitest unit and integration test runner operational</li>
            <li>Ready for Module 1 (Athlete Profile) and Module 2 (Energy Engine)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

