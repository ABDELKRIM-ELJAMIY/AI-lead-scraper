import React from 'react';

function FilterBar({ leads = [], searchTerm, setSearchTerm, selectedNiche, setSelectedNiche }) {
   
   // استخراج الـ Niches الفريدة بأمان باستخدام الاختيار الاختياري (?.) وبديل فارغ
   const uniqueNiches = ['All', ...new Set((leads || []).map(lead => lead.niche).filter(Boolean))];

   return (
     <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6">
       <div className="grid gap-4 sm:grid-cols-2">
         {/* خانة البحث */}
         <div>
           <input
             type="text"
             placeholder="Search leads by company or email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all text-sm"
           />
         </div>

         {/* قائمة الفلترة حسب الـ Niche */}
         <div>
           <select
             value={selectedNiche}
             onChange={(e) => setSelectedNiche(e.target.value)}
             className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all text-sm"
           >
             {uniqueNiches.map((niche) => (
               <option key={niche} value={niche}>
                 {niche}
               </option>
             ))}
           </select>
         </div>
       </div>
     </div>
   );
 }

 export default FilterBar;