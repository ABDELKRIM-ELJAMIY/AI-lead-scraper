import React from 'react';
import { LuUsers, LuClock, LuTrendingUp } from 'react-icons/lu';

const KPICards = ({ leads }) => {
  const totalLeads = leads.length;
  const pendingOutreach = leads.filter(l => l.phone && l.aiMessage).length;
  const conversionRate = totalLeads > 0 ? Math.round((pendingOutreach / totalLeads) * 100) : 0;

  const cards = [
    {
      label: 'Total Leads',
      value: totalLeads,
      Icon: LuUsers,
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Pending Outreach',
      value: pendingOutreach,
      Icon: LuClock,
      iconColor: 'text-amber-500',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      Icon: LuTrendingUp,
      iconColor: 'text-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
        >
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold">{card.label}</p>
            <h3 className="text-2xl font-bold text-white">{card.value}</h3>
          </div>
          <card.Icon className={card.iconColor} size={24} />
        </div>
      ))}
    </div>
  );
};

export default KPICards;
