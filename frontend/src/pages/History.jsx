import React, { useEffect, useState } from 'react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // جلب البيانات من الباك إند
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campaigns/history');
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // تصفية السجل بناءً على بحث المستخدم (اسم الشركة أو النيش أو المدينة)
  const filteredHistory = history.filter(item =>
    item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* الهيدر وأشرطة التحكم */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Campaign History
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-500 sm:mt-4">
              Review and monitor your automated cold email outreaches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by company, niche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all text-sm"
            />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Total: {filteredHistory.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 p-6 text-center">
            <p className="mt-4 text-sm font-medium text-slate-700">No campaigns found</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Your campaign history will appear here after you launch campaigns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* القائمة اليسرى: استعراض البطاقات */}
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCampaign(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedCampaign?.id === item.id
                      ? 'bg-white border-slate-200/80 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 truncate max-w-[180px]">{item.company}</h3>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mb-3">{item.email}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-200 px-2 py-0.5 rounded-md capitalize">
                      {item.niche}
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-200 px-2 py-0.5 rounded-md capitalize">
                      {item.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* القسم الأيمن: تفاصيل الإيميل المحدد */}
            <div className="lg:col-span-2">
              {selectedCampaign ? (
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 h-full flex flex-col">
                  <div className="border-b border-slate-200 pb-4 mb-4">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedCampaign.company}</h2>
                      <span className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-md">
                        {selectedCampaign.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-mono">{selectedCampaign.email}</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">Subject</span>
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-800 border border-slate-200 font-medium">
                      {selectedCampaign.subject}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">Generated Email Body</span>
                    <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm leading-relaxed overflow-y-auto max-h-[450px] whitespace-pre-wrap font-mono border border-slate-200 flex-1 text-left">
                      {selectedCampaign.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl min-h-[400px]">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex justify-center items-center mb-3 text-slate-400 text-xl">📬</div>
                  <p className="text-slate-500 text-sm">Select a campaign from the list to preview the generated copy and deployment logs.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;