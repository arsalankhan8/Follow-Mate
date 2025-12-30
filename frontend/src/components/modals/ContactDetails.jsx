import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

const statusColors = {
  prospect: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  following: "bg-indigo-100 text-indigo-700",
  connected: "bg-emerald-100 text-emerald-700",
  lead: "bg-amber-100 text-amber-700",
  client: "bg-violet-100 text-violet-700",
  inactive: "bg-gray-100 text-gray-700",
};

const priorityColors = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  urgent: "bg-rose-100 text-rose-600",
};

const Badge = ({ label, className }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {label}
  </span>
);

export default function ContactDetails({ contact, onClose }) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{contact.fullName}</h2>
            <p className="text-sm text-gray-500">
              {contact.role || "Developer"}
              {contact.company && ` · ${contact.company}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Status Row */}
          <div className="flex flex-wrap gap-2">
            <Badge
              label={contact.status}
              className={statusColors[contact.status]}
            />
            <Badge
              label={`${contact.priority} priority`}
              className={priorityColors[contact.priority]}
            />
            <Badge
              label={`Score: ${contact.leadScore}`}
              className="bg-indigo-100 text-indigo-700"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            {contact.email && (
              <p className="flex items-center gap-2">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-800">{contact.email}</span>
              </p>
            )}

            {contact.phone && (
              <p className="flex items-center gap-2">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-800">{contact.phone}</span>
              </p>
            )}

            {contact.profileUrl && (
              <p className="flex items-center gap-2">
                <span className="text-gray-500">Profile:</span>
                <a
                  href={contact.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  View LinkedIn
                  <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                </a>
              </p>
            )}
          </div>

          {/* Tags */}
          {contact.tags?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Notes
              </p>
              <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600 whitespace-pre-wrap">
                {contact.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
