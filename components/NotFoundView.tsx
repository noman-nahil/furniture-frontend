import Link from "next/link";

export function NotFoundView() {
  return (
    <div className="bg-[#FAFAF8]">
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-[#B8935A]/70 to-transparent" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
            Erreur 404
          </span>
        </div>
        <h1 className="font-serif text-[1.75rem] sm:text-3xl font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
          Page introuvable
        </h1>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6560]">
          Cette page n’existe pas ou a été déplacée. Vérifiez l’adresse ou
          retournez à l’accueil.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex min-w-[180px] items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Retour à l’accueil
          </Link>
          <Link
            href="/products"
            className="inline-flex min-w-[180px] items-center justify-center rounded-xl border border-[#E8E2D9] bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B8935A]/45 hover:text-[#B8935A]"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
