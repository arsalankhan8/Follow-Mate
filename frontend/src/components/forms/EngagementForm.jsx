import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../lib/api";
import { useModal } from "../../context/ModalContext";

export default function EngagementForm() {
  const { closeModal } = useModal();
  const [contacts, setContacts] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  // Fetch contacts for dropdown
  useEffect(() => {
    API.get("/contacts")
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Failed to fetch contacts", err));
  }, []);

  const onSubmit = async (data) => {
    try {
      await API.post("/engagements", data);
      closeModal();
    } catch (err) {
      console.error("Failed to create engagement", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <h2 className="text-xl font-semibold">Log Engagement</h2>

      {/* Contact Dropdown */}
      <select
        {...register("contact", { required: true })}
        className="input"
      >
        <option value="">Select Contact *</option>
        {contacts.map((c) => (
          <option key={c._id} value={c._id}>
            {c.fullName} — {c.company || "No Company"}
          </option>
        ))}
      </select>
      {errors.contact && <p className="text-red-500">Contact is required</p>}

      {/* Type */}
      <select {...register("type", { required: true })} className="input">
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

      {/* Date */}
      <input
        type="date"
        {...register("date", { required: true })}
        className="input"
      />
      {errors.date && <p className="text-red-500">Date is required</p>}

      {/* Outcome */}
      <select {...register("outcome")} className="input">
        <option value="neutral">Neutral</option>
        <option value="positive">Positive</option>
        <option value="negative">Negative</option>
        <option value="no_response_yet">No Response Yet</option>
      </select>

      {/* Notes */}
      <textarea {...register("notes")} placeholder="Notes" className="input" />

      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2 text-white"
      >
        {isSubmitting ? "Saving..." : "Log Engagement"}
      </button>
    </form>
  );
}
