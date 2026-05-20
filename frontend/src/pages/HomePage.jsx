import React, { useState, useEffect } from 'react';
import CampaignForm from '../components/CampaignForm';
import FilterBar from '../components/FilterBar';
import LeadsTable from '../components/LeadsTable';
import ExecutionLogs from "../components/ExecutionLogs";
function HomePage() {
  const [formData, setFormData] = useState({ productName: '', tone: 'Energetic' });
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [bulkReport, setBulkReport] = useState({});
  const [logs, setLogs] = useState([]);

  // States الخاصة بالفلترة والبحث المتقدم
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/leads');
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
        setSelectedLeadIds(data.leads.map(l => l.id)); // تحديد الكل في البداية
      }
    } catch (error) {
      setStatusMessage('Failed to load leads from server.');
    }
  };

  // 1. منطق الفلترة الحي (Live Filtering Logic)
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = selectedNiche === 'All' || lead.niche === selectedNiche;
    return matchesSearch && matchesNiche;
  });

  // استخراج قائمة المجالات الفريدة ديناميكياً لبناء الـ Dropdown
  const niches = [...new Set(leads.map((l) => l.niche))];

  // 2. التحكم بأزرار التحديد والالغاء السريع
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredLeads.map(l => l.id);
    // دمج المحدد مسبقاً مع المحدد حالياً لمنع فقدان البيانات خارج الفلتر
    setSelectedLeadIds([...new Set([...selectedLeadIds, ...filteredIds])]);
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = filteredLeads.map(l => l.id);
    setSelectedLeadIds(selectedLeadIds.filter(id => !filteredIds.includes(id)));
  };

  const handleCheckboxChange = (leadId) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter(id => id !== leadId));
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId]);
    }
  };

  // 3. دالة إطلاق الحملة وقراءة الـ Stream حياً
  const handleBulkAutomation = async () => {
    if (!formData.productName) {
      setStatusMessage('Please enter a product name before running automation.');
      return;
    }

    const leadsToSend = leads.filter(lead => selectedLeadIds.includes(lead.id));
    if (leadsToSend.length === 0) {
      setStatusMessage('Please select at least one lead to run automation.');
      return;
    }

    setLoading(true);
    setStatusMessage('Initiating live pipeline stream...');
    setLogs([]); // تصفية التيرمنال القديم
    setBulkReport({});

    try {
      const response = await fetch('http://localhost:5000/api/campaigns/automation-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName,
          tone: formData.tone,
          selectedLeads: leadsToSend
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // الاحتفاظ بالسطر غير المكتمل

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.replace('data: ', '').trim();
            if (!jsonString) continue;

            const parsed = JSON.parse(jsonString);

            // التحقق من نهاية البث
            if (parsed.done) {
              setStatusMessage('Bulk Automation completed successfully!');
              const reportObj = {};
              parsed.report.forEach(item => { reportObj[item.leadId] = item.status; });
              setBulkReport(reportObj);
            } else {
              // إضافة السجل الجديد إلى التيرمنال
              setLogs(prev => [...prev, parsed]);

              // تحديث حالة الجدول بشكل حي أثناء المعالجة!
              if (parsed.leadId) {
                setBulkReport(prev => ({
                  ...prev,
                  [parsed.leadId]: parsed.status === 'success' ? 'Success' : (parsed.status === 'error' ? 'Failed' : 'Processing...')
                }));
              }
            }
          }
        }
      }

    } catch (error) {
      setStatusMessage('Network error during streaming pipeline.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Marketing Automation Dashboard</h1>
        <p className="text-slate-400">Structured Dashboard Component-Driven Architecture.</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampaignForm 
          formData={formData} 
          setFormData={setFormData} 
          onLaunch={handleBulkAutomation} 
          selectedCount={selectedLeadIds.filter(id => leads.map(l => l.id).includes(id)).length}
          loading={loading}
        />

        <section className="flex flex-col min-h-[450px]">
          {/* شريط الفلترة المتقدمة */}
          <FilterBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedNiche={selectedNiche}
            setSelectedNiche={setSelectedNiche}
            niches={niches}
            onSelectAll={handleSelectAllFiltered}
            onDeselectAll={handleDeselectAllFiltered}
          />

          {/* لوحة إدارة وحالة العملاء الحية */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col flex-1">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Lead Management UI</h2>
            
            {statusMessage && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                statusMessage.toLowerCase().includes('success') || statusMessage.includes('completed')
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {statusMessage}
              </div>
            )}

            <LeadsTable 
              leads={filteredLeads}
              selectedLeadIds={selectedLeadIds}
              onCheckboxChange={handleCheckboxChange}
              bulkReport={bulkReport}
            />

            {/* شاشة السجلات الحية ممررة بشكل صحيح وذاتية الإغلاق */}
            <ExecutionLogs logs={logs} onClear={() => setLogs([])} />
            
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;