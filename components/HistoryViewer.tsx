import React from 'react';
import { LottoDraw } from '../types';

interface HistoryViewerProps {
  data: LottoDraw[];
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Draw</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Winning Numbers</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Bonus</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((draw) => (
            <tr key={draw.drawNo} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">#{draw.drawNo}</td>
              <td className="px-4 py-3 text-slate-600">{draw.date}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {draw.numbers.map((n) => (
                    <span 
                      key={n} 
                      className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 border border-slate-300"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center font-bold text-red-500">
                {draw.bonus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryViewer;