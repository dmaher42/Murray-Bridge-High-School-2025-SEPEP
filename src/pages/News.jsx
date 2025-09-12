import React from 'react';
import { getAnnouncements } from '../lib/dataApi.js';
import { sanitizeHtml } from '../lib/sanitizeHtml.js';

export default function News() {
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    setAnnouncement(getAnnouncements());
  }, []);

  const content = React.useMemo(() => {
    const html = sanitizeHtml(announcement || '<p>No announcements yet.</p>');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return Array.from(doc.body.childNodes).map((node, index) => nodeToElement(node, index));
  }, [announcement]);

  return (
    <section id="news" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Announcements & Media</h2>
      <div className="mt-6 rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6">
        <div className="prose dark:prose-invert">{content}</div>
      </div>
    </section>
  );
}

function nodeToElement(node, key) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }
  const children = Array.from(node.childNodes).map((child, idx) => nodeToElement(child, idx));
  const props = { key };
  if (node.attributes) {
    Array.from(node.attributes).forEach(attr => {
      props[attr.name] = attr.value;
    });
  }
  return React.createElement(node.nodeName.toLowerCase(), props, children);
}
