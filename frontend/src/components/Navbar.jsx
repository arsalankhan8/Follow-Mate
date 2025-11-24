import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <nav className="flex items-center justify-between p-5 bg-white shadow-lg">
      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Follow Mate
      </Link>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4">
        {!token ? (
          <>
            <Link
              to="/login"
              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Account
            </Link>
          </>
        ) : (
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
