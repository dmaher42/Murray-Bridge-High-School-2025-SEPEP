import React from "react";
export default function Stat({label, value, icon}:{label:string; value:React.ReactNode; icon?:React.ReactNode}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
