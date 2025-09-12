import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Trophy,
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Medal,
  Target,
  TrendingUp,
  RefreshCw,
  Save,
  Cloud,
  CloudOff,
  Plus,
  Edit3,
  Check,
  X,
} from 'lucide-react';

// Types
interface Stand {
  team: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  tpsr: number;
}

interface Match {
  homeTeam: string;
  awayTeam: string;
  score: string;
  round?: string;
  status?: string;
}

interface YearData {
  standings?: Stand[];
  matches?: Match[];
}

interface SepepData {
  houses: Record<string, number>;
  yearLevels: string[];
  fixtures: any[];
  results: Record<string, YearData>;
  teams: Record<string, any>;
  loaded: boolean;
  lastUpdated: string | null;
}

// Google Sheets Integration Hook (mocked for demo)
const useGoogleSheets = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const extractSheetId = (url: string) => {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const connectToSheets = useCallback(async (url: string, key = '') => {
    const sheetId = extractSheetId(url);
    if (!sheetId) throw new Error('Invalid Google Sheets URL');
    setSheetUrl(url);
    setApiKey(key);
    setIsConnected(true);
    setLastSync(new Date());
    localStorage.setItem('sepep_sheet_url', url);
    localStorage.setItem('sepep_api_key', key);
    return sheetId;
  }, []);

  const readFromSheets = useCallback(async (_sheetId: string, _ranges: string[]) => {
    // In this demo we simply resolve with mock data
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ valueRanges: [] });
      }, 500);
    });
  }, []);

  const writeToSheets = useCallback(async (_sheetId: string, _updates: any[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLastSync(new Date());
        resolve({ success: true });
      }, 500);
    });
  }, []);

  useEffect(() => {
    const savedUrl = localStorage.getItem('sepep_sheet_url');
    const savedKey = localStorage.getItem('sepep_api_key');
    if (savedUrl) {
      setSheetUrl(savedUrl);
      setApiKey(savedKey || '');
      setIsConnected(true);
    }
  }, []);

  return { isConnected, sheetUrl, lastSync, connectToSheets, readFromSheets, writeToSheets };
};

// Score Update Modal Component
interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: any) => Promise<void> | void;
  yearLevels: string[];
  teams: string[];
}

const ScoreUpdateModal: React.FC<ScoreModalProps> = ({ isOpen, onClose, onSave, yearLevels, teams }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [score1, setScore1] = useState<string>('');
  const [score2, setScore2] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

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
    setSelectedTeam1('');
    setSelectedTeam2('');
    setScore1('');
    setScore2('');
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Update Score</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        <div className="space-y-4">
          <select
            className="w-full border rounded p-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year Level</option>
            {yearLevels.map((yl) => (
              <option key={yl} value={yl}>
                {yl}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select className="flex-1 border rounded p-2" value={selectedTeam1} onChange={(e) => setSelectedTeam1(e.target.value)}>
              <option value="">Team 1</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select className="flex-1 border rounded p-2" value={selectedTeam2} onChange={(e) => setSelectedTeam2(e.target.value)}>
              <option value="">Team 2</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 border rounded p-2"
              placeholder="Score 1"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
            />
            <input
              type="number"
              className="flex-1 border rounded p-2"
              placeholder="Score 2"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-brand-500 text-white py-2 rounded hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
type Section = 'upload' | 'overview' | 'houses' | 'fixtures' | 'results' | 'teams';

const SEPEPSportsHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('upload');
  const [sepepData, setSepepData] = useState<SepepData>({
    houses: { Wirakuthi: 0, Pondi: 0, Kungari: 0, 'No:RI': 0 },
    yearLevels: [],
    fixtures: [],
    results: {},
    teams: {},
    loaded: false,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const sheets = useGoogleSheets();

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const notification = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  }, []);

  const loadSampleData = useCallback(() => {
    setLoading(true);
    showNotification('📊 Loading sample SEPEP data...', 'info');
    setTimeout(() => {
      const sample: SepepData = {
        houses: { Wirakuthi: 532, Pondi: 390, Kungari: 643.5, 'No:RI': 754.5 },
        yearLevels: ['Year 7', 'Year 8', 'Year 9'],
        fixtures: [],
        results: {},
        teams: {},
        loaded: true,
        lastUpdated: new Date().toLocaleString(),
      };
      setSepepData(sample);
      setLoading(false);
      showNotification('✅ Sample data loaded successfully!', 'success');
    }, 1000);
  }, [showNotification]);

  const getAllTeams = useCallback(() => {
    const teams = new Set<string>();
    Object.values(sepepData.results).forEach((yearData) => {
      yearData.standings?.forEach((s) => teams.add(s.team));
    });
    return Array.from(teams);
  }, [sepepData.results]);

  const handleScoreSave = useCallback(async (updateData: any) => {
    showNotification('💾 Saving score...', 'info');
    setTimeout(() => {
      showNotification('✅ Score saved!', 'success');
    }, 500);
  }, [showNotification]);

  const navItems = [
    { id: 'upload', label: 'Setup', icon: Settings },
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'houses', label: 'House Scores', icon: Trophy },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      <header className="bg-brand-500 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Medal className="h-5 w-5" /> SEPEP Sports Hub
        </h1>
        <div className="flex items-center gap-3 text-sm">
          {sheets.isConnected ? (
            <span className="flex items-center gap-1"><Cloud className="h-4 w-4" />Connected</span>
          ) : (
            <span className="flex items-center gap-1"><CloudOff className="h-4 w-4" />Offline</span>
          )}
          <button
            onClick={loadSampleData}
            className="bg-white/20 px-3 py-1 rounded hover:bg-white/30"
          >
            Load Sample
          </button>
        </div>
      </header>

      <nav className="bg-white shadow flex overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-1 px-4 py-2 whitespace-nowrap ${
              activeSection === item.id ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-600'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
      </nav>

      <main className="p-4 space-y-6">
        {activeSection === 'upload' && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><Upload className="h-4 w-4" /> Setup</h2>
            <p className="text-sm text-slate-700 mb-4">
              Connect to Google Sheets to sync SEPEP data or load sample data for demo purposes.
            </p>
            {!sheets.isConnected && (
              <button
                onClick={() => loadSampleData()}
                className="bg-brand-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Cloud className="h-4 w-4" /> Connect
              </button>
            )}
          </div>
        )}

        {activeSection === 'overview' && sepepData.loaded && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Home className="h-4 w-4" /> Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {Object.entries(sepepData.houses).map(([house, score]) => (
                <div key={house} className="bg-brand-100 rounded p-2">
                  <p className="font-semibold">{house}</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'houses' && sepepData.loaded && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="h-4 w-4" /> House Scores</h2>
            <ul className="space-y-2">
              {Object.entries(sepepData.houses).map(([house, score]) => (
                <li key={house} className="flex justify-between border-b pb-1">
                  <span>{house}</span>
                  <span className="font-semibold">{score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'teams' && sepepData.loaded && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4" /> Teams</h2>
            <p className="text-sm text-slate-700 mb-2">Teams loaded: {getAllTeams().length}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 bg-brand-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Update Score
            </button>
          </div>
        )}
      </main>

      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white shadow rounded px-4 py-2 border-l-4 border-brand-500"
            >
              {n.message}
            </div>
          ))}
        </div>
      )}

      <ScoreUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleScoreSave}
        yearLevels={sepepData.yearLevels}
        teams={getAllTeams()}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <RefreshCw className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

export default SEPEPSportsHub;

