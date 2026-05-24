import React, { useState } from 'react';
import CampaignForm from '../components/CampaignForm';
import LeadsTable from '../components/LeadsTable';
import LiveConsole from '../components/LiveConsole';
import KPICards from '../components/KPICards';

const Dashboard = () => {
  const [formData, setFormData] = useState({ niche: '', location: '', tone: '' });
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to discover new leads.');
  const [logs, setLogs] = useState([]);

  const handleFetchLeads = async () => {
    if (!formData.niche || !formData.location) return alert('Please enter both niche and location.');

    setLoading(true);
    setLeads([]);
    setSelectedLeadIds([]);
    setLogs([]);
    setStatusMessage('🔍 Scraping live data from Google Maps...');

    try {
      const queryParams = `niche=${encodeURIComponent(formData.niche)}&location=${encodeURIComponent(formData.location)}`;
      const response = await fetch(`http://localhost:5000/api/campaigns/leads?${queryParams}`);
      const data = await response.json();

      if (data.success && data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setSelectedLeadIds(data.leads.map(l => l.id));
        setStatusMessage(`🎉 Successfully fetched ${data.leads.length} leads with AI messages!`);
      } else {
        setStatusMessage('❌ No businesses found for this query.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('🚨 Error fetching leads from server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedLeadIds(selectedLeadIds.length === leads.length ? [] : leads.map(l => l.id));
  };

  const handleLaunchCampaign = async () => {
    const selectedLeadsData = leads.filter(l => selectedLeadIds.includes(l.id));
    if (selectedLeadsData.length === 0) return alert('Please select at least one lead.');

    setIsAutomating(true);
    setLogs([]);
    setStatusMessage('🚀 Initializing AI Email Campaign...');

    try {
      const response = await fetch('http://localhost:5000/api/campaigns/trigger-bulk-sse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selectedLeads: selectedLeadsData })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonString = trimmedLine.replace('data: ', '').trim();
                const logData = JSON.parse(jsonString);
                setLogs(prev => [...prev, logData]);

                if (logData.status === 'done') setStatusMessage('🎉 Bulk outreach campaign completed!');
              } catch (e) {
                console.warn('Skipping partial SSE line:', trimmedLine);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('🚨 Automation failed or stream interrupted.');
    } finally {
      setIsAutomating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-sm font-bold text-slate-950">A</span>
              </div>
              <span className="text-base font-semibold text-slate-200 tracking-tight">
                AutoOutreach
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                isAutomating
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
              }`}>
                {isAutomating ? '● Running' : '● Idle'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl mb-3">
            AI Lead Generation Dashboard
          </h1>
          <p className="max-w-xl mx-auto text-base text-slate-500 leading-relaxed">
            Discover local businesses, generate personalized AI messages, and automate your outreach pipeline.
          </p>
        </div>

        {/* Campaign Form */}
        <CampaignForm
          formData={formData}
          setFormData={setFormData}
          onFetchLeads={handleFetchLeads}
          loading={loading}
          isAutomating={isAutomating}
        />

        {/* KPI Cards */}
        <KPICards leads={leads} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Table */}
          <LeadsTable
            leads={leads}
            selectedLeadIds={selectedLeadIds}
            onToggleSelect={toggleSelectLead}
            onToggleSelectAll={toggleSelectAll}
            onLaunchCampaign={handleLaunchCampaign}
            isAutomating={isAutomating}
          />

          {/* Live Console */}
          <LiveConsole logs={logs} isAutomating={isAutomating} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
