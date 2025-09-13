export default function BadgeLive({label='LIVE'}:{label?:string}) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-white animate-pulse"></span>
      {label}
    </span>
  );
}
