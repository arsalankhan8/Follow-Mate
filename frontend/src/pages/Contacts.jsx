// src/pages/Contacts.jsx

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useModal } from "../components/context/ModalContext.jsx";
import ContactForm from "../components/forms/ContactForm";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import AppModal from "../components/modals/AppModal.jsx";
import API from "../lib/api";
import ContactDetails from "../components/modals/ContactDetails.jsx";

// Icons
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChatBubbleLeftRight,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiExclamationTriangle,
} from "react-icons/hi2";

// ---------------- CONFIGS ----------------

const followUpStatusConfig = {
  overdue: {
    label: "Overdue",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: HiOutlineExclamationTriangle,
  },
  today: {
    label: "Due Today",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: HiOutlineClock,
  },
  upcoming: {
    label: "Upcoming",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: HiOutlineCalendarDays,
  },
};

const statusColors = {
  prospect: "bg-slate-100 text-slate-700 border-slate-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  following: "bg-indigo-100 text-indigo-700 border-indigo-200",
  connected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lead: "bg-amber-100 text-amber-700 border-amber-200",
  client: "bg-violet-100 text-violet-700 border-violet-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

const priorityColors = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-blue-100 text-blue-600 border-blue-200",
  high: "bg-amber-100 text-amber-600 border-blue-200",
  urgent: "bg-rose-100 text-rose-600 border-rose-200",
};

// ---------------- HELPERS ----------------

const getFollowUpStatus = (nextFollowUpDate) => {
  if (!nextFollowUpDate) return null;

  const date = new Date(nextFollowUpDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < now) return "overdue";
  if (date.getTime() === now.getTime()) return "today";
  return "upcoming";
};

