import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCamera } from "react-icons/hi2";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import API from "../lib/api";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function Settings() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener("user-updated", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("user-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [user]);

  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await API.post(
        "/auth/change-password/request",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/change-password-code");
    } catch (error) {
      console.error("Failed to request change password code:", error);
      alert(
        error.response?.data?.msg ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("user-updated"));
    }
    navigate("/");
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPhotoError("Session expired. Please log in again.");
      event.target.value = "";
      return;
    }

    setPhotoError("");
    setPhotoSuccess("");
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const { data } = await API.put("/auth/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      setPhotoSuccess("Profile photo updated.");
    } catch (error) {
      setPhotoError(error.response?.data?.msg || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

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
                Your personal information is shown below. These fields are
                locked for your security.
              </p>

              <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="group relative h-24 w-24 overflow-hidden rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700 flex items-center justify-center">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user?.name || "Profile avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : initials ? (
                      initials
                    ) : (
                      <span>👤</span>
                    )}
                    <button
                      type="button"
                      onClick={handlePhotoButtonClick}
                      disabled={uploadingPhoto}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus:outline-none disabled:opacity-60"
                    >
                      {uploadingPhoto ? (
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <HiOutlineCamera className="text-2xl" />
                      )}
                      <span className="sr-only">Upload profile photo</span>
                    </button>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    {photoError && (
                      <p className="mt-2 text-sm text-red-500">{photoError}</p>
                    )}
                    {photoSuccess && (
                      <p className="mt-2 text-sm text-emerald-600">
                        {photoSuccess}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
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
                      value={user?.name || ""}
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
                      value={user?.email || ""}
                      disabled
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 shadow-sm focus:outline-none disabled:cursor-not-allowed"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Email updates require administrator assistance.
                    </p>
                  </div>
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
                  disabled={loading}
                  className="flex-1 rounded-xl border border-indigo-200 px-6 py-3 text-lg text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {loading && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loading ? "Sending Verification Code..." : "Change Password"}
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
