import React, { useEffect, useRef } from 'react';

const LiveConsole = ({ logs, isAutomating }) => {
  const consoleEndRef = useRef(null);

  // عمل التمرير الآلي التلقائي لأسفل الـ Console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 flex flex-col h-[450px]">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"></span>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            Live Automation Console
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">v1.0.0</span>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-y-auto border border-slate-900 shadow-inner">
        <div className="text-slate-500 mb-1">// System initialized. Awaiting parameters...</div>
        <div className="text-sky-400">user@saas-founder:~ $ <span className="text-slate-300">Console idle. Awaiting campaign execution...</span></div>
        
        {/* Future dynamic logs will stream beautifully here */}
        {logs.map((log, index) => {
          let colorClass = 'text-slate-500';
          if (log.status === 'success') colorClass = 'text-emerald-400';
          if (log.status === 'error') colorClass = 'text-rose-400';
          if (log.status === 'processing') colorClass = 'text-amber-400';
          if (log.status === 'done') colorClass = 'text-sky-400';

          return (
            <div key={index} className="whitespace-pre-wrap mb-1">
              <span className="text-slate-600 mr-1">[{log.timestamp || new Date().toLocaleTimeString()}]</span>
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveConsole;