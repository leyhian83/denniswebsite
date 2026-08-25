import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

type FormState = "idle" | "submitting" | "success";

interface ContactFormProps {
  /** Optional subject that prefills the "Property / Project" field. */
  subjectLabel?: string;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormValues = { name: "", phone: "", email: "", subject: "", message: "" };

export function ContactForm({ subjectLabel }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>({ ...EMPTY, subject: subjectLabel ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [state, setState] = useState<FormState>("idle");

  const set = (key: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    // Clear an error as soon as the field is corrected.
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.phone.trim()) next.phone = "Please enter a phone number.";
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.subject.trim()) next.subject = "Please specify the property or project.";
    if (!values.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setState("submitting");
    // Simulate an async API call. No network request is made.
    window.setTimeout(() => {
      setState("success");
    }, 900);
  };

  if (state === "success") {
    return (
      <div className="contact-form__success" role="status">
        <CheckCircle2 size={40} aria-hidden="true" />
        <h3 className="contact-form__success-title">Enquiry sent</h3>
        <p className="contact-form__success-text">
          Thank you, {values.name.split(" ")[0]}. Your enquiry has been received and I&apos;ll
          get back to you shortly. In the meantime, feel free to reach out on WhatsApp.
        </p>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            setValues({ ...EMPTY, subject: subjectLabel ?? "" });
            setState("idle");
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="cf-name">Name *</label>
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cf-name-err" : undefined}
          />
          {errors.name && (
            <span className="contact-form__error" id="cf-name-err">{errors.name}</span>
          )}
        </div>
        <div className="contact-form__field">
          <label htmlFor="cf-phone">Phone *</label>
          <input
            id="cf-phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "cf-phone-err" : undefined}
          />
          {errors.phone && (
            <span className="contact-form__error" id="cf-phone-err">{errors.phone}</span>
          )}
        </div>
      </div>

      <div className="contact-form__field">
        <label htmlFor="cf-email">Email *</label>
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "cf-email-err" : undefined}
        />
        {errors.email && (
          <span className="contact-form__error" id="cf-email-err">{errors.email}</span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="cf-subject">Property / Project *</label>
        <input
          id="cf-subject"
          type="text"
          value={values.subject}
          onChange={set("subject")}
          placeholder={subjectLabel ?? "e.g. The Meridian Residence, Serenia Towers…"}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "cf-subject-err" : undefined}
        />
        {errors.subject && (
          <span className="contact-form__error" id="cf-subject-err">{errors.subject}</span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="cf-message">Message *</label>
        <textarea
          id="cf-message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          placeholder="Tell me what you're looking for…"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
        />
        {errors.message && (
          <span className="contact-form__error" id="cf-message-err">{errors.message}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--lg"
        disabled={state === "submitting"}
      >
        <Send size={16} aria-hidden="true" />
        {state === "submitting" ? "Sending…" : "Submit Enquiry"}
      </button>
    </form>
  );
}
