"use client";

import { useState, type FormEvent } from "react";
import { getMetaCapiContext } from "@/lib/analytics/metaBrowser";
import { trackSubscribedButtonClick } from "@/lib/analytics/events";
import { submitContact } from "../api/contactApi";

const inputClass =
  "w-full rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#A09080] transition-shadow focus:border-[#B8935A] focus:outline-none focus:ring-2 focus:ring-[#B8935A]/20";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6560]";

const INITIAL = {
  name: "",
  phone: "",
  email: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: keyof typeof INITIAL, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const name = values.name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    const message = values.message.trim();

    if (name.length < 2) {
      setError("Veuillez indiquer votre nom.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 6) {
      setError("Veuillez indiquer un numéro de téléphone valide.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez indiquer une adresse e-mail valide.");
      return;
    }
    if (message.length < 10) {
      setError("Votre message doit contenir au moins 10 caractères.");
      return;
    }

    setLoading(true);
    setSuccess("");
    const meta = getMetaCapiContext();
    const result = await submitContact({
      name,
      phone,
      email,
      message,
      website: values.website,
      meta: meta ?? undefined,
    });
    setLoading(false);

    if (result.success) {
      if (meta) {
        trackSubscribedButtonClick({ eventId: meta.event_id });
      }
      setValues(INITIAL);
      setSuccess(result.message);
      return;
    }

    setError(result.message);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-[#A7D7B8] bg-[#F0FAF4] px-5 py-8 sm:px-7 text-center">
        <p className="font-serif text-lg font-semibold text-[#1A3D2B]">
          Message envoyé
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#1A3D2B]/80">
          {success}
        </p>
        <button
          type="button"
          onClick={() => setSuccess("")}
          className="mt-5 text-sm font-medium text-[#2D6A4F] underline decoration-[#A7D7B8] underline-offset-2 hover:text-[#1A3D2B]"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
      <div className="sr-only" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Nom
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Nom"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          Téléphone
        </label>
        <input
          id="contact-phone"
          name="tel"
          type="tel"
          autoComplete="tel"
          required
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder="Numéro de téléphone"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="Adresse Email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          placeholder="écrire un message"
          className={`${inputClass} min-h-[140px] resize-y`}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-[#F5C0BB] bg-[#FDF2F2] px-4 py-3 text-sm text-[#7A1F1F]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
