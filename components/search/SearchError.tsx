import type { SuggestErrorKind } from "@/lib/search/types";

type SearchErrorProps = {
  kind: SuggestErrorKind;
  message: string;
  onRetry: () => void;
};

function titleFor(kind: SuggestErrorKind): string {
  if (kind === "timeout") return "Search timed out";
  if (kind === "network") return "Connection problem";
  if (kind === "server") return "Search unavailable";
  return "Something went wrong";
}

export function SearchError({ kind, message, onRetry }: SearchErrorProps) {
  return (
    <div className="px-3 py-3.5 text-sm">
      <p className="font-medium text-gray-800">{titleFor(kind)}</p>
      <p className="mt-1 text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2.5 text-sm font-semibold text-teal-800 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
      >
        Try again
      </button>
    </div>
  );
}
