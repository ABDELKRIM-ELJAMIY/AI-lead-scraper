import React from 'react';

function LeadsTable({ leads, selectedLeadIds, onCheckboxChange, bulkReport }) {
  if (leads.length === 0) {
    return (
      <div className="flex-1 bg-slate-900 rounded-lg p-8 border border-slate-700 flex items-center justify-center text-slate-500 italic text-sm">
        No leads match your current search filters.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900 rounded-lg p-2 border border-slate-700 overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="p-3 w-10 text-center">Select</th>
            <th className="p-3">Lead Info</th>
            <th className="p-3 text-right">Deployment Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition">
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(lead.id)}
                  onChange={() => onCheckboxChange(lead.id)}
                  className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
              </td>
              <td className="p-3">
                <div className="font-medium text-slate-200">{lead.name}</div>
                <div className="text-xs text-slate-400">
                  {lead.company} • <span className="text-blue-400/80">{lead.niche}</span>
                </div>
              </td>
              <td className="p-3 text-right">
                {bulkReport[lead.id] ? (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    bulkReport[lead.id] === 'Success' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {bulkReport[lead.id]}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600 italic">Idle</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadsTable;