// src/pages/Engagements.jsx

import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";

export default function Engagements() {
  const handleLogFirstEngagement = () => {
    // ✅ Later you can open modal here
    // window.dispatchEvent(new CustomEvent("open-log-engagement-modal"));
    console.log("Log First Engagement clicked");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[85px] lg:ml-56 flex-1 p-4">
        <HeaderSection />

        {/* Empty State */}
        {!loading && !error && engagements.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 text-center col-span-full">
            {/* Icon */}
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
              {/* Chat icon (same as screenshot style) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-7 h-7 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.76c0 1.6.632 3.13 1.758 4.266.272.276.48.63.48 1.02v2.204a.75.75 0 00.93.728l2.23-.558c.24-.06.49-.05.72.04 1.1.44 2.27.67 3.45.67 1.6 0 3.13-.63 4.27-1.76A6.01 6.01 0 0019.5 12.76c0-3.32-2.69-6.01-6-6.01s-6 2.69-6 6.01z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No engagements logged
            </h2>

            <p className="text-gray-500 mb-4">
              Start tracking your LinkedIn activities
            </p>

            <button
              onClick={() =>
                openModal(
                  <EngagementForm
                    onSuccess={() => {
                      setLoading(true);
                      fetchEngagements();
                    }}
                  />
                )
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span>
              Log First Engagement
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
