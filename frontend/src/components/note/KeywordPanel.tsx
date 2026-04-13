interface KeywordPanelProps {
  keywords: string[];
  selected?: string;
  onSelect: (keyword: string) => void;
}

export default function KeywordPanel({ keywords, selected, onSelect }: KeywordPanelProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((kw) => (
        <button
          key={kw}
          onClick={() => onSelect(kw === selected ? '' : kw)}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            kw === selected
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {kw}
        </button>
      ))}
    </div>
  );
}
