import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <h1 className="text-4xl font-bold text-indigo-600">Welcome to Follow Mate</h1>
      <p className="text-gray-600">Your smart follow-up assistant</p>
      <div className="flex gap-4">
        <Link to="/signup" className="px-6 py-3 bg-indigo-600 text-white rounded">
          Create Account
        </Link>
        <Link to="/login" className="px-6 py-3 border rounded">
          Login
        </Link>
      </div>
    </div>
  );
}
