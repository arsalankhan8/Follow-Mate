import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineCursorArrowRays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineUser,
} from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function DashboardSidebar() {
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser);

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
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [user]);

  const displayEmail = useMemo(() => {
    if (!user?.email) return "No email";
    return user.email.length > 18
      ? `${user.email.slice(0, 18)}...`
      : user.email;
  }, [user]);

  return (
    <aside
      className="
        fixed top-0 left-0 h-screen
        bg-white shadow-lg
        w-20 lg:w-64
        p-3 lg:p-4
        flex flex-col justify-between
      "
    >
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <div className="h-10 w-10 bg-purple-600 rounded-xl text-white flex items-center justify-center text-xl font-bold">
            i
          </div>
          <span className="hidden lg:block font-semibold text-lg">
            LinkedIn Hub
          </span>
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <SidebarItem
            label="Dashboard"
            icon={<HiOutlineSquares2X2 />}
            to="/dashboard"
            active={location.pathname === "/dashboard"}
          />
          <SidebarItem
            label="Contacts"
            icon={<HiOutlineUsers />}
            to="/contacts"
            active={location.pathname === "/contacts"}
          />
          <SidebarItem
            label="Campaigns"
            icon={<HiOutlineCursorArrowRays />}
            to="/campaigns"
            active={location.pathname === "/campaigns"}
          />
          <SidebarItem
            label="Engagements"
            icon={<HiOutlineChatBubbleLeftRight />}
            to="/engagements"
            active={location.pathname === "/engagements"}
          />
          <SidebarItem
            label="Analytics"
            icon={<HiOutlineChartBar />}
            to="/analytics"
            active={location.pathname === "/analytics"}
          />
        </nav>
      </div>

      {/* User Box */}
      <div>
        <hr className="my-6 border-gray-300" />

        <Link to="/settings">
          <div
            className="
              flex items-center gap-3
              justify-center lg:justify-start
              p-2 lg:p-3
              rounded-xl bg-[#F8FAFC]
              hover:bg-gray-100 transition
            "
          >
            <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : initials ? (
                initials
              ) : (
                <HiOutlineUser className="text-xl" />
              )}
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-semibold">
                {user?.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, to, active }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3
        justify-center lg:justify-start
        p-3 rounded-lg transition
        ${
          active
            ? "bg-[#EEF2FF] text-[#4f46e5]"
            : "text-[#475569] hover:bg-gray-100"
        }
      `}
    >
      <span className="text-[25px]">{icon}</span>
      <span className="hidden lg:block text-base font-normal">
        {label}
      </span>
    </Link>
  );
}

export default DashboardSidebar;
