import React from 'react';

function LeadsTable({ leads = [], selectedLeadIds = [], onCheckboxChange }) {
  
  // التحقق من وجود بيانات لتجنب الانهيار
  if (!leads || leads.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg text-center text-slate-400 border border-slate-700">
        No leads available or loading...
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-750 border-b border-slate-700 text-slate-300 text-sm font-semibold">
              <th className="p-4 w-12 text-center">Select</th>
              <th className="p-4">Company</th>
              <th className="p-4">Niche</th>
              <th className="p-4">Location</th>
              <th className="p-4">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-200 text-sm">
            {leads.map((lead) => {
              // تأمين المعرف (ID)
              const leadId = lead.id || lead._id;
              
              // استخراج الحرف الأول من اسم الشركة بأمان لعمل Avatar مصغر دون حدوث Crash
              const companyName = lead.company || "Unknown Company";
              const firstLetter = companyName.trim().charAt(0).toUpperCase() || "?";

              return (
                <tr 
                  key={leadId} 
                  className={`hover:bg-slate-700/50 transition-colors ${
                    selectedLeadIds.includes(leadId) ? 'bg-indigo-600/10' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(leadId)}
                      onChange={() => onCheckboxChange(leadId)}
                      className="w-4 height-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                  </td>
                  <td className="p-4 font-medium flex items-center gap-3">
                    {/* دائرة الـ Avatar الآمنة */}
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                      {firstLetter}
                    </div>
                    <span>{companyName}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="px-2 py-1 bg-slate-700/60 rounded text-xs border border-slate-600/40">
                      {lead.niche || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {lead.location || "Spain"}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {lead.email || "no-email@domain.com"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsTable;