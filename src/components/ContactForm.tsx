import { useState } from "react";

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
}: {
  fields?: Field[];
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
}) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-4 rounded-xl bg-primary/10 p-6 text-center">
        <p className="font-semibold text-primary">Thank you!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your message has been received. Our team will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
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
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
