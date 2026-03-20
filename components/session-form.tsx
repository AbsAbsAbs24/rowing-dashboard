"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type FormState = {
  heart_rate: string;
  split_time: string;
  distance: string;
  session_time: string;
};

const initialFormState: FormState = {
  heart_rate: "",
  split_time: "",
  distance: "",
  session_time: ""
};

function createPhotoPath(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
  const safeExtension = extension && extension.length <= 8 ? extension : "jpg";
  return `sessions/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
}

export function SessionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(field: keyof FormState, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const heartRate = Number(formData.heart_rate);
      const distance = Number(formData.distance);
      const sessionTime = Number(formData.session_time);

      if ([heartRate, distance, sessionTime].some((value) => Number.isNaN(value))) {
        setErrorMessage("Enter valid numeric values before saving.");
        return;
      }

      const supabase = getSupabaseClient();
      let photoUrl: string | null = null;

      if (photoFile) {
        if (!photoFile.type.startsWith("image/")) {
          setErrorMessage("Select a valid image file.");
          return;
        }

        setSubmitPhase("uploading");

        const photoPath = createPhotoPath(photoFile);
        const { error: uploadError } = await supabase.storage
          .from("session-photos")
          .upload(photoPath, photoFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          setErrorMessage(uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from("session-photos").getPublicUrl(photoPath);
        photoUrl = publicUrlData.publicUrl;
      }

      setSubmitPhase("saving");

      const payload = {
        heart_rate: heartRate,
        split_time: formData.split_time.trim(),
        distance,
        session_time: sessionTime,
        photo_url: photoUrl
      };

      const { error } = await supabase.from("sessions").insert(payload);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setFormData(initialFormState);
      setPhotoFile(null);
      setSuccessMessage("Session saved.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save session.");
    } finally {
      setIsSubmitting(false);
      setSubmitPhase("idle");
    }
  }

  return (
    <section className="mb-8 rounded-[2rem] border border-white/[0.08] bg-surface/85 p-6 shadow-glow backdrop-blur-sm">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">New Session</p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Log a rowing session</h2>
        <p className="text-sm text-textMuted">Add the latest workout and refresh the dashboard panels.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-textMuted">Heart Rate</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            required
            value={formData.heart_rate}
            onChange={(event) => handleChange("heart_rate", event.target.value)}
            className="rounded-2xl border border-white/[0.08] bg-surfaceAlt/80 px-4 py-3 text-text outline-none transition focus:border-accent"
            placeholder="148"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-textMuted">Split Time</span>
          <input
            type="text"
            required
            value={formData.split_time}
            onChange={(event) => handleChange("split_time", event.target.value)}
            className="rounded-2xl border border-white/[0.08] bg-surfaceAlt/80 px-4 py-3 text-text outline-none transition focus:border-accent"
            placeholder="1:47"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-textMuted">Distance</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            required
            value={formData.distance}
            onChange={(event) => handleChange("distance", event.target.value)}
            className="rounded-2xl border border-white/[0.08] bg-surfaceAlt/80 px-4 py-3 text-text outline-none transition focus:border-accent"
            placeholder="12000"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-textMuted">Session Time</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            required
            value={formData.session_time}
            onChange={(event) => handleChange("session_time", event.target.value)}
            className="rounded-2xl border border-white/[0.08] bg-surfaceAlt/80 px-4 py-3 text-text outline-none transition focus:border-accent"
            placeholder="52"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
          <span className="text-xs uppercase tracking-[0.2em] text-textMuted">Session Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            className="rounded-2xl border border-white/[0.08] bg-surfaceAlt/80 px-4 py-3 text-sm text-textMuted file:mr-4 file:rounded-xl file:border-0 file:bg-accentStrong file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-accent"
          />
          <p className="text-xs text-textMuted">
            Optional. Uploaded to the <code>session-photos</code> bucket.
          </p>
        </label>

        <div className="md:col-span-2 xl:col-span-4 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-6 text-sm">
            {errorMessage ? <p className="text-rose-300">{errorMessage}</p> : null}
            {!errorMessage && successMessage ? <p className="text-success">{successMessage}</p> : null}
            {!errorMessage && !successMessage && isSubmitting ? (
              <p className="text-textMuted">
                {submitPhase === "uploading" ? "Uploading photo..." : "Saving session..."}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-accentStrong px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (submitPhase === "uploading" ? "Uploading..." : "Saving...") : "Save Session"}
          </button>
        </div>
      </form>
    </section>
  );
}
