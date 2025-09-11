import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <section className="text-center py-20 bg-gradient-to-b from-white to-indigo-50">
        <h1 className="text-4xl font-bold mb-4">SEPEP Tournament Hub</h1>
        <p className="text-slate-600 mb-8">Welcome to the central dashboard.</p>
        <div className="mx-auto max-w-4xl rounded-xl shadow-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/800x400"
            alt="Dashboard preview"
            className="w-full"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium mb-2">Fixtures</h3>
            <p className="text-sm text-slate-600">Upcoming matches and results.</p>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium mb-2">Teams</h3>
            <p className="text-sm text-slate-600">Profiles for every team.</p>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-medium mb-2">Ladder</h3>
            <p className="text-sm text-slate-600">Current standings and points.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
