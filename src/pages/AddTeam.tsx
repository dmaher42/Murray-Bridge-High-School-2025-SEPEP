import ReactDOM from 'react-dom/client';
import '../index.css';

function ReadOnlyNotice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white">
      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-mbhs-navy">SEPEP Admin Tools</h1>
          <p className="mt-3 text-mbhs-navy/70">
            Team management now happens directly in the official Google Sheets documents maintained by
            the PE team. This public site is read-only and does not support adding or editing teams.
          </p>
          <p className="mt-3 text-mbhs-navy/70">
            Please continue to use the shared spreadsheets or Google Forms for any updates.
          </p>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<ReadOnlyNotice />);
