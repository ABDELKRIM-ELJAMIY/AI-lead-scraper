import React, { useState } from 'react';
import CampaignForm from '../components/CampaignForm';
import LeadsTable from '../components/LeadsTable';

function HomePage() {
  const [formData, setFormData] = useState({ niche: '', location: '', tone: 'professional but friendly' });
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to scrape and automate.');

  // 1. جلب البيانات الحقيقية من جوجل مابس عبر السيرفر
  const handleFetchLeads = async () => {
    setLoading(true);
    setStatusMessage('Scraping live data from Google Maps via SerpApi...');
    setLogs([]);

    try {
      const response = await fetch(
        `http://localhost:5000/api/campaigns/leads?niche=${encodeURIComponent(formData.niche)}&location=${encodeURIComponent(formData.location)}`
      );
      const data = await response.json();

      if (data.success && data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setSelectedLeadIds(data.leads.map((l) => l.id)); // تحديد الكل تلقائياً تسهيلاً للمستخدم
        setStatusMessage(`Successfully pulled ${data.leads.length} live leads from Google Maps!`);
      } else {
        setLeads([]);
        setStatusMessage('No businesses found for this query. Try another niche/location.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Error fetching leads from server.');
    } finally {
      setLoading(false);
    }
  };

  // 2. معالجة الـ Checkbox الفردي للشركات في الجدول
  const handleCheckboxChange = (leadId) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // 3. إطلاق محرك الأتمتة والـ Streaming (SSE)
  const handleLaunchCampaign = async () => {
    const filteredLeads = leads.filter((l) => selectedLeadIds.includes(l.id));

    if (filteredLeads.length === 0) {
      setStatusMessage('Please select at least one lead to launch the campaign.');
      return;
    }

    setLoading(true);
    setLogs([]);
    setStatusMessage('Initializing AI Copywriting and Email Delivery engines...');

    try {
     const response = await fetch('http://localhost:5000/api/campaigns/automation-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: formData.niche,
          location: formData.location,
          tone: formData.tone,
          selectedLeads: filteredLeads,
        }),
      });

      // إعداد الـ Reader لقراءة الـ SSE Stream حياً من السيرفر
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        lines.forEach((line) => {
          if (line.startsWith('data: ')) {
            try {
              const logData = JSON.parse(line.replace('data: ', ''));
              setLogs((prev) => [logData, ...prev]); // إظهار اللوج الأحدث في الأعلى
              if (logData.status === 'done') {
                setStatusMessage('🎉 Campaign Completed Successfully!');
              }
            } catch (e) {
              // خطأ بسيط في القراءة الجزئية للـ chunk، نتجاهله لاستمرار الـ stream
            }
          }
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Automation failed or stream interrupted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-700/60 pb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          The SaaS Founder’s Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">AI Lead Generation & Automated Cold Outreach System</p>
      </div>

      {/* Config Form */}
      <CampaignForm
        formData={formData}
        setFormData={setFormData}
        onFetchLeads={handleFetchLeads}
        onLaunchCampaign={handleLaunchCampaign}
        loading={loading}
      />

      {/* Status Bar */}
      <div className="bg-slate-850 border border-slate-700/40 p-3 rounded text-xs text-indigo-400 font-mono mb-6 flex items-center gap-2">
        <span className="animate-pulse">🟢</span> Status: {statusMessage}
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Interactive Leads Table */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            📋 Targets Found <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-indigo-300">{leads.length}</span>
          </h4>
          <LeadsTable
            leads={leads}
            selectedLeadIds={selectedLeadIds}
            onCheckboxChange={handleCheckboxChange}
          />
        </div>

        {/* Right: Live Console Terminal logs */}
        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            🖥️ Live Automation Console
          </h4>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs text-slate-300 shadow-inner flex flex-col gap-2">
            {logs.length === 0 && (
              <div className="text-slate-500 italic">Logs will stream here in real-time...</div>
            )}
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-1.5 rounded ${
                  log.status === 'success' ? 'text-green-400 bg-green-950/20' :
                  log.status === 'error' ? 'text-red-400 bg-red-950/25' :
                  log.status === 'processing' ? 'text-cyan-400' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;