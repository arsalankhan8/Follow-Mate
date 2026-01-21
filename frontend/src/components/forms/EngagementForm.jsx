// components/forms/EngagementsForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../lib/api";
import { useModal } from "../context/ModalContext.jsx";

export default function EngagementForm() {
  const { closeModal } = useModal();
  const [contacts, setContacts] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      contact: "",
      type: "message",
      date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
      outcome: "neutral",
      notes: "",
    },
  });

  useEffect(() => {
    API.get("/contacts")
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));
  }, []);

  const contactOptions = useMemo(() => {
    return contacts.map((c) => ({
      value: c._id,
      label: `${c.fullName}${c.company ? ` — ${c.company}` : ""}`,
    }));
  }, [contacts]);

  const onSubmit = async (data) => {
    try {
      await API.post("/engagements", data);
      window.dispatchEvent(new Event("engagement-created"));
      reset();
      closeModal();
    } catch (err) {
      console.error("Failed to create engagement", err);
    }
  };

  // Tailwind “input” style to match the screenshot
  const inputBase =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 shadow-sm outline-none " +
    "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  const labelBase = "mb-2 block text-sm font-medium text-gray-900";

  const errorText = "mt-1 text-xs text-red-600";

  const SelectChevron = () => (
    <svg
      className="h-4 w-4 text-gray-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.24 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      className="h-4 w-4 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2v3M16 2v3M3.5 9h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 5h11A3 3 0 0 1 20.5 8v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Contact */}
      <div className="mb-4">
        <label className={labelBase}>
          Contact <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            {...register("contact", { required: true })}
            className={`${inputBase} appearance-none pr-10`}
          >
            <option value="" disabled>
              Search or select contact...
            </option>

            {contactOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <SelectChevron />
          </div>
        </div>

        {errors.contact && <p className={errorText}>Contact is required.</p>}
      </div>

      {/* Type + Date row */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Type */}
        <div>
          <label className={labelBase}>
            Type <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              {...register("type", { required: true })}
              className={`${inputBase} appearance-none pr-10`}
            >
              <option value="message">Message</option>
              <option value="comment">Comment</option>
              <option value="like">Like</option>
              <option value="share">Share</option>
              <option value="connection_request">Connection Request</option>
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>

            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <SelectChevron />
            </div>
          </div>

          {errors.type && <p className={errorText}>Type is required.</p>}
        </div>

        {/* Date */}
        <div>
          <label className={labelBase}>
            Date <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            {...register("date", { required: true })}
            className={inputBase}
          />

          {errors.date && <p className={errorText}>Date is required.</p>}
        </div>

      </div>

      {/* Outcome */}
      <div className="mb-4">
        <label className={labelBase}>Outcome</label>

        <div className="relative">
          <select
            {...register("outcome")}
            className={`${inputBase} appearance-none pr-10`}
          >
            <option value="neutral">Neutral</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="no_response_yet">No Response Yet</option>
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <SelectChevron />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className={labelBase}>Notes</label>
        <textarea
          {...register("notes")}
          rows={4}
          placeholder="What happened? What did you discuss?"
          className={inputBase}
        />
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={closeModal}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Log Engagement"}
        </button>
      </div>
    </form>
  );
}
