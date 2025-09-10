import React from 'react';

export default function Table({ columns, rows, rowKey = r => r.id, caption }) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50 text-slate-600">
          <tr>{columns.map(c => <th key={c.key} className="text-left font-semibold px-3 py-2 whitespace-nowrap" scope="col">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="px-3 py-3 text-slate-500" colSpan={columns.length}>No data available</td></tr>
          ) : rows.map((row, index) => (
            <tr key={rowKey(row)} className="border-t border-slate-100" role="row">
              {columns.map(c => <td key={c.key} className="px-3 py-2 align-top whitespace-nowrap" role="gridcell">{c.cell ? c.cell(row, index) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
