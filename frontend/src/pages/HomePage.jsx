import React, { useState, useEffect } from 'react';

function HomePage() {
  const [formData, setFormData] = useState({
    productName: '',
    tone: 'Energetic'
  });
  const [leads, setLeads] = useState([]); // قائمة العملاء المجلوبة من السيرفر
  const [selectedLeadIds, setSelectedLeadIds] = useState([]); // المعرفات المحددة للإرسال
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [bulkReport, setBulkReport] = useState({}); // حفظ حالة الإرسال لكل عميل بعد العملية

  // 1. جلب قائمة العملاء من السيرفر فور تحميل الصفحة
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/leads');
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
        // تحديد جميع العملاء افتراضياً عند البداية
        setSelectedLeadIds(data.leads.map(l => l.id));
      }
    } catch (error) {
      setStatusMessage('Failed to load leads from server.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. إدارة اختيار وإلغاء اختيار العملاء عبر الـ Checkbox
  const handleCheckboxChange = (leadId) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter(id => id !== leadId));
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId]);
    }
  };

  // 3. إرسال الأتمتة للعملاء المحددين فقط
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
    setStatusMessage('');
    setBulkReport({});

    try {
      const response = await fetch('http://localhost:5000/api/campaigns/automation-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName,
          tone: formData.tone,
          selectedLeads: leadsToSend // تمرير القائمة المصفاة فقط
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage(data.message);
        // تحويل المصفوفة العائدة إلى Object لسهولة مطابقة الحالات في الجدول
        const reportObj = {};
        data.report.forEach(item => {
          reportObj[item.leadId] = item.status;
        });
        setBulkReport(reportObj);
      } else {
        setStatusMessage('Error: ' + data.error);
      }
    } catch (error) {
      setStatusMessage('Network error. Failed to trigger automation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Marketing Automation Dashboard
        </h1>
        <p className="text-slate-400">Advanced lead management and contextual bulk deployment.</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Inputs & Settings */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Campaign Global Configurations</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Luxury Custom T-Shirts"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Tone</label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Energetic">Energetic</option>
              <option value="Professional">Professional</option>
              <option value="Creative">Creative</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleBulkAutomation}
            disabled={loading}
            className={`w-full font-medium py-2.5 px-4 rounded-lg transition duration-200 mt-2 ${
              loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {loading ? 'Processing Contextual Queue...' : `Launch Campaign on (${selectedLeadIds.length}) Leads ⚙️`}
          </button>
        </section>

        {/* Interactive Lead Management UI */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col min-h-[400px]">
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
                        onChange={() => handleCheckboxChange(lead.id)}
                        className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.company} • <span className="text-slate-500">{lead.niche}</span></div>
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
        </section>
      </main>
    </div>
  );
}

export default HomePage;