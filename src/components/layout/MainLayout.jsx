/**
 * Main layout wrapper
 */
export function MainLayout({ children }) {
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid lg:grid-cols-3 gap-8" style={{ paddingTop: '140px' }}>
      {children}
    </main>
  );
}
