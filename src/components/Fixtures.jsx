import React from 'react';
import fixturesData from '../data/fixtures.json';
import { formatDate } from '../utils/formatDate.js';

/**
 * Fixtures Component
 * 
 * Displays fixtures in responsive layout:
 * - Table format on medium+ screens (md:)
 * - Stacked card layout on small screens
 * - Highlights fixtures with missing scores
 */
export default function Fixtures() {
  return (
    <section id="fixtures" className="rounded-2xl border border-slate-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-gray-100">Fixtures & Results</h2>
      </div>
      
      {fixturesData.length === 0 ? (
        <p className="text-slate-600 dark:text-gray-400 text-center py-8">
          No fixtures scheduled at this time.
        </p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-600">
              <caption className="sr-only">
                Fixtures and results for the current season showing round, date, time, court, teams and scores
              </caption>
              <thead className="bg-slate-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Round
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Court
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Teams
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-600">
                {fixturesData.map((fixture, index) => (
                  <tr 
                    key={index} 
                    className={fixture.score === null ? "italic bg-slate-50 dark:bg-gray-700" : ""}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-gray-100">
                      {fixture.round}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-gray-300">
                      {formatDate(fixture.date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-gray-300">
                      {fixture.time}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-gray-300">
                      {fixture.court}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-gray-300">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="font-medium">{fixture.home}</span>
                        <span className="text-slate-500 dark:text-gray-400">vs</span>
                        <span className="font-medium">{fixture.away}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-gray-300">
                      {fixture.score === null ? (
                        <span className="text-slate-500 dark:text-gray-400 italic">TBD</span>
                      ) : (
                        <span className="font-mono font-medium">{fixture.score}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {fixturesData.map((fixture, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  fixture.score === null 
                    ? "border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700" 
                    : "border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-gray-100">
                      Round {fixture.round}
                    </span>
                    <span className="text-slate-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-slate-600 dark:text-gray-400">
                      Court {fixture.court}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      {formatDate(fixture.date)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      {fixture.time}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-gray-100">
                      {fixture.home}
                    </span>
                    <span className="text-slate-500 dark:text-gray-400 text-sm">vs</span>
                    <span className="font-medium text-slate-800 dark:text-gray-100">
                      {fixture.away}
                    </span>
                  </div>
                  
                  <div className="text-center pt-2 border-t border-slate-200 dark:border-gray-600">
                    {fixture.score === null ? (
                      <span className="text-slate-500 dark:text-gray-400 italic">
                        To Be Determined
                      </span>
                    ) : (
                      <span className="font-mono font-medium text-slate-800 dark:text-gray-100 text-lg">
                        {fixture.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}