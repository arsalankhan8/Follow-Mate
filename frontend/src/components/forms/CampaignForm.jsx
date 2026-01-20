// src > components > forms > CampaignForm.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import API from "../../lib/api";
import { useModal } from "../context/ModalContext.jsx";

export default function CampaignForm({ campaign, onSuccess }) {
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: campaign
      ? {
          campaignName: campaign.campaignName || "",
          description: campaign.description || "",
          status: campaign.status || "planning",
          type: campaign.type || "outreach",
          startDate: campaign.startDate?.slice(0, 10) || "",
          endDate: campaign.endDate?.slice(0, 10) || "",
          targetContacts: campaign.targetContacts || [], // ✅ HERE
        }
      : {
          campaignName: "",
          description: "",
          status: "planning",
          type: "outreach",
          startDate: "",
          endDate: "",
          targetContacts: [], // ✅ HERE
        },
  });

  // ✅ Reset form when editing a different campaign
  useEffect(() => {
    if (campaign) {
      reset({
        campaignName: campaign.campaignName || "",
        description: campaign.description || "",
        status: campaign.status || "planning",
        type: campaign.type || "outreach",
        startDate: campaign.startDate?.slice(0, 10) || "",
        endDate: campaign.endDate?.slice(0, 10) || "",
        targetContacts: campaign.targetContacts || [], // ✅ HERE
      });
    } else {
      reset({
        campaignName: "",
        description: "",
        status: "planning",
        type: "outreach",
        startDate: "",
        endDate: "",
        targetContacts: [], // ✅ HERE
      });
    }
  }, [campaign, reset]);

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

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        targetContacts: Array.isArray(data.targetContacts)
          ? data.targetContacts
          : [],
      };

      if (campaign?._id) {
        await API.put(`/campaigns/${campaign._id}`, payload);
        window.dispatchEvent(new Event("campaign-updated"));
      } else {
        await API.post("/campaigns", payload);
        window.dispatchEvent(new Event("campaign-created"));
      }

      onSuccess?.();
      closeModal();
    } catch (err) {
      console.error("Failed to save campaign", err);
      alert(
        err.response?.data?.message || err.message || "Failed to save campaign."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {campaign ? "Edit Campaign" : "Create New Campaign"}
      </h2>

      {/* Campaign Name */}
      <div>
        <label className={labelCls}>
          Campaign Name <span className="text-rose-600">*</span>
        </label>
        <input
          {...register("campaignName", {
            required: "Campaign name is required",
            maxLength: 80,
          })}
          placeholder="Enter campaign name"
          className={`${inputBase} ${
            errors.campaignName ? "border-red-500 focus:border-red-500" : ""
          }`}
          maxLength={80}
        />
        <div className="flex justify-between text-xs mt-1">
          {errors.campaignName && errors.campaignName.type === "maxLength" && (
            <p className="text-red-500">
              Campaign name cannot exceed 80 characters.
            </p>
          )}
          <p
            className={`${
              (watch("campaignName")?.length || 0) >= 80
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {watch("campaignName")?.length || 0}/80
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label className={labelCls}>Description</label>
        <textarea
          {...register("description", { maxLength: 500 })}
          placeholder="Write a short description..."
          className={`${textareaBase} min-h-[120px] ${
            errors.description ? "border-red-500 focus:border-red-500" : ""
          }`}
          maxLength={500}
        />
        <div className="flex justify-between text-xs mt-1">
          {errors.description && errors.description.type === "maxLength" && (
            <p className="text-red-500">
              Description cannot exceed 500 characters.
            </p>
          )}
          <p
            className={`${
              (watch("description")?.length || 0) >= 500
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {watch("description")?.length || 0}/500
          </p>
        </div>
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
          {...register("targetContacts", {
            valueAsNumber: true,
            min: { value: 0, message: "Cannot be negative" },
          })}
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
          {isSubmitting
            ? campaign
              ? "Updating..."
              : "Creating..."
            : campaign
            ? "Update Campaign"
            : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}