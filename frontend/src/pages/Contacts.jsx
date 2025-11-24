import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";

export default function Contacts() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-56 flex-1 max-sm:ml-20">
        <HeaderSection />
        <section className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
          <p className="mt-2 text-sm text-gray-600">
            Contact list UI goes here.
          </p>
        </section>
      </main>
    </div>
  );
}