const Badge = ({ label, className, Icon }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${className}`}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </span>
);

function getApiErrorMessage(err) {
  // Axios: no response means request never reached server (backend down / CORS / DNS / offline)
  if (!err?.response) {
    return "Can’t connect to the server right now. Please check your internet or try again in a moment.";
  }

  const status = err.response.status;

  if (status === 401) return "Your session expired. Please login again.";
  if (status === 403) return "You don’t have permission to view this data.";
  if (status === 404) return "Contacts endpoint not found (API route missing).";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status === 503) return "Service temporarily unavailable. Please try again shortly.";
  if (status >= 500)
    return "Something went wrong on our side while loading contacts. Please try again.";

  return "Failed to load contacts. Please try again.";
}

// ---------------- PAGE ----------------

export default function Contacts() {
  const { openModal } = useModal();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewContact, setViewContact] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const menuRefs = useRef({});

  // ---------------- FETCH CONTACTS ----------------

  const fetchContacts = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await API.get("/contacts");
      setContacts(res.data || []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();

    const handler = () => fetchContacts();
    window.addEventListener("contacts-updated", handler);

    return () => window.removeEventListener("contacts-updated", handler);
  }, [fetchContacts]);

  // Open create modal listener
  useEffect(() => {
    const handler = () => openModal(<ContactForm />);
    window.addEventListener("open-create-modal", handler);
    return () => window.removeEventListener("open-create-modal", handler);
  }, [openModal]);

  // Close menu on outside click
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

  // ---------------- DELETE CONTACT ----------------

  const deleteContact = async (id) => {
    try {
      await API.delete(`/contacts/${id}`);
      setShowDeleteConfirm(false);
      setContactToDelete(null);
      fetchContacts(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contact");
    }
  };

  // ---------------- FILTERED CONTACTS ----------------

  const filteredContacts = useMemo(() => {
    const list = Array.isArray(contacts) ? contacts : [];

    return list.filter((contact) => {
      const fullName = (contact.fullName || "").toLowerCase();
      const company = (contact.company || "").toLowerCase();
      const role = (contact.role || "").toLowerCase();
      const q = (searchQuery || "").toLowerCase();

      const matchesSearch =
        !q || fullName.includes(q) || company.includes(q) || role.includes(q);

      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || contact.priority === priorityFilter;

      const followUpStatus = getFollowUpStatus(contact.nextFollowUpDate);
      const matchesFollowUp =
        followUpFilter === "all" ||
        (followUpFilter === "has_followup" && contact.nextFollowUpDate) ||
        followUpStatus === followUpFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesFollowUp;
    });
  }, [contacts, searchQuery, statusFilter, priorityFilter, followUpFilter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="ml-[85px] lg:ml-56 flex-1 p-4">
        <HeaderSection />
        <AppModal />

        {/* Filters (show only when there is at least 1 contact) */}
        {Array.isArray(contacts) && contacts.length > 0 && (
          <div className="py-6 lg:px-16">
            <div className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-wrap items-center justify-between w-full gap-4 p-4">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-md flex-1 min-w-[200px]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="prospect">Prospect</option>
                <option value="contacted">Contacted</option>
                <option value="following">Following</option>
                <option value="connected">Connected</option>
                <option value="lead">Lead</option>
                <option value="client">Client</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Follow-ups</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <p className="lg:px-16 py-4 text-sm text-gray-500">Loading contacts...</p>}

        {/* Error card */}
        {!loading && error && (
          <div className="lg:px-16 py-4">
            <div className="bg-white border border-rose-200 rounded-xl p-6 text-sm text-rose-700 flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <HiExclamationTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-800">Unable to load contacts</div>
                  <div className="mt-1">{error}</div>
                </div>
              </div>

              <button
                onClick={fetchContacts}
                className="shrink-0 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 text-center col-span-full">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
              <span className="text-indigo-600 text-2xl font-bold">+</span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No contacts found
            </h2>

            <p className="text-gray-500 mb-4">
              Start building your network by adding your first contact
            </p>

            <button
              onClick={() => openModal(<ContactForm />)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add First Contact
            </button>
          </div>
        )}


        {/* Grid */}
        {!loading && !error && filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-between lg:px-16 py-5">
            {filteredContacts.map((contact) => {
              const followUpKey = getFollowUpStatus(contact.nextFollowUpDate);
              const followUpCfg = followUpKey && followUpStatusConfig[followUpKey];

              return (
                <div
                  key={contact._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-4 h-[-webkit-fill-available]"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {contact.fullName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {contact.role || "—"}
                        {contact.company && ` · ${contact.company}`}
                      </p>
                    </div>

                    <div
                      className="relative"
                      ref={(node) => {
                        if (node) menuRefs.current[contact._id] = node;
                      }}
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === contact._id ? null : contact._id)
                        }
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 text-xl leading-none"
                      >
                        ⋮
                      </button>

                      {openMenuId === contact._id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <button
                            onClick={() => {
                              setViewContact(contact);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            View details
                          </button>

                          <button
                            onClick={() => {
                              openModal(<ContactForm contact={contact} />);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setContactToDelete(contact);
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
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge label={contact.status} className={statusColors[contact.status]} />
                    <Badge
                      label={`${contact.priority} priority`}
                      className={priorityColors[contact.priority]}
                    />

                    {followUpCfg && (
                      <Badge
                        label={followUpCfg.label}
                        className={followUpCfg.color}
                        Icon={followUpCfg.icon}
                      />
                    )}

                    <Badge
                      label={
                        contact.campaigns?.length
                          ? contact.campaigns[0].name
                          : "No Campaign Assigned"
                      }
                      className="bg-gray-100 text-gray-600 border-gray-200"
                    />

                    <Badge
                      label={`Score: ${contact.leadScore}`}
                      className="bg-indigo-100 text-indigo-700 border-indigo-200"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {contact.profileUrl && (
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open external profile"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                      >
                        <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                        Profile
                      </a>
                    )}

                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                      <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                      Engage
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4">
                      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Delete contact?
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                          Are you sure you want to delete{" "}
                          <span className="font-medium text-gray-900">
                            {contactToDelete?.fullName}
                          </span>
                          ? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => deleteContact(contactToDelete?._id)}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-600"
                          >
                            Yes, delete
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setContactToDelete(null);
                            }}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View details modal */}
                  {viewContact && (
                    <ContactDetails
                      contact={viewContact}
                      onClose={() => setViewContact(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
