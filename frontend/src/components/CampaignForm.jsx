import React from 'react';
import { LuTarget, LuMapPin, LuZap } from 'react-icons/lu';

const CampaignForm = ({ formData, setFormData, onFetchLeads, loading, isAutomating }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl shadow-black/20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Field: Niche */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest">
            Target Niche
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              <LuTarget size={14} />
            </span>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
              placeholder="e.g., Dental Clinic, Accountant"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Field: Location */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest">
            Location / City
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              <LuMapPin size={14} />
            </span>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Beni Mellal, Málaga"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={onFetchLeads}
            disabled={loading || isAutomating}
            className="w-full h-[46px] relative group overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-semibold text-sm text-slate-950 transition-all duration-300 hover:opacity-95 active:scale-[0.98] disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
          >
            <span className="flex items-center justify-center gap-2">
              {loading && !isAutomating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scraping Maps Engine...
                </>
              ) : (
                <>
                  <LuZap size={14} /> Discover Live Leads
                </>
              )}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CampaignForm;
