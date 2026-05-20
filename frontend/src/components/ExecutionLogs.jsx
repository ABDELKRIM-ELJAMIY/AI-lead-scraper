import React, { useEffect, useRef } from 'react';

function ExecutionLogs({ logs, onClear }) {
  const terminalEndRef = useRef(null);

  // التمرير التلقائي للأسفل (Auto-scroll) عند ورود سجل جديد
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-4 font-mono text-xs shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-500 ml-2 text-[11px]">live_execution_stream.log</span>
        </div>
        <button 
          onClick={onClear}
          className="text-slate-500 hover:text-slate-300 text-[10px] uppercase tracking-wider"
        >
          Clear Terminal
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
        {logs.map((log, index) => {
          // تحديد لون السطر بناءً على الحالة
          let colorClass = 'text-slate-300';
          if (log.status === 'success') colorClass = 'text-emerald-400 font-medium';
          if (log.status === 'error') colorClass = 'text-rose-400 font-medium';
          if (log.status === 'processing') colorClass = 'text-blue-400 animate-pulse';

          return (
            <div key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none">[{log.timestamp}]</span>
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default ExecutionLogs;