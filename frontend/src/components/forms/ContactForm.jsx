import { useForm } from "react-hook-form";
import API from "../../lib/api";
import { useModal } from "../context/ModalContext.jsx";

export default function ContactForm() {
  const { closeModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log("Submitting contact data:", data);
      const response = await API.post("/contacts", data);
      console.log("Contact created successfully:", response.data);
      closeModal();
      // Trigger a refresh of the contacts list
      window.dispatchEvent(new Event("contacts-updated"));
    } catch (err) {
      console.error("Failed to create contact:", err);
      console.error("Error response:", err.response?.data);
      
      // Show detailed error message
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || "Failed to create contact. Please try again.";
      
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-lg font-semibold">Add Contact</h2>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName", { required: true })}
            className="input"
          />
        </div>

        {/* Profile URL */}
        <div>
          <label className="block text-sm mb-1">Profile URL</label>
          <input
            {...register("profileUrl")}
            placeholder="https://linkedin.com/in/..."
            className="input"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm mb-1">Role</label>
          <input {...register("role")} className="input" />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm mb-1">Company</label>
          <input {...register("company")} className="input" />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select {...register("status")} className="input" defaultValue="">
            <option value="">Select status...</option>
            <option value="prospect">Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="following">Following</option>
            <option value="connected">Connected</option>
            <option value="lead">Lead</option>
            <option value="client">Client</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm mb-1">Priority</label>
          <select {...register("priority")} className="input" defaultValue="">
            <option value="">Select priority...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Campaign */}
        <div>
          <label className="block text-sm mb-1">
            Campaign <span className="text-gray-400">(Optional)</span>
          </label>
          <select className="input">
            <option>Select campaign...</option>
          </select>
        </div>

        {/* Lead Score */}
        <div>
          <label className="block text-sm mb-1">Lead Score (0–100)</label>
          <input type="number" {...register("leadScore")} className="input" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input {...register("email")} className="input" />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input {...register("phone")} className="input" />
        </div>

        {/* Last Contact */}
        <div>
          <label className="block text-sm mb-1">Last Contact Date</label>
          <input
            type="date"
            {...register("lastContactDate")}
            className="input"
          />
        </div>

        {/* Next Follow-up */}
        <div>
          <label className="block text-sm mb-1">Next Follow-up Date</label>
          <input
            type="date"
            {...register("nextFollowUpDate")}
            className="input"
          />
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Tags</label>
          <div className="flex gap-2">
            <input
              {...register("tags")}
              placeholder="Add a tag..."
              className="input flex-1"
            />
            <button type="button" className="rounded-md border px-4 text-sm">
              Add
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Notes</label>
          <textarea {...register("notes")} className="input min-h-[120px]" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={closeModal}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white"
        >
          Add Contact
        </button>
      </div>
    </form>
  );
}
