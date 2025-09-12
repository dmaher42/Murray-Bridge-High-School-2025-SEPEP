import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Medal,
  Target,
  RefreshCw,
  Save,
  Cloud,
  CloudOff,
  Plus,
  Edit3,
  Check,
  X,
} from "lucide-react";

/* =========================================
   Types
========================================= */

type Stand = {
  team: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  tpsr: number;
};

type MatchRow = {
  homeTeam: string;
  awayTeam: string;
  score: string;
  round?: string;
  status?: string;
};

type YearData = {
  standings?: Stand[];
  matches?: MatchRow[];
};

type SepepData = {
  houses: Record<string, number>;
  yearLevels: string[];
  fixtures: Array<Record<string, string | number>>;
  results: Record<string, YearData>;
  teams: Record<string, Record<string, string[]>>;
  loaded: boolean;
  lastUpdated: string | null;
};

type Notification = {
  id: number;
  message: string;
  type: "info" | "success" | "error";
  timestamp: Date;
};

/* =========================================
   Google Sheets Mock Hook
   (keeps structure; you can wire real API later)
========================================= */

const useGoogleSheets = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const extractSheetId = (url: string) => {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const connectToSheets = useCallback(async (url: string, key = "") => {
    const sheetId = extractSheetId(url);
    if (!sheetId) throw new Error("Invalid Google Sheets URL");

    setSheetUrl(url);
    setApiKey(key);
    setIsConnected(true);
    setLastSync(new Date());

    localStorage.setItem("sepep_sheet_url", url);
    localStorage.setItem("sepep_api_key", key);

    return sheetId;
  }, []);

  const readFromSheets = useCallback(async (sheetId: string, ranges: string[]) => {
    // Simulated API response
    return new Promise<{ valueRanges: Array<{ range: string; values: any[][] }> }>((resolve) => {
      setTimeout(() => {
        resolve({
          valueRanges: ranges.map((range) => ({
            range,
            values: generateMockSheetData(range),
          })),
        });
      }, 800);
    });
  }, []);

  const writeToSheets = useCallback(async (_sheetId: string, _updates: any[]) => {
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        setLastSync(new Date());
        resolve({ success: true });
      }, 500);
    });
  }, []);

  useEffect(() => {
    const savedUrl = localStorage.getItem("sepep_sheet_url");
    const savedKey = localStorage.getItem("sepep_api_key");
    if (savedUrl) {
      setSheetUrl(savedUrl);
      setApiKey(savedKey || "");
      setIsConnected(true);
    }
  }, []);

  return {
    isConnected,
    sheetUrl,
    apiKey,
    lastSync,
    connectToSheets,
    readFromSheets,
    writeToSheets,
  };
};

/* =========================================
   Mock sheet data generator (demo)
========================================= */

function generateMockSheetData(range: string): any[][] {
  if (range.includes("Scoreboard")) {
    return [
      ["2024 Neighbourhood SEPEP Scoreboard"],
      [""],
      ["", "Wirakuthi", "532"],
      ["", "Pondi", "390"],
      ["", "Kungari", "643.5"],
      ["", "No:RI", "754.5"],
    ];
  }
  return [["Sample", "Data", "Row"]];
}

/* =========================================
   Score Update Modal
========================================= */

const ScoreUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: any) => Promise<void> | void;
  yearLevels: string[];
  teams: string[];
}> = ({ isOpen, onClose, onSave, yearLevels, teams }) => {
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
          <h3 className="text-xl font-bold text-slate-800">Update Score</h3>
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
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
            className="flex-1 inline-flex items-center justify-center space-x-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
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

/* =========================================
   Main App
========================================= */

const SEPEPSportsHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"upload" | "overview" | "houses" | "fixtures" | "results" | "teams">("upload");

  const [sepepData, setSepepData] = useState<SepepData>({
    houses: { Wirakuthi: 0, Pondi: 0, Kungari: 0, "No:RI": 0 },
    yearLevels: [],
    fixtures: [],
    results: {},
    teams: {},
    loaded: false,
    lastUpdated: null,
  });

  const [loading, setLoading] = useState(false);
  const [selectedYearLevel, setSelectedYearLevel] = useState<"all" | string>("all");
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sheets = useGoogleSheets();

  const houseColors: Record<string, string> = {
    Wirakuthi: "from-blue-500 to-blue-600",
    Pondi: "from-red-500 to-red-600",
    Kungari: "from-green-500 to-green-600",
    "No:RI": "from-yellow-500 to-yellow-600",
  };

  const showNotification = useCallback((message: string, type: Notification["type"] = "info") => {
    const notification: Notification = { id: Date.now(), message, type, timestamp: new Date() };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id)), 5000);
  }, []);

  const saveToLocalStorage = useCallback((data: SepepData) => {
    try {
      localStorage.setItem(
        "sepep_data",
        JSON.stringify({
          ...data,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
  }, []);

  const loadFromLocalStorage = useCallback((): SepepData | null => {
    try {
      const saved = localStorage.getItem("sepep_data");
      if (saved) return JSON.parse(saved) as SepepData;
    } catch {
      // ignore
    }
    return null;
  }, []);

  const parseGoogleSheetsData = useCallback((_data: any): SepepData => {
    return {
      houses: { Wirakuthi: 532, Pondi: 390, Kungari: 643.5, "No:RI": 754.5 },
      yearLevels: ["Year 7 (Line 2)", "Year 7 (Line 5)", "Year 8", "Year 9 (Line 1)", "Year 9 (Line 7)"],
      fixtures: [
        { week: 3, "Year 7 (Line 2)": "Netball", "Year 7 (Line 5)": "T-Ball", "Year 8": "Pool Sports", "Year 9 (Line 1)": "Volleyball", "Year 9 (Line 7)": "Touch Football" },
        { week: 4, "Year 7 (Line 2)": "T-Ball", "Year 7 (Line 5)": "Soccer", "Year 8": "Multi-Sport", "Year 9 (Line 1)": "Touch Football", "Year 9 (Line 7)": "Netball" },
      ],
      results: {
        "Year 7 (Line 2)": {
          standings: [
            { team: "Mingle Masters Kungari 3", wins: 8, draws: 2, losses: 4, points: 73.5, tpsr: 41.5 },
            { team: "Watermelon Goats Kungari 2", wins: 7, draws: 1, losses: 5, points: 73, tpsr: 45 },
            { team: "Pondi Predators", wins: 6, draws: 0, losses: 6, points: 67, tpsr: 43 },
            { team: "Tilted Towers Kungari 1", wins: 5, draws: 1, losses: 8, points: 66, tpsr: 41 },
          ],
          matches: [
            { homeTeam: "Tilted Towers Kungari 1", awayTeam: "Watermelon Goats Kungari 2", score: "2-1", round: "Round 1", status: "Final" },
            { homeTeam: "Pondi Pelicans", awayTeam: "Watermelon Goats Kungari 2", score: "Live", round: "Round 2", status: "Live" },
          ],
        },
      },
      teams: {
        "Year 9 Line 7": {
          "Blue Swans": ["Hallie", "Lashyia", "Riley", "Zedino", "Tamkia", "Ella", "Josh", "Nhial", "Jay"],
          "Blue Tongues": ["Rocco", "Enchi", "Kobi P", "Carter", "Jordan", "Zion", "Calliope", "CJ", "Anbella"],
          Stingrays: ["Shayla", "Nate", "Emily", "Mia N", "Kedan", "Kobe", "Eddy", "Steph", "Jaiden"],
        },
      },
      loaded: true,
      lastUpdated: new Date().toLocaleString(),
    };
  }, []);

  const handleSheetsConnection = useCallback(
    async (url: string, apiKey = "") => {
      try {
        setLoading(true);
        showNotification("🔗 Connecting to Google Sheets...", "info");
        const sheetId = await sheets.connectToSheets(url, apiKey);
        const ranges = ["Scoreboard!A:C", "Year 7 (Line 2)!A:N", "Year 7 (Line 5)!A:Q", "Fixture!A:G"];
        const data = await sheets.readFromSheets(sheetId!, ranges);
        const parsed = parseGoogleSheetsData(data);
        setSepepData(parsed);
        saveToLocalStorage(parsed);
        showNotification("✅ Successfully connected to Google Sheets!", "success");
      } catch (e: any) {
        showNotification(`❌ Connection failed: ${e.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [sheets, showNotification, saveToLocalStorage, parseGoogleSheetsData]
  );

  const handleScoreSave = useCallback(
    async (updateData: any) => {
      try {
        showNotification("💾 Saving score to Google Sheets...", "info");

        const updatedResults = { ...sepepData.results };
        const yd = updatedResults[updateData.yearLevel];
        if (yd) {
          yd.matches = yd.matches || [];
          yd.matches.unshift({
            homeTeam: updateData.homeTeam,
            awayTeam: updateData.awayTeam,
            score: `${updateData.homeScore}-${updateData.awayScore}`,
            round: "Latest",
            status: "Final",
          });

          const standings = (yd.standings || []) as Stand[];
          const homeTeam = standings.find((t) => t.team === updateData.homeTeam);
          const awayTeam = standings.find((t) => t.team === updateData.awayTeam);
          if (homeTeam && awayTeam) {
            if (updateData.homeScore > updateData.awayScore) {
              homeTeam.wins += 1;
              awayTeam.losses += 1;
              homeTeam.points += 3;
            } else if (updateData.homeScore < updateData.awayScore) {
              awayTeam.wins += 1;
              homeTeam.losses += 1;
              awayTeam.points += 3;
            } else {
              homeTeam.draws += 1;
              awayTeam.draws += 1;
              homeTeam.points += 1;
              awayTeam.points += 1;
            }
          }
        }

        const newData: SepepData = {
          ...sepepData,
          results: updatedResults,
          lastUpdated: new Date().toLocaleString(),
        };

        setSepepData(newData);
        saveToLocalStorage(newData);

        if (sheets.isConnected) {
          const sheetId = sheets.sheetUrl ? "connected" : "demo";
          await sheets.writeToSheets(sheetId, [updateData]);
        }

        showNotification("✅ Score saved successfully!", "success");
      } catch (e: any) {
        showNotification(`❌ Failed to save score: ${e.message}`, "error");
      }
    },
    [sepepData, sheets, showNotification, saveToLocalStorage]
  );

  const loadSampleData = useCallback(() => {
    setLoading(true);
    showNotification("📊 Loading sample SEPEP data...", "info");
    setTimeout(() => {
      const sampleData = parseGoogleSheetsData(null);
      setSepepData(sampleData);
      saveToLocalStorage(sampleData);
      setLoading(false);
      showNotification("✅ Sample data loaded successfully!", "success");
    }, 1000);
  }, [parseGoogleSheetsData, saveToLocalStorage, showNotification]);

  useEffect(() => {
    if (sheets.isConnected) {
      const interval = setInterval(() => {
        // placeholder for auto-sync logic
        // console.log("Auto-syncing...");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [sheets.isConnected]);

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && saved.loaded) {
      setSepepData(saved);
      showNotification("📂 Loaded saved SEPEP data", "info");
    }
  }, [loadFromLocalStorage, showNotification]);

  const getAllTeams = useCallback((): string[] => {
    const setTeams = new Set<string>();
    Object.values(sepepData.results).forEach((yearData) => {
      yearData.standings?.forEach((s) => setTeams.add(s.team));
    });
    return Array.from(setTeams);
  }, [sepepData.results]);

  const navItems = [
    { id: "upload", label: "Setup", icon: Settings },
    { id: "overview", label: "Overview", icon: Home },
    { id: "houses", label: "House Scores", icon: Trophy },
    { id: "fixtures", label: "Fixtures", icon: Calendar },
    { id: "results", label: "Results", icon: BarChart3 },
    { id: "teams", label: "Teams", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">2024 Neighbourhood SEPEP</h1>
                <p className="text-sm text-slate-600">Live Sports Hub with Google Sheets</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {sheets.isConnected ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Offline</span>
                  </>
                )}
              </div>

              {sepepData.loaded && (
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="inline-flex items-center space-x-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Update Score</span>
                </button>
              )}

              {sheets.lastSync && <span className="text-xs text-slate-500">Last sync: {sheets.lastSync.toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition-all duration-200 ${
                    activeSection === item.id ? "bg-slate-800 text-white shadow-lg" : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
                  }`}
                >
                  <span className="inline-flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Notifications */}
      <div className="fixed right-4 top-20 z-50 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`max-w-sm transform rounded-lg p-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${
              n.type === "success" ? "bg-green-500/90 text-white" : n.type === "error" ? "bg-red-500/90 text-white" : "bg-blue-500/90 text-white"
            }`}
          >
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Setup */}
        {activeSection === "upload" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800">Setup & Google Sheets Integration</h2>
              <p className="text-slate-600">Connect your Google Sheet for real-time data sync</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Sheets connect */}
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-lg">
                <h3 className="mb-6 flex items-center text-xl font-semibold text-slate-800">
                  <Cloud className="mr-2 h-5 w-5 text-blue-600" />
                  Google Sheets Integration
                </h3>

                {!sheets.isConnected ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Google Sheets URL</label>
                      <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        onChange={() => {
                          /* noop: controlled by connect button below */
                        }}
                      />
                      <p className="mt-1 text-xs text-slate-500">Make sure your sheet is set to “Anyone with the link can view”.</p>
                    </div>

                    <button
                      onClick={() => handleSheetsConnection("https://docs.google.com/spreadsheets/d/sample-demo-sheet")}
                      disabled={loading}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="h-4 w-4" />
                          <span>Connect to Google Sheets</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Connected to Google Sheets</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>
                        <strong>Status:</strong> Real-time sync enabled
                      </p>
                      <p>
                        <strong>Last sync:</strong> {sheets.lastSync?.toLocaleString() || "Never"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("sepep_sheet_url");
                        localStorage.removeItem("sepep_api_key");
                        window.location.reload();
                      }}
                      className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Data */}
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-lg">
                <h3 className="mb-6 text-xl font-semibold text-slate-800">Try Sample Data</h3>
                <p className="mb-6 text-slate-600">Load demo data that matches your SEPEP format to see the app in action.</p>

                <button
                  onClick={loadSampleData}
                  disabled={loading}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-800 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>Load Sample Data</span>
                    </>
                  )}
                </button>

                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
                  <h4 className="mb-2 text-lg font-semibold text-blue-800">📋 How to Connect Your Google Sheet</h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="mb-2 font-medium text-blue-700">Step 1: Prepare Your Sheet</h5>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-600">
                        <li>Open your “2024 SEPEP Fixture and Results.xlsx”</li>
                        <li>Upload to Google Drive and convert to Google Sheets</li>
                        <li>Ensure tabs: Scoreboard, Fixture, Year level sheets</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="mb-2 font-medium text-blue-700">Step 2: Share Your Sheet</h5>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-600">
                        <li>Click “Share” in Google Sheets</li>
                        <li>Change to “Anyone with the link can view”</li>
                        <li>Copy the URL and connect above</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {sepepData.loaded && (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="text-lg font-medium text-green-800">SEPEP Data Active!</h4>
                        <p className="text-green-700">
                          Your sports hub is live. {sheets.isConnected && "Changes will sync automatically with your Google Sheet."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overview */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-3xl font-bold text-slate-800">Season Overview</h2>
              <p className="text-slate-600">Your 2024 Neighbourhood SEPEP at a glance</p>
            </div>

            {!sepepData.loaded ? (
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center shadow-xl backdrop-blur-lg">
                <Settings className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-800">No Data Loaded</h3>
                <p className="mb-4 text-slate-600">Connect your Google Sheet or load sample data to see the overview.</p>
                <button
                  onClick={() => setActiveSection("upload")}
                  className="inline-flex items-center space-x-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
                >
                  <Settings className="h-4 w-4" />
                  <span>Go to Setup</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Matches</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {Object.values(sepepData.results).reduce((total, year) => total + (year.matches?.length || 0), 0)}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Teams</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {Object.values(sepepData.results).reduce((total, year) => total + (year.standings?.length || 0), 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Year Levels</p>
                      <p className="text-3xl font-bold text-slate-800">{sepepData.yearLevels.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{sheets.isConnected ? "Live Updates" : "Offline Mode"}</p>
                      <p className="text-3xl font-bold text-slate-800">{sheets.isConnected ? "🔗" : "💾"}</p>
                    </div>
                    {sheets.isConnected ? <Cloud className="h-8 w-8 text-green-600" /> : <CloudOff className="h-8 w-8 text-slate-400" />}
                  </div>
                </div>

                <div className="lg:col-span-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-2 text-2xl font-bold">Championship Leader</h3>
                      <p className="text-4xl font-bold">
                        {Object.entries(sepepData.houses).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "Loading..."}
                      </p>
                      <p className="text-xl opacity-90">
                        {Object.entries(sepepData.houses).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[1] || 0} points
                      </p>
                    </div>
                    <Trophy className="h-16 w-16 opacity-80" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Houses */}
        {activeSection === "houses" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800">House Championships</h2>
              <p className="text-slate-600">{sheets.isConnected ? "Live standings synced with Google Sheets" : "Standings from local/sample data"}</p>
            </div>

            {!sepepData.loaded ? (
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center shadow-xl">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-800">No House Data Available</h3>
                <p className="text-slate-600">Connect your Google Sheet or load sample data to see house scores.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(sepepData.houses)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([house, score], index) => {
                    const position = index + 1;
                    const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🏆";
                    return (
                      <div
                        key={house}
                        className={`transform rounded-2xl bg-gradient-to-br ${houseColors[house] ?? "from-slate-500 to-slate-600"} p-8 text-white shadow-xl transition-all duration-200 hover:scale-105`}
                      >
                        <div className="text-center">
                          <div className="mb-4 text-4xl">{medal}</div>
                          <h3 className="mb-2 text-2xl font-bold">{house}</h3>
                          <div className="mb-2 text-4xl font-bold">{score}</div>
                          <p className="text-lg opacity-90">
                            {position === 1 ? "1st Place" : position === 2 ? "2nd Place" : position === 3 ? "3rd Place" : `${position}th Place`}
                          </p>
                          {sheets.isConnected && (
                            <div className="mt-3 flex items-center justify-center space-x-1 opacity-75">
                              <Cloud className="h-3 w-3" />
                              <span className="text-xs">Live</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Fixtures */}
        {activeSection === "fixtures" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800">Competition Fixtures</h2>
              <p className="text-slate-600">Weekly sport schedules by year level</p>
            </div>

            {!sepepData.loaded ? (
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center shadow-xl">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-800">No Fixture Data Available</h3>
                <p className="text-slate-600">Load your SEPEP data to see weekly fixtures.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sepepData.fixtures.map((week) => (
                  <div key={String(week.week)} className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl">
                    <h3 className="mb-6 text-2xl font-bold text-slate-800">Week {String(week.week)}</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(week)
                        .filter(([k]) => k !== "week")
                        .map(([yearLevel, sport]) => (
                          <div key={yearLevel} className="rounded-xl border-l-4 border-amber-500 bg-slate-50 p-6">
                            <h4 className="mb-2 font-semibold text-slate-800">{yearLevel}</h4>
                            <p className="text-slate-600">{String(sport)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {activeSection === "results" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="mb-4 text-3xl font-bold text-slate-800">Live Results</h2>
                <p className="text-slate-600">Team standings and match results</p>
              </div>

              {sepepData.loaded && (
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="inline-flex items-center space-x-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Update Score</span>
                </button>
              )}
            </div>

            {sepepData.loaded && (
              <div className="flex justify-center">
                <div className="rounded-full border border-white/20 bg-white/60 p-2 backdrop-blur-lg">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedYearLevel("all")}
                      className={`rounded-full px-4 py-2 font-medium transition-colors ${
                        selectedYearLevel === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-white/60"
                      }`}
                    >
                      All Years
                    </button>
                    {sepepData.yearLevels.map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYearLevel(year)}
                        className={`rounded-full px-4 py-2 font-medium transition-colors ${
                          selectedYearLevel === year ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-white/60"
                        }`}
                      >
                        {year.replace("Year ", "Y").replace(" (", " L").replace(")", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!sepepData.loaded ? (
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center shadow-xl">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-800">No Results Data Available</h3>
                <p className="text-slate-600">Connect your Google Sheet or load sample data to see results.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(sepepData.results)
                  .filter(([yearLevel]) => selectedYearLevel === "all" || selectedYearLevel === yearLevel)
                  .map(([yearLevel, data]) => (
                    <div key={yearLevel} className="space-y-6">
                      <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                          <h3 className="flex items-center text-2xl font-bold text-slate-800">
                            <Medal className="mr-2 h-6 w-6 text-amber-600" />
                            {yearLevel} - Team Standings
                          </h3>
                          {sheets.isConnected && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <Cloud className="h-4 w-4" />
                              <span className="text-sm font-medium">Live</span>
                            </div>
                          )}
                        </div>

                        {data.standings && data.standings.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="py-3 px-4 text-left font-semibold text-slate-800">Position</th>
                                  <th className="py-3 px-4 text-left font-semibold text-slate-800">Team</th>
                                  <th className="py-3 px-4 text-center font-semibold text-slate-800">W</th>
                                  <th className="py-3 px-4 text-center font-semibold text-slate-800">D</th>
                                  <th className="py-3 px-4 text-center font-semibold text-slate-800">L</th>
                                  <th className="py-3 px-4 text-center font-semibold text-slate-800">TPSR</th>
                                  <th className="py-3 px-4 text-right font-semibold text-slate-800">Points</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.standings
                                  .slice()
                                  .sort((a, b) => b.points - a.points)
                                  .map((team, index) => (
                                    <tr key={team.team} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                      <td className="py-4 px-4">
                                        <span className="flex items-center space-x-2">
                                          <span className="font-bold text-slate-800">{index + 1}</span>
                                          {index === 0 && <span>🥇</span>}
                                          {index === 1 && <span>🥈</span>}
                                          {index === 2 && <span>🥉</span>}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 font-semibold text-slate-800">{team.team}</td>
                                      <td className="py-4 px-4 text-center font-medium text-green-600">{team.wins}</td>
                                      <td className="py-4 px-4 text-center font-medium text-yellow-600">{team.draws}</td>
                                      <td className="py-4 px-4 text-center font-medium text-red-600">{team.losses}</td>
                                      <td className="py-4 px-4 text-center text-slate-600">{team.tpsr}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-800">{team.points}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="py-8 text-center text-slate-600">No standings data available for {yearLevel}</p>
                        )}
                      </div>

                      {data.matches && data.matches.length > 0 && (
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl">
                          <h3 className="mb-6 flex items-center text-2xl font-bold text-slate-800">
                            <Target className="mr-2 h-6 w-6 text-blue-600" />
                            {yearLevel} - Recent Matches
                          </h3>

                          <div className="space-y-4">
                            {data.matches.slice(0, 10).map((match, idx) => (
                              <div key={`${match.homeTeam}-${match.awayTeam}-${idx}`} className="rounded-xl border-l-4 border-blue-500 bg-slate-50 p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <span className="font-semibold text-slate-800">
                                      {match.homeTeam} vs {match.awayTeam}
                                    </span>
                                    {match.status === "Live" && (
                                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                        <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                        LIVE
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-slate-800">{match.score}</span>
                                    {match.round && <span className="text-sm text-slate-500">({match.round})</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Teams */}
        {activeSection === "teams" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800">Team Information</h2>
              <p className="text-slate-600">Team rosters and player lists</p>
            </div>

            {!sepepData.loaded ? (
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center shadow-xl">
                <Users className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                <h3 className="mb-2 text-xl font-semibold text-slate-800">No Team Data Available</h3>
                <p className="text-slate-600">Load your SEPEP data to see team rosters.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(sepepData.teams).map(([yearLevel, teams]) => (
                  <div key={yearLevel} className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800">{yearLevel}</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(teams).map(([teamName, players]) => (
                        <div key={teamName} className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
                          <h4 className="mb-4 flex items-center text-xl font-bold text-slate-800">
                            <Users className="mr-2 h-5 w-5 text-blue-600" />
                            {teamName}
                          </h4>
                          <p className="mb-3 text-sm font-medium text-slate-600">Players ({players.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {players.map((p, i) => (
                              <span key={`${teamName}-${i}`} className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(sepepData.teams).length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-amber-600" />
                      <div>
                        <h3 className="text-lg font-medium text-amber-800">Limited Team Data</h3>
                        <p className="text-amber-700">Team roster information will appear after you connect your full Google Sheet.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <ScoreUpdateModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        onSave={handleScoreSave}
        yearLevels={sepepData.yearLevels}
        teams={getAllTeams()}
      />

      {/* Footer */}
      <footer className="mt-16 bg-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="font-semibold">2024 Neighbourhood SEPEP</h3>
                <p className="text-sm text-slate-400">
                  Live Sports Hub {sheets.isConnected ? "with Google Sheets Integration" : "with Local Storage"}
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Built with React • Powered by your SEPEP data
              {sheets.isConnected && (
                <div className="mt-1 flex items-center space-x-1">
                  <Cloud className="h-3 w-3" />
                  <span>Real-time sync enabled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-4 rounded-2xl bg-white p-8 shadow-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
            <span className="font-medium text-slate-800">Processing your SEPEP data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEPEPSportsHub;
