import React, { useState, useEffect } from 'react';
import CampaignForm from '../components/CampaignForm';
import FilterBar from '../components/FilterBar';
import LeadsTable from '../components/LeadsTable';
import ExecutionLogs from "../components/ExecutionLogs";

function HomePage() {
  const [formData, setFormData] = useState({ 
    productName: '', 
    tone: 'Energetic', 
    niche: '', 
    location: '' 
  });
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [bulkReport, setBulkReport] = useState({});
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    const response = await fetch('http://localhost:5000/api/campaigns/leads');
    const data = await response.json();
    if (data.success) {
      setLeads(data.leads);
      setSelectedLeadIds(data.leads.map(l => l.id));
    }
  };

  const handleBulkAutomation = async () => {
    if (!formData.niche || !formData.location) {
      setStatusMessage('Please fill in Niche and Location.');
      return;
    }

    const leadsToSend = leads.filter(lead => selectedLeadIds.includes(lead.id));
    setLoading(true);
    setLogs([]);

    const response = await fetch('http://localhost:5000/api/campaigns/automation-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: formData.niche,
        location: formData.location,
        tone: formData.tone,
        selectedLeads: leadsToSend
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const parsed = JSON.parse(line.replace('data: ', ''));
          setLogs(prev => [...prev, parsed]);
          if (parsed.done) setStatusMessage('Bulk Automation completed successfully!');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Marketing Automation Dashboard</h1>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampaignForm formData={formData} setFormData={setFormData} onLaunch={handleBulkAutomation} loading={loading} />
        <section>
          <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedNiche={selectedNiche} setSelectedNiche={setSelectedNiche} />
          <LeadsTable leads={leads} selectedLeadIds={selectedLeadIds} onCheckboxChange={(id) => setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} />
          <ExecutionLogs logs={logs} />
        </section>
      </main>
    </div>
  );
}
export default HomePage;