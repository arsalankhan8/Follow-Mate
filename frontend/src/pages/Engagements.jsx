// src/pages/Engagements.jsx
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import AppModal from "../components/modals/AppModal.jsx";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useModal } from "../components/context/ModalContext.jsx";
import EngagementForm from "../components/forms/EngagementForm.jsx";
import API from "../lib/api";

// Icons (hi2)
import {
  HiChatBubbleLeftRight,
  HiChatBubbleLeftEllipsis,
  HiEnvelope,
  HiPhone,
  HiVideoCamera,
  HiUserPlus,
  HiHandThumbUp,
  HiShare,
  HiCalendarDays,
  HiTrash,
  HiPencilSquare,
  HiExclamationTriangle,
} from "react-icons/hi2";

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "message", label: "Message" },
  { value: "comment", label: "Comment" },
  { value: "like", label: "Like" },
  { value: "share", label: "Share" },
  { value: "connection_request", label: "Connection request" },
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

const OUTCOME_STYLES = {
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  negative: "bg-rose-100 text-rose-700 border-rose-200",
  no_response_yet: "bg-amber-100 text-amber-700 border-amber-200",
};

const TYPE_META = {
  message: {
    label: "message",
    icon: HiChatBubbleLeftEllipsis,
    iconWrap: "bg-purple-100 text-purple-700",
    pill: "bg-purple-100 text-purple-700 border-purple-200",
  },
  comment: {
    label: "comment",
    icon: HiChatBubbleLeftRight,
    iconWrap: "bg-indigo-100 text-indigo-700",
    pill: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  like: {
    label: "like",
    icon: HiHandThumbUp,
    iconWrap: "bg-rose-100 text-rose-700",
    pill: "bg-rose-100 text-rose-700 border-rose-200",
  },
  share: {
    label: "share",
    icon: HiShare,
    iconWrap: "bg-fuchsia-100 text-fuchsia-700",
    pill: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  },
  connection_request: {
    label: "connection request",
    icon: HiUserPlus,
    iconWrap: "bg-emerald-100 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  meeting: {
    label: "meeting",
    icon: HiVideoCamera,
    iconWrap: "bg-violet-100 text-violet-700",
    pill: "bg-violet-100 text-violet-700 border-violet-200",
  },
  call: {
    label: "call",
    icon: HiPhone,
    iconWrap: "bg-amber-100 text-amber-700",
    pill: "bg-amber-100 text-amber-700 border-amber-200",
  },
  email: {
    label: "email",
    icon: HiEnvelope,
    iconWrap: "bg-sky-100 text-sky-700",
    pill: "bg-sky-100 text-sky-700 border-sky-200",
  },
  other: {
    label: "other",
    icon: HiCalendarDays,
    iconWrap: "bg-gray-100 text-gray-700",
    pill: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getContactName(contact) {
  if (!contact) return "Unknown";
  if (typeof contact === "string") return contact; // fallback if API sends name string
  return contact?.name || contact?.fullName || "Unknown";
}

function getApiErrorMessage(err) {
  // Axios: no response means request never reached server (backend down / CORS / DNS / offline)
  if (!err?.response) {
    return "Can’t connect to the server right now. Please check your internet or try again in a moment.";
  }

  const status = err.response.status;

  if (status === 401) return "Your session expired. Please login again.";
  if (status === 403) return "You don’t have permission to view this data.";
  if (status === 404) return "Engagements endpoint not found (API route missing).";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";

  // Best practice: backend should send 503 when DB is down / service unavailable
  if (status === 503) return "Service temporarily unavailable. Please try again shortly.";

  // Generic server error
  if (status >= 500) return "Something went wrong on our side while loading engagements. Please try again.";

  // fallback
  return "Failed to load engagements. Please try again.";
}

export default function Engagements() {
  const { openModal } = useModal();

  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchEngagements = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await API.get("/engagements");
      setEngagements(res.data || []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  useEffect(() => {
    const refreshHandler = () => fetchEngagements();
    window.addEventListener("engagement-created", refreshHandler);
    return () => window.removeEventListener("engagement-created", refreshHandler);
  }, [fetchEngagements]);

  useEffect(() => {
    const openCreateHandler = () => {
      openModal(
        <EngagementForm
          onSuccess={() => fetchEngagements()}
        />
      );
    };

    window.addEventListener("open-create-modal", openCreateHandler);
    return () => window.removeEventListener("open-create-modal", openCreateHandler);
  }, [openModal, fetchEngagements]);

  const filteredEngagements = useMemo(() => {
    const list = Array.isArray(engagements) ? engagements : [];
    const byType =
      typeFilter === "all" ? list : list.filter((e) => e?.type === typeFilter);

    // Sort newest first (date fallback createdAt)
    return byType.sort((a, b) => {
      const ad = new Date(a?.date || a?.createdAt || 0).getTime();
      const bd = new Date(b?.date || b?.createdAt || 0).getTime();
      return bd - ad;
    });
  }, [engagements, typeFilter]);

  const handleEdit = (item) => {
    openModal(
      <EngagementForm
        initialData={item}
        onSuccess={() => fetchEngagements()}
      />
    );
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this engagement?");
    if (!ok) return;

    try {
      await API.delete(`/engagements/${id}`);
      // instant UI update
      setEngagements((prev) => prev.filter((x) => x?._id !== id));
    } catch (e) {
      alert("Failed to delete engagement");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[85px] lg:ml-56 flex-1 p-4">
        <HeaderSection />

        {/* ✅ Required for modal */}
        <AppModal />

        {/* Top filter row */}
        {Array.isArray(engagements) && engagements.length > 0 && (
          <div className="mb-4 lg:px-16 py-5 flex-1">
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full sm:w-56 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
            Loading engagements...
          </div>
        )}
        {!loading && error && (
          <div className="lg:px-16 py-5 flex-1">
            <div className="bg-white border border-rose-200 rounded-xl p-6 text-sm text-rose-700 flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <HiExclamationTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-800">Unable to load engagements</div>
                  <div className="mt-1">{error}</div>
                </div>
              </div>

              <button
                onClick={fetchEngagements}
                className="shrink-0 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

{!loading && !error && filteredEngagements.length === 0 && (
  <div className="flex flex-col items-center justify-center mt-10 text-center col-span-full">
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
      <span className="text-indigo-600 text-2xl font-bold">+</span>
    </div>

    <h2 className="text-lg font-semibold text-gray-900 mb-2">
      No engagements logged
    </h2>

    <p className="text-gray-500 mb-4">
      Start tracking your LinkedIn activities
    </p>

    <button
      onClick={() => openModal(<EngagementForm onSuccess={() => fetchEngagements()} />)}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    >
      Log First Engagement
    </button>
  </div>
)}


        {/* List */}
        {!loading && !error && filteredEngagements.length > 0 && (
          <div className="space-y-3  flex-1 lg:px-16 py-5">
            {filteredEngagements.map((item) => {
              const meta = TYPE_META[item?.type] || TYPE_META.other;
              const OutcomeClass =
                OUTCOME_STYLES[item?.outcome] || OUTCOME_STYLES.neutral;
              const Icon = meta.icon;

              return (
                <div
                  key={item?._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm "
                >
                  <div className="px-4 py-4 flex items-start justify-between gap-4">
                    {/* Left: icon + content */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getContactName(item?.contact)}
                          </h3>

                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${meta.pill}`}
                          >
                            {meta.label}
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${OutcomeClass}`}
                          >
                            {item?.outcome?.replaceAll("_", " ") || "neutral"}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(item?.date || item?.createdAt)}
                        </div>

                        {item?.notes ? (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center gap-2"
                      >
                        <HiPencilSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item?._id)}
                        className="text-rose-600 hover:text-rose-700 inline-flex items-center gap-2"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile create button */}
        <div className="sm:hidden fixed bottom-5 right-5">
          <button
            onClick={() =>
              openModal(<EngagementForm onSuccess={() => fetchEngagements()} />)
            }
            className="w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center text-2xl hover:bg-indigo-700"
            aria-label="Log engagement"
          >
            +
          </button>
        </div>
      </main>
    </div>
  );
}
