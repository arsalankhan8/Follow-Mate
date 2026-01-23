// frontend > src > components > forms > ContactForm.jsx
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useModal } from "../context/ModalContext.jsx";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export default function ContactForm({ contact }) {
  const { closeModal } = useModal();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: contact
      ? {
        fullName: contact.fullName,
        profileUrl: contact.profileUrl,
        role: contact.role,
        company: contact.company,
        status: contact.status,
        priority: contact.priority,
        leadScore: contact.leadScore,
        email: contact.email,
        phone: contact.phone,

        // ✅ tags as array of objects for useFieldArray
        tags: (contact.tags || []).map((t) => ({ value: t })),

        notes: contact.notes,
        lastContactDate: contact.lastContactDate?.slice(0, 10),
        nextFollowUpDate: contact.nextFollowUpDate?.slice(0, 10),
   campaignId: contact?.campaigns?.[0]?._id || "",

      }
      : {
        tags: [],
      },
  });

  const [tagInput, setTagInput] = useState("");

  const {
    fields: tagFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "tags",
  });

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;

    const current = watch("tags") || [];

    //  limit: max 3 tags
    if (current.length >= 3) {
      setTagInput("");
      return;
    }

    const exists = current.some(
      (t) => (t?.value || "").toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      setTagInput("");
      return;
    }

    append({ value });
    setTagInput("");
  };

  const onTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  useEffect(() => {
    if (contact) {
      reset({
        fullName: contact.fullName,
        profileUrl: contact.profileUrl,
        role: contact.role,
        company: contact.company,
        status: contact.status,
        priority: contact.priority,
        leadScore: contact.leadScore,
        email: contact.email,
        phone: contact.phone,

        // ✅ reset tags correctly
        tags: (contact.tags || []).map((t) => ({ value: t })),

        notes: contact.notes,
        lastContactDate: contact.lastContactDate?.slice(0, 10),
        nextFollowUpDate: contact.nextFollowUpDate?.slice(0, 10),
     campaignId: contact?.campaigns?.[0]?._id || "",

      });
    }
  }, [contact, reset]);


  const queryClient = useQueryClient();

  const saveContactMutation = useMutation({
    mutationFn: async (payload) => {
      if (contact?._id) {
        return API.put(`/contacts/${contact._id}`, payload);
      }
      return API.post("/contacts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      closeModal();
    },
  });

const onSubmit = async (data) => {
  try {
    const payload = {
      ...data,
      tags: (data.tags || []).map((t) => t?.value?.trim()).filter(Boolean),
      campaigns: data.campaignId ? [data.campaignId] : [],
    };

    delete payload.campaignId;

    await saveContactMutation.mutateAsync(payload);
    window.dispatchEvent(new Event("contacts-updated"));
  } catch (err) {
    const errorMessage =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to save contact.";
    alert(errorMessage);
  }
};


  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await API.get("/campaigns");
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });


  const tagsLimitReached = tagFields.length >= 3;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {contact ? "Edit Contact" : "Add Contact"}
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName", { required: true, maxLength: 50 })}
            className={`input ${errors.fullName ? "border-red-500 focus:border-red-500" : ""
              }`}
            maxLength={50}
            placeholder="Enter full name"
          />
          <div className="flex justify-between text-xs mt-1">
            {errors.fullName && errors.fullName.type === "maxLength" && (
              <p className="text-red-500">
                Full Name cannot exceed 50 characters.
              </p>
            )}
            <p
              className={`${(watch("fullName")?.length || 0) >= 50
                ? "text-red-500"
                : "text-gray-400"
                }`}
            >
              {watch("fullName")?.length || 0}/50
            </p>
          </div>
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
          <input
            {...register("company", { maxLength: 100 })}
            className={`input ${errors.company ? "border-red-500 focus:border-red-500" : ""
              }`}
            maxLength={100}
            placeholder="Enter company"
          />
          <div className="flex justify-between text-xs mt-1">
            {errors.company && errors.company.type === "maxLength" && (
              <p className="text-red-500">
                Company cannot exceed 100 characters.
              </p>
            )}
            <p className="text-gray-400">{watch("company")?.length || 0}/100</p>
          </div>
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

          <select
            {...register("campaignId")}
            className="input"
            disabled={campaignsLoading}
          >
            <option value="">
              {campaignsLoading ? "Loading campaigns..." : "Select campaign..."}
            </option>

{campaigns.map((c) => (
  <option key={c._id} value={c._id}>
    {c.campaignName}
  </option>
))}

          </select>
        </div>

        {/* Lead Score */}
        <div>
          <label className="block text-sm mb-1">Lead Score (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            {...register("leadScore", {
              valueAsNumber: true,
              min: 0,
              max: 100,
            })}
            className="input"
          />
          {watch("leadScore") > 100 && (
            <p className="text-red-500 text-sm">Max allowed is 100</p>
          )}
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
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              placeholder="Add a tag..."
              disabled={tagsLimitReached}
              className="input flex-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tagsLimitReached}
              className="rounded-md border px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Pills */}
          {tagFields.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tagFields.map((tag, index) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 border border-indigo-100"
                >
                  {tag.value}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-indigo-500 hover:text-indigo-800"
                    aria-label={`Remove tag ${tag.value}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {tagsLimitReached && (
            <p className="mt-2 text-xs text-gray-500">
              You can add up to 3 tags only.
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            {...register("notes", { maxLength: 500 })}
            className={`input min-h-[120px] ${errors.notes ? "border-red-500 focus:border-red-500" : ""
              }`}
            maxLength={500}
            placeholder="Add notes..."
          />
          <div className="flex justify-between text-xs mt-1">
            {errors.notes && errors.notes.type === "maxLength" && (
              <p className="text-red-500">
                Notes cannot exceed 500 characters.
              </p>
            )}
            <p
              className={`${(watch("notes")?.length || 0) >= 500
                ? "text-red-500"
                : "text-gray-400"
                }`}
            >
              {watch("notes")?.length || 0}/500
            </p>
          </div>
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
          {contact ? "Update Contact" : "Add Contact"}
        </button>
      </div>
    </form>
  );
}
