import React from 'react';
import announcementsData from '../data/announcements.json';
import { formatDate } from '../utils/formatDate.js';

export default function Announcements() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-gray-100">Announcements</h2>
      </div>
      
      {announcementsData.length === 0 ? (
        <p className="text-slate-600 dark:text-gray-400 text-center py-8">
          No announcements at this time.
        </p>
      ) : (
        <div className="space-y-4">
          {announcementsData.map((announcement) => (
            <div 
              key={announcement.id} 
              className="border border-slate-200 dark:border-gray-600 rounded-lg p-4 bg-slate-50 dark:bg-gray-700"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-slate-800 dark:text-gray-100">
                  {announcement.title}
                </h3>
                <span className="text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(announcement.date)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">
                {announcement.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}