import React from 'react';

function FilterBar({ searchTerm, setSearchTerm, selectedNiche, setSelectedNiche, niches, onSelectAll, onDeselectAll }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* شريط البحث النصي */}
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-400">Search Leads</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or company..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* قائمة تصفية المجالات */}
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-400">Filter by Niche</label>
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Niches</option>
            {niches.map((niche) => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </div>
      </div>

      {/* أزرار التحكم السريع */}
      <div className="flex gap-2 pt-1 border-t border-slate-700/50 justify-end">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-slate-200 transition"
        >
          Select All Filtered
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-slate-200 transition"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}

export default FilterBar;