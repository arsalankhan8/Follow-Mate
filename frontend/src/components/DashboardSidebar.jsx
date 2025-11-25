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
  const location = useLocation(); // get current route
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
      .map((part) => part[0]?.toUpperCase())
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
    <aside className="fixed top-0 left-0 h-screen  bg-white shadow-lg shadow-gray-400/50 flex flex-col justify-between p-4 max-sm:w-20 max-sm:p-3">
      {/* Logo */}
      <div>

        <div className="flex items-center gap-2  max-sm:justify-center">
          <div className="h-10 w-10 bg-purple-600 rounded-xl text-white flex items-center justify-center text-xl font-bold">
            i
          </div>
          <span className="font-semibold text-lg max-sm:hidden">LinkedIn Hub</span>
        </div>
        <hr className="border-gray-300 w-[124%] ml-[-15%] my-6" />
        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-gray-700 font-medium">
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
        <hr className="border-gray-300 w-[125%] ml-[-16%] my-6" />

        <Link to="/settings">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] cursor-pointer hover:bg-gray-100 transition max-sm:justify-center max-sm:p-2">
            <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white text-sm font-semibold">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : initials ? (
                initials
              ) : (
                <HiOutlineUser className="text-xl" />
              )}
            </div>
            <div className="max-sm:hidden">
              <p className="font-semibold text-[14px]">
                {user?.name || "Guest User"}
              </p>
              <p className="text-[12px] text-gray-500">{displayEmail}</p>
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
        flex items-center gap-3 p-3 rounded-lg transition
        max-sm:justify-center max-sm:gap-0
        ${active ? "bg-[#EEF2FF] text-[#4f46e5]" : "text-[#475569] hover:bg-gray-100"}
      `}
    >
      <span className="text-[25px]">{icon}</span>
      <span className="max-sm:hidden text-[18px] font-normal">{label}</span>

    </Link>
  );
}

export default DashboardSidebar;
