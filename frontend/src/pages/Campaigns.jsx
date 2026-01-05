// src/pages/Campaigns.jsx

import { useCallback, useEffect, useState, useRef } from "react";

import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import AppModal from "../components/modals/AppModal.jsx";
import CampaignForm from "../components/forms/CampaignForm.jsx";
import { useModal } from "../components/context/ModalContext.jsx";
import API from "../lib/api";

// Icons (hi2)
import { HiEllipsisVertical, HiCalendarDays } from "react-icons/hi2";

const statusColors = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

/* =========================
   HELPERS
========================= */

const formatDateRange = (start, end) => {
  if (!start && !end) return "—";

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  const s = start ? formatter.format(new Date(start)) : "—";
  const e = end ? formatter.format(new Date(end)) : "—";
  const year = end
    ? new Date(end).getFullYear()
    : start
    ? new Date(start).getFullYear()
    : "";

  return `${s} - ${e}${year ? `, ${year}` : ""}`;
};

export default function Campaigns() {
  const { openModal } = useModal();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const menuRefs = useRef({});

  /* =========================
     FETCH CAMPAIGNS (reusable)
  ========================= */

  const fetchCampaigns = useCallback(async () => {
    try {
      setError("");
      const res = await API.get("/campaigns");
      setCampaigns(res.data || []);
    } catch (err) {
      console.error("Fetch campaigns error:", err);
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     INITIAL FETCH
  ========================= */
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  /* =========================
     OPEN CREATE MODAL EVENT
  ========================= */
  useEffect(() => {
    const openCreateHandler = () => {
      openModal(
        <CampaignForm
          onSuccess={() => {
            setLoading(true);
            fetchCampaigns();
          }}
        />
      );
    };

    window.addEventListener("open-create-modal", openCreateHandler);
    return () =>
      window.removeEventListener("open-create-modal", openCreateHandler);
  }, [openModal, fetchCampaigns]);

  /* =========================
     REFRESH LIST WHEN CREATED
     ✅ This is what you were missing
  ========================= */
  useEffect(() => {
    const refreshHandler = () => {
      setLoading(true);
      fetchCampaigns();
    };

    window.addEventListener("campaign-created", refreshHandler);
    return () => window.removeEventListener("campaign-created", refreshHandler);
  }, [fetchCampaigns]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!openMenuId) return;
      const menuNode = menuRefs.current[openMenuId];
      if (menuNode && !menuNode.contains(e.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

useEffect(() => {
  const refreshHandler = () => {
    setLoading(true);
    fetchCampaigns();
  };

  window.addEventListener("campaign-created", refreshHandler);
  window.addEventListener("campaign-updated", refreshHandler);

  return () => {
    window.removeEventListener("campaign-created", refreshHandler);
    window.removeEventListener("campaign-updated", refreshHandler);
  };
}, [fetchCampaigns]);


  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[85px] lg:ml-56 flex-1 p-4">
        <HeaderSection />
        <AppModal />

        {/* =========================
            CAMPAIGNS GRID
        ========================= */}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start lg:px-16 py-5">
          {/* Loading */}
          {loading && (
            <div className="text-sm text-gray-500">Loading campaigns…</div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-sm text-rose-600">{error}</div>
          )}

          {/* Empty State */}
          {!loading && !error && campaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 text-center col-span-full">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
                <span className="text-indigo-600 text-2xl font-bold">+</span>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No campaigns found
              </h2>

              <p className="text-gray-500 mb-4">
                Start by creating your first campaign
              </p>

              <button
                onClick={() =>
                  openModal(
                    <CampaignForm
                      onSuccess={() => {
                        setLoading(true);
                        fetchCampaigns();
                      }}
                    />
                  )
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Campaign
              </button>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete campaign?
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {campaignToDelete?.campaignName}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={async () => {
                      await API.delete(`/campaigns/${campaignToDelete._id}`);
                      setShowDeleteConfirm(false);
                      setCampaignToDelete(null);
                      setLoading(true);
                      fetchCampaigns();
                    }}
                    className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-600"
                  >
                    Yes, delete
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setCampaignToDelete(null);
                    }}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewCampaign && (
            <CampaignDetails
              campaign={viewCampaign}
              onClose={() => setViewCampaign(null)}
            />
          )}

          {/* Cards */}
          {!loading &&
            !error &&
            campaigns.map((campaign) => {
              const targetTotal = Array.isArray(campaign.targetContacts)
                ? campaign.targetContacts.length
                : Number(campaign.targetContacts || 0);

              const responses = Number(campaign.responses || 0);
              const conversions = Number(campaign.conversions || 0);

              const responseRate =
                targetTotal > 0
                  ? Math.round((responses / targetTotal) * 100)
                  : 0;

              const progressPercent =
                targetTotal > 0
                  ? Math.min(100, Math.round((responses / targetTotal) * 100))
                  : 0;

              const statusKey = campaign.status || "draft";

              return (
                <div
                  key={campaign._id}
                  className="rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-black/5 h-[-webkit-fill-available]"
                >
                  {/* Header */}

                  {/* Header */}
                  <div
                    className="flex items-start justify-between relative"
                    ref={(node) => {
                      if (node) menuRefs.current[campaign._id] = node;
                    }}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.campaignName || "Untitled Campaign"}
                      </h3>
                      <span
                        className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                          statusColors[statusKey] || statusColors.other
                        }`}
                      >
                        {statusKey}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === campaign._id ? null : campaign._id
                        )
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <HiEllipsisVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === campaign._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          onClick={() => {
                            setViewCampaign(campaign);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          View details
                        </button>

                        <button
                          onClick={() => {
                            openModal(
                              <CampaignForm
                                campaign={campaign}
                                onSuccess={() => {
                                  setLoading(true);
                                  fetchCampaigns();
                                }}
                              />
                            );
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setCampaignToDelete(campaign);
                            setShowDeleteConfirm(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm text-gray-600">
                    {campaign.description
                      ? campaign.description.length > 60
                        ? campaign.description.slice(0, 60) + "…"
                        : campaign.description
                      : "—"}
                  </p>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {responses} / {targetTotal}
                      </span>
                    </div>

                    <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-5 grid grid-cols-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-indigo-600">
                        {responses}
                      </div>
                      <div className="text-xs text-gray-500">Responses</div>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-emerald-600">
                        {conversions}
                      </div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-violet-600">
                        {responseRate}%
                      </div>
                      <div className="text-xs text-gray-500">Response Rate</div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                    <HiCalendarDays className="h-4 w-4" />
                    {formatDateRange(campaign.startDate, campaign.endDate)}
                  </div>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}
