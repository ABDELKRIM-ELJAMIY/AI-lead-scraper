import React, { useState } from 'react';

function HomePage() {
  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    tone: 'Energetic',
    recipientEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setStatusMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/campaigns/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStatusMessage(data.emailStatus);
      } else {
        setStatusMessage('Error: ' + data.error);
      }
    } catch (error) {
      setStatusMessage('Network error. Check if the backend server is running.');
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
        <p className="text-slate-400">Generate marketing copy and send emails automatically via API.</p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Campaign Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-400">Product Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-400">Target Audience</label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                required
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

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-400">Recipient Email</label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
                
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-medium py-2 px-4 rounded-lg transition duration-200 ${
                loading 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : 'Run Campaign'}
            </button>
          </form>
        </section>

        {/* Output Section */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Output View</h2>
          
          {statusMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
              statusMessage.toLowerCase().includes('success') || statusMessage.includes('نجاح') 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {statusMessage}
            </div>
          )}

          <div className="flex-1 bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-y-auto max-h-[350px] whitespace-pre-wrap text-sm text-slate-400 font-mono">
            {result ? result : <span className="text-slate-500">No content generated yet. Run a campaign to see the output.</span>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;