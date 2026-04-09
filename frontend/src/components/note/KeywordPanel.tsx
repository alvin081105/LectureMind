interface KeywordPanelProps {
  keywords: string[];
  selected?: string;
  onSelect: (keyword: string) => void;
}

export default function KeywordPanel({ keywords, selected, onSelect }: KeywordPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">핵심 키워드</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <button
            key={kw}
            onClick={() => onSelect(kw === selected ? '' : kw)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              kw === selected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
