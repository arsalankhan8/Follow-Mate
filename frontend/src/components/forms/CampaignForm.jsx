// src > components > forms > CampaignForm.jsx

import { useForm } from "react-hook-form";
import API from "../../lib/api";
import { useModal } from "../context/ModalContext.jsx";

export default function CampaignForm() {
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: "planning",
      type: "outreach",
      targetContacts: 0,
    },
  });

  // --------- UI CLASSES ----------
  const labelCls = "block mb-2 text-sm font-medium text-gray-900";

  const inputBase =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400";

  const selectBase =
    inputBase +
    " appearance-none pr-10 bg-[linear-gradient(45deg,transparent_50%,#6b7280_50%),linear-gradient(135deg,#6b7280_50%,transparent_50%),linear-gradient(to_right,transparent,transparent)] " +
    "bg-[length:6px_6px,6px_6px,1px_1.6em] bg-[position:calc(100%-18px)_50%,calc(100%-12px)_50%,0_0] bg-no-repeat";

  const textareaBase =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 min-h-[110px] resize-none";

  const errorText = "mt-2 text-xs text-rose-600";

  const onSubmit = async (data) => {
    try {
      await API.post("/campaigns", data);
      closeModal();
    } catch (err) {
      console.error("Failed to create campaign", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Create New Campaign
      </h2>

      {/* Campaign Name */}
      <div>
        <label className={labelCls}>
          Campaign Name <span className="text-rose-600">*</span>
        </label>
        <input
          {...register("campaignName", {
            required: "Campaign name is required",
          })}
          placeholder="Enter campaign name"
          className={inputBase}
        />
        {errors.campaignName && (
          <p className={errorText}>{errors.campaignName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          {...register("description")}
          placeholder="Write a short description..."
          className={textareaBase}
        />
      </div>

      {/* Status + Type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Status</label>
          <select {...register("status")} className={selectBase}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Type</label>
          <select {...register("type")} className={selectBase}>
            <option value="outreach">Outreach</option>
            <option value="follow">Follow</option>
            <option value="engagement">Engagement</option>
            <option value="content">Content</option>
            <option value="nurture">Nurture</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Start Date</label>
          <input type="date" {...register("startDate")} className={inputBase} />
        </div>

        <div>
          <label className={labelCls}>End Date</label>
          <input type="date" {...register("endDate")} className={inputBase} />
        </div>
      </div>

      {/* Target Contacts */}
      <div>
        <label className={labelCls}>Target Contacts</label>
        <input
          type="number"
          min={0}
          {...register("targetContacts", { valueAsNumber: true })}
          placeholder="0"
          className={inputBase}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={closeModal}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}
