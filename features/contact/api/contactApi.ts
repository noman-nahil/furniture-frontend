import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";

export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
  website?: string;
};

export type ContactSubmitResult = {
  success: boolean;
  message: string;
};

function parseApiMessage(data: unknown, fallback: string): string {
  const payload = data as { error?: unknown; message?: unknown } | null;
  if (payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }
  if (payload && typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  return fallback;
}

export async function submitContact(
  payload: ContactPayload,
): Promise<ContactSubmitResult> {
  const base = getClientApiBaseUrl();
  if (!base) {
    return {
      success: false,
      message:
        "Le formulaire n’est pas disponible pour le moment. Écrivez-nous à meublesdeparis@gmail.com.",
    };
  }

  try {
    const res = await fetch(joinApiUrl(base, "/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        message:
          parseApiMessage(data, "Merci, votre message a bien été envoyé."),
      };
    }
    return {
      success: false,
      message: parseApiMessage(
        data,
        "Impossible d’envoyer le message. Réessayez ou contactez-nous par téléphone.",
      ),
    };
  } catch {
    return {
      success: false,
      message:
        "Erreur réseau. Vérifiez votre connexion ou contactez-nous par téléphone.",
    };
  }
}
