export default function Ladder({houses}:{houses:Record<string,number>}) {
  const sorted = Object.entries(houses).sort(([,a],[,b])=>Number(b)-Number(a));
  const color = (name:string) => {
    if (/kungari/i.test(name)) return 'bg-hood-kungari/10 text-hood-kungari';
    if (/no:ri/i.test(name)) return 'bg-hood-nori/10 text-hood-nori';
    if (/pondi/i.test(name)) return 'bg-hood-pondi/10 text-hood-pondi';
    if (/wirakuthi/i.test(name)) return 'bg-hood-wirakuthi/10 text-hood-wirakuthi';
    return 'bg-slate-100 text-slate-700';
  };
  return (
    <div className="space-y-3">
      {sorted.map(([name,score],i)=>(
        <div key={name} className="flex items-center justify-between bg-white odd:bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-mbhs-navy/70 w-6 text-right">{i+1}</span>
            <span className={`px-2 py-1 rounded ${color(name)} font-medium`}>{name}</span>
          </div>
          <span className="font-bold text-mbhs-navy text-right">{score}</span>
        </div>
      ))}
      {!sorted.length && <p className="text-slate-600">No data yet.</p>}
    </div>
  );
}
