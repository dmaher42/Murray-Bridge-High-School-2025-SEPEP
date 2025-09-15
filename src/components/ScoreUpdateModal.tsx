import React, { useState } from "react";
import { X, RefreshCw, Save } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: any) => Promise<void> | void;
  yearLevels: string[];
  teams: string[];
}

const ScoreUpdateModal: React.FC<Props> = ({ isOpen, onClose, onSave, yearLevels, teams }) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTeam1, setSelectedTeam1] = useState("");
  const [selectedTeam2, setSelectedTeam2] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !score1 || !score2) return;
    setSaving(true);

    const updateData = {
      yearLevel: selectedYear,
      homeTeam: selectedTeam1,
      awayTeam: selectedTeam2,
      homeScore: parseInt(score1, 10),
      awayScore: parseInt(score2, 10),
      timestamp: new Date().toISOString(),
    };

    await onSave(updateData);

    setSelectedTeam1("");
    setSelectedTeam2("");
    setScore1("");
    setScore2("");
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-mbhs-navy">Update Score</h3>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Year Level</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-mbhs-gold focus:ring-2 focus:ring-mbhs-gold"
            >
              <option value="">Select year level</option>
              {yearLevels.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Home Team</label>
              <select
                value={selectedTeam1}
                onChange={(e) => setSelectedTeam1(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-mbhs-gold focus:ring-2 focus:ring-mbhs-gold"
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Away Team</label>
              <select
                value={selectedTeam2}
                onChange={(e) => setSelectedTeam2(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-mbhs-gold focus:ring-2 focus:ring-mbhs-gold"
              >
                <option value="">Select team</option>
                {teams
                  .filter((team) => team !== selectedTeam1)
                  .map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Home Score</label>
              <input
                type="number"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-mbhs-gold focus:ring-2 focus:ring-mbhs-gold"
                min={0}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Away Score</label>
              <input
                type="number"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-mbhs-gold focus:ring-2 focus:ring-mbhs-gold"
                min={0}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedTeam1 || !selectedTeam2 || !score1 || !score2}
            className="flex-1 btn btn-accent justify-center space-x-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save to Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreUpdateModal;
