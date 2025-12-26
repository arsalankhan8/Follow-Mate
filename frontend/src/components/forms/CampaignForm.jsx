import { useForm } from "react-hook-form";
import { useState } from "react";
import API from "../../lib/api";
import { useModal } from "../../context/ModalContext";

export default function CampaignForm() {
  const { closeModal } = useModal();

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) return;

    const updated = [...tags, tagInput.trim()];
    setTags(updated);

    setValue("tags", updated, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setTagInput("");
  };

  const removeTag = (index) => {
    const updated = tags.filter((_, i) => i !== index);
    setTags(updated);

    setValue("tags", updated, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit = async (data) => {
    try {
      await API.post("/campaigns", data);
      closeModal();
    } catch (err) {
      console.error("Failed to create campaign", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Create Campaign</h2>

      {/* Hidden field for RHF */}
      <input type="hidden" {...register("tags")} />

      <input
        {...register("campaignName", { required: true })}
        placeholder="Campaign Name *"
        className="input"
      />
      {errors.campaignName && (
        <p className="text-red-500">Campaign name is required</p>
      )}

      <textarea
        {...register("description")}
        placeholder="Description"
        className="input"
      />

      <select {...register("status")} className="input">
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="other">Other</option>
      </select>

      <select {...register("type")} className="input">
        <option value="outreach">Outreach</option>
        <option value="follow">Follow</option>
        <option value="engagement">Engagement</option>
        <option value="content">Content</option>
        <option value="nurture">Nurture</option>
        <option value="other">Other</option>
      </select>

      <input type="date" {...register("startDate")} className="input" />
      <input type="date" {...register("endDate")} className="input" />

      {/* TAG INPUT */}
      <div>
        <label className="block mb-1">Tags</label>

        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 bg-gray-200 rounded"
          >
            Add
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="text-sm font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2 text-white"
      >
        {isSubmitting ? "Saving..." : "Create Campaign"}
      </button>
    </form>
  );
}
