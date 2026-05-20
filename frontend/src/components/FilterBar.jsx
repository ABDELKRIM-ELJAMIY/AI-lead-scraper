import React from 'react';

function FilterBar({ leads = [], searchTerm, setSearchTerm, selectedNiche, setSelectedNiche }) {
  
  // استخراج الـ Niches الفريدة بأمان باستخدام الاختيار الاختياري (?.) وبديل فارغ
  const uniqueNiches = ['All', ...new Set((leads || []).map(lead => lead.niche).filter(Boolean))];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-slate-800 p-4 rounded-lg">
      {/* خانة البحث */}
      <input
        type="text"
        placeholder="Search leads by company or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-450 focus:outline-none focus:border-indigo-500"
      />

      {/* قائمة الفلترة حسب الـ Niche */}
      <select
        value={selectedNiche}
        onChange={(e) => setSelectedNiche(e.target.value)}
        className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-indigo-500"
      >
        {uniqueNiches.map((niche) => (
          <option key={niche} value={niche}>
            {niche}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;