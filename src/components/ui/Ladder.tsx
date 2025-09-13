export default function Ladder({houses}:{houses:Record<string,number>}) {
  const sorted = Object.entries(houses).sort(([,a],[,b])=>Number(b)-Number(a));
  const color = (name:string) => {
    if (/pondi/i.test(name)) return 'bg-house-red/10 text-house-red';
    if (/kungari/i.test(name)) return 'bg-house-green/10 text-house-green';
    if (/wirakuthi/i.test(name)) return 'bg-house-blue/10 text-house-blue';
    if (/no:ri/i.test(name)) return 'bg-house-yellow/10 text-house-yellow';
    return 'bg-slate-100 text-slate-700';
  };
  return (
    <div className="space-y-3">
      {sorted.map(([name,score],i)=>(
        <div key={name} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 w-6 text-right">{i+1}</span>
            <span className={`px-2 py-1 rounded ${color(name)} font-medium`}>{name}</span>
          </div>
          <span className="font-bold text-slate-900 text-right">{score}</span>
        </div>
      ))}
      {!sorted.length && <p className="text-slate-600">No data yet.</p>}
    </div>
  );
}
