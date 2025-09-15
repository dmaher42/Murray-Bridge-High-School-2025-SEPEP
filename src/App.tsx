import SEPEPSportsHub from "./SEPEPSportsHub";
import AddTeam from "./pages/AddTeam";

export default function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const showAddTeam = path.endsWith("/add-team");
  const base = (import.meta as any).env?.BASE_URL || "/";
  return (
    <div>
      <nav className="p-4 bg-slate-100 flex gap-4">
        <a href={base} className="text-blue-600 hover:underline">Home</a>
        <a href={`${base}add-team`} className="text-blue-600 hover:underline">Add Team</a>
      </nav>
      {showAddTeam ? <AddTeam /> : <SEPEPSportsHub />}
    </div>
  );
}

