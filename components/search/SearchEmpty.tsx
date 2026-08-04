type SearchEmptyProps = {
  query: string;
};

export function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="px-3 py-3.5 text-sm">
      <p className="font-medium text-gray-800">No quick matches</p>
      <p className="mt-1 text-gray-500 leading-relaxed">
        Nothing matched &ldquo;{query}&rdquo; in suggestions. Use{" "}
        <span className="font-medium text-gray-700">View all results</span> below
        to search the full catalog.
      </p>
    </div>
  );
}
