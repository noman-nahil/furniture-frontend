import { splitHighlight } from "@/lib/search/ranking";

type MatchHighlightProps = {
  text: string;
  query: string;
};

export function MatchHighlight({ text, query }: MatchHighlightProps) {
  const parts = splitHighlight(text, query);
  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={`${part.text}-${i}`}
            className="bg-teal-100/80 text-inherit rounded-sm px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${i}`}>{part.text}</span>
        ),
      )}
    </>
  );
}
