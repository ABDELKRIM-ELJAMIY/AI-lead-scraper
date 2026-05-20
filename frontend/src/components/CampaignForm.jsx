import React from 'react';

function CampaignForm({ formData, setFormData, onLaunch, selectedCount, loading }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
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
        onClick={onLaunch}
        disabled={loading}
        className={`w-full font-medium py-2.5 px-4 rounded-lg transition duration-200 mt-2 ${
          loading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
        }`}
      >
        {loading ? 'Processing Contextual Queue...' : `Launch Campaign on (${selectedCount}) Leads ⚙️`}
      </button>
    </section>
  );
}

export default CampaignForm;