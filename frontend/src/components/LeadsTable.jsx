import React, { useState } from 'react';
import { LuGlobe, LuSend, LuCopy, LuCheck, LuUsers, LuClock, LuTrendingUp } from 'react-icons/lu';

const LeadsTable = ({ leads, selectedLeadIds, onToggleSelect, onToggleSelectAll, onLaunchCampaign, isAutomating }) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = async (text, leadId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(leadId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy message');
    }
  };

  const getWhatsappUrl = (lead) => {
    if (!lead.phone || !lead.aiMessage) return '';
    const phone = lead.phone.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(lead.aiMessage)}`;
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-200 uppercase tracking-wider">
            Scraped Targets
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {leads.length}
          </span>
        </div>
        {leads.length > 0 && (
          <button
            onClick={onLaunchCampaign}
            disabled={isAutomating || selectedLeadIds.length === 0}
            className="px-4 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 transition-colors uppercase tracking-wider"
          >
            Launch {selectedLeadIds.length} Campaigns
          </button>
        )}
      </div>

      {/* Body */}
      <div className="overflow-x-auto">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <LuUsers className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-400">No targets loaded</p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs text-center">
              Enter your niche and location criteria above, then click discover to find leads with AI-powered messages.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800/60">
                <th className="px-4 py-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === leads.length}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-emerald-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  AI Message Preview
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.map((lead) => {
                const waUrl = getWhatsappUrl(lead);
                return (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={() => onToggleSelect(lead.id)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium text-sm max-w-[180px] truncate">
                      {lead.company}
                    </td>
                    <td className="px-4 py-3">
                      {lead.site ? (
                        <a
                          href={lead.site}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 bg-slate-800 hover:bg-emerald-900/50 text-slate-400 hover:text-emerald-400 rounded-lg transition-all border border-slate-700"
                          title="Visit Website"
                        >
                          <LuGlobe size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate max-w-[200px]">
                      {lead.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[260px] truncate" title={lead.aiMessage || ''}>
                      {lead.aiMessage ? (
                        <span className="text-slate-300 leading-relaxed">{lead.aiMessage}</span>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lead.phone && lead.aiMessage ? (
                          <>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              title="Open WhatsApp"
                            >
                              <LuSend size={12} /> Chat
                            </a>
                            <button
                              onClick={() => copyToClipboard(lead.aiMessage, lead.id)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all"
                              title="Copy message"
                            >
                              {copiedId === lead.id ? (
                                <LuCheck size={14} className="text-emerald-400" />
                              ) : (
                                <LuCopy size={14} />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-700 text-[10px] italic">No data</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;
