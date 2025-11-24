import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userProfile = {
    name: "Arsalan Khan",
    email: "theholyquran2004@gmail.com",
  };

  const handleChangePassword = () => {
    console.log("Change password clicked");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-56 flex-1 max-sm:ml-20 flex justify-center py-12">
        <div className="w-full max-w-4xl mx-auto p-6">
          <HeaderSection />

          <section className="mt-6 space-y-12">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>

            {/* Profile Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your personal information is shown below. These fields are locked
                for your security.
              </p>

              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={userProfile.name}
                    disabled
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 shadow-sm focus:outline-none disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 shadow-sm focus:outline-none disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Email updates require administrator assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Actions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your password or sign out of FollowMate.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="flex-1 rounded-xl border border-indigo-200 px-6 py-3 text-lg text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex-1 rounded-xl border border-red-200 px-6 py-3 text-lg text-red-600 transition hover:border-red-400 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
              <div className="fixed inset-[-50px] z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Are you sure you want to logout?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You'll need to sign in again to access your dashboard.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-600"
                    >
                      Yes, logout
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelLogout}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
