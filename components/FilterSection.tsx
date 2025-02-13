"use client";

interface FilterSectionProps<T extends string> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: T;
  setSortOrder: (order: T) => void;
  sortOptions: { value: T; label: string }[];
  containerClassName?: string;
  placeholder?: string;
  sortLabel?: string;
}

export function FilterSection<T extends string>({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  sortOptions,
  containerClassName = "mb-8 w-[70%] mx-auto",
  placeholder = "Search...",
  sortLabel = "Sort by:",
}: FilterSectionProps<T>) {
  return (
    <div className={containerClassName}>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-500"
            aria-label="Search"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-order" className="text-sm font-medium">
            {sortLabel}
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as T)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
