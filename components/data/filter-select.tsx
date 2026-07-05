type FilterSelectProps = {
  defaultValue?: string;
  label: string;
  name: string;
  options: string[];
  placeholder: string;
};

export function FilterSelect({
  defaultValue,
  label,
  name,
  options,
  placeholder,
}: FilterSelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        defaultValue={defaultValue ?? ""}
        name={name}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
