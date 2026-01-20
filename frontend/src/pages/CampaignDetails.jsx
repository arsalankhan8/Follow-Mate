// src/pages/CampaignDetails.jsx
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import React, { useMemo } from "react";
import { HiArrowLeft, HiUsers, HiChatBubbleLeftRight, HiArrowTrendingUp, HiCalendarDays, HiPlus } from "react-icons/hi2";

const statusColors = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paused: "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    other: "bg-gray-100 text-gray-700 border-gray-200",
};

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

function StatCard({ label, value, icon: Icon, iconClassName = "text-indigo-400" }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-black/5 flex items-start justify-between">
            <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
            </div>

            <div className="h-10 w-10 rounded-xl bg-gray-50 ring-1 ring-black/5 flex items-center justify-center">
                <Icon className={`h-6 w-6 ${iconClassName}`} />
            </div>
        </div>
    );
}

export default function CampaignDetails({
    campaign,
    onClose,
    onAddContacts, // optional callback if you want to open modal
}) {
    const computed = useMemo(() => {
        const statusKey = campaign?.status || "draft";

        const contactsCount = Array.isArray(campaign?.targetContacts)
            ? campaign.targetContacts.length
            : Number(campaign?.targetContacts || 0);

        const engagements = Number(campaign?.engagements || 0);
        const responses = Number(campaign?.responses || 0);

        const responseRate =
            contactsCount > 0 ? Math.round((responses / contactsCount) * 100) : 0;

        const progressPercent =
            contactsCount > 0
                ? Math.min(100, Math.round((responses / contactsCount) * 100))
                : 0;

        return {
            statusKey,
            contactsCount,
            engagements,
            responses,
            responseRate,
            progressPercent,
            durationText: formatDateRange(campaign?.startDate, campaign?.endDate),
        };
    }, [campaign]);

    if (!campaign) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1">
                {/* This matches Campaigns.jsx */}
                <section className="lg:px-16 py-5">
                    {/* Top bar */}
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <HiArrowLeft className="h-5 w-5" />
                        <span>
                            Back to Campaigns
                        </span>
                    </button>

                    {/* Title row */}
                    <div className="mt-6 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                                {campaign.campaignName || "Untitled Campaign"}
                            </h1>
                            <p className="mt-1 text-gray-500">
                                {campaign.description ? campaign.description : "Getting leads from day 1"}
                            </p>
                        </div>

                        <span
                            className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-medium capitalize ${statusColors[computed.statusKey] || statusColors.other
                                }`}
                        >
                            {computed.statusKey}
                        </span>
                    </div>

                    {/* Stats row */}
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Contacts" value={computed.contactsCount} icon={HiUsers} iconClassName="text-indigo-400" />
                        <StatCard label="Engagements" value={computed.engagements} icon={HiChatBubbleLeftRight} iconClassName="text-emerald-400" />
                        <StatCard label="Responses" value={computed.responses} icon={HiArrowTrendingUp} iconClassName="text-violet-400" />
                        <StatCard label="Response Rate" value={`${computed.responseRate}%`} icon={HiArrowTrendingUp} iconClassName="text-amber-400" />
                    </div>

                    {/* Campaign Progress */}
                    <div className="mt-6 rounded-2xl bg-white shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-black/5 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Campaign Progress</h2>
                        </div>

                        <div className="px-6 py-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Target:{" "}
                                    <span className="font-medium text-gray-900">{computed.contactsCount} contacts</span>
                                </span>

                                <span className="font-semibold text-gray-900">{computed.progressPercent}%</span>
                            </div>

                            <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-gray-300" style={{ width: `${computed.progressPercent}%` }} />
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                                <HiCalendarDays className="h-4 w-4" />
                                <span>Duration: {computed.durationText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contacts section */}
                    <div className="mt-10 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Contacts in Campaign ({computed.contactsCount || 0})
                        </h2>

                        <button
                            onClick={() => onAddContacts?.(campaign)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                            <HiPlus className="h-5 w-5" />
                            Add Contacts
                        </button>
                    </div>

                    {/* Contacts empty / list container */}
                    <div className="mt-4 rounded-2xl bg-white shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-black/5">
                        {(computed.contactsCount || 0) === 0 ? (
                            <div className="px-6 py-14 flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-2xl bg-gray-50 ring-1 ring-black/5 flex items-center justify-center">
                                    <HiUsers className="h-7 w-7 text-gray-300" />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-gray-900">No contacts yet</h3>

                                <p className="mt-1 text-sm text-gray-500">Add contacts to start this campaign</p>

                                <button
                                    onClick={() => onAddContacts?.(campaign)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    <HiPlus className="h-5 w-5" />
                                    Add Contacts
                                </button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="text-sm text-gray-600">Contacts list goes here…</div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );

}
