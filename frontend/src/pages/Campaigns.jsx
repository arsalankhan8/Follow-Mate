import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import AppModal from "../components/modals/AppModal.jsx";
import CampaignForm from "../components/forms/CampaignForm.jsx";
import { useModal } from "../components/context/ModalContext.jsx";
import API from "../lib/api";

// Icons (hi2)
import {
  HiEllipsisVertical,
  HiCalendarDays,
} from "react-icons/hi2";

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

  /* =========================
     OPEN CREATE MODAL EVENT
  ========================= */
  useEffect(() => {
    const handler = () => openModal(<CampaignForm />);
    window.addEventListener("open-create-modal", handler);
    return () => window.removeEventListener("open-create-modal", handler);
  }, [openModal]);

  /* =========================
     FETCH CAMPAIGNS
  ========================= */
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await API.get("/campaigns");
        setCampaigns(res.data || []);
      } catch (err) {
        console.error("Fetch campaigns error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[85px] lg:ml-56 flex-1 p-4">
        <HeaderSection />
        <AppModal />

        {/* =========================
            CAMPAIGNS GRID
        ========================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  items-center justify-between lg:px-16 py-5">
          {loading && (
            <div className="text-sm text-gray-500">Loading campaigns…</div>
          )}

          {!loading && campaigns.length === 0 && (
            <div className="text-sm text-gray-500">
              No campaigns found.
            </div>
          )}

          {!loading &&
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
                  ? Math.min(
                      100,
                      Math.round((responses / targetTotal) * 100)
                    )
                  : 0;

              return (
                <div
                  key={campaign._id}
                  className="rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-black/5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.campaignName || "Untitled Campaign"}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        {campaign.status || "active"}
                      </span>
                    </div>

                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-50">
                      <HiEllipsisVertical className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm text-gray-600">
                    {campaign.description || "—"}
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
                      <div className="text-xs text-gray-500">
                        Responses
                      </div>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-emerald-600">
                        {conversions}
                      </div>
                      <div className="text-xs text-gray-500">
                        Conversions
                      </div>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-violet-600">
                        {responseRate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Response Rate
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                    <HiCalendarDays className="h-4 w-4" />
                    {formatDateRange(
                      campaign.startDate,
                      campaign.endDate
                    )}
                  </div>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}
