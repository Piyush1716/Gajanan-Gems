import { useState } from "react";
import { toast } from "sonner";
import { submitContact } from "@/services/api";

type Field = { name: string; label: string; type?: string; required?: boolean };

export function ContactForm({
  fields = [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Mobile Number", type: "tel" },
  ],
  messageLabel = "Message",
  messagePlaceholder = "How can we help you?",
  submitLabel = "Submit",
  inquiryType,
}: {
  fields?: Field[];
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  inquiryType?: string;
}) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (sent) {
    return (
      <div className="mt-4 rounded-xl bg-primary/10 p-6 text-center">
        <p className="font-semibold text-primary">Thank you! 🎉</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your message has been received. Our team will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};
    formData.forEach((val, key) => {
      payload[key] = val.toString();
    });

    // Check content-type to avoid crash if API isn't available in dev mode
    try {
      const { data, error } = await submitContact({
        name: payload["name"] ?? "",
        email: payload["email"] ?? "",
        phone: payload["phone"] ?? "",
        message: payload["message"] ?? "",
        inquiryType: inquiryType,
      });

      if (error || !data?.success) {
        toast.error(error ?? "Failed to send message. Please try again.");
        return;
      }

      setSent(true);
      toast.success("Message sent! We'll be in touch soon.");
    } catch (err) {
      console.error("[ContactForm] fetch error:", err);
      toast.error("Network error. Please email us directly at hello@gajanangems.com");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-foreground">
            {f.label} {f.required && <span className="text-primary">*</span>}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            required={f.required}
            disabled={submitting}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>
      ))}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">
          {messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={messagePlaceholder}
          disabled={submitting}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
