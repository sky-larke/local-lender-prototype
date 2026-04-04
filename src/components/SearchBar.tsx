interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        Search nearby items
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Search drills, bikes, basketballs..."
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
      />
    </label>
  );
};
