// BEGIN UI FROM USER (convert to TSX as needed, keep structure/behavior)
import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Trophy, Home, Users, Calendar, BarChart3, Settings, Medal, Target, TrendingUp, RefreshCw, Save, Cloud, CloudOff, Plus, Edit3, Check, X } from 'lucide-react';

// Google Sheets Integration Hook
const useGoogleSheets = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const extractSheetId = (url: string) => {
    const match = url.match(/spreadsheets\\/d\\/([a-zA-Z0-9-_]+)/);
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
  const readFromSheets = useCallback(async (sheetId: string, ranges: string[]) => {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          valueRanges: ranges.map(range => ({
            range,
            values: generateMockSheetData(range)
          }))
        });
      }, 1000);
    });
  }, []);
  const writeToSheets = useCallback(async (sheetId: string, updates: any[]) => {
    console.log('Writing to sheets:', updates);
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

// Mock data generator for demonstration
const generateMockSheetData = (range: string) => {
  if (range.includes('Scoreboard')) {
    return [
      ['2024 Neighbourhood SEPEP Scoreboard'],
      [''],
      ['', 'Wirakuthi', '532'],
      ['', 'Pondi', '390'],
      ['', 'Kungari', '643.5'],
      ['', 'No:RI', '754.5']
    ];
  }
  return [['Sample', 'Data', 'Row']];
};

type Stand = { team: string; wins: number; draws: number; losses: number; points: number; tpsr: number };
type YearData = { standings?: Stand[]; matches?: { homeTeam: string; awayTeam: string; score: string; round?: string; status?: string }[] };

// Score Update Modal Component
const ScoreUpdateModal = ({ isOpen, onClose, onSave, yearLevels, teams }:{
  isOpen: boolean; onClose: () => void; onSave: (d:any)=>Promise<void>|void; yearLevels: string[]; teams: string[];
}) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !score1 || !score2) return;
    setSaving(true);
    const updateData = {
      yearLevel: selectedYear, homeTeam: selectedTeam1, awayTeam: selectedTeam2,
      homeScore: parseInt(score1), awayScore: parseInt(score2), timestamp: new Date().toISOString()
    };
    await onSave(updateData);
    setSelectedTeam1(''); setSelectedTeam2(''); setScore1(''); setScore2(''); setSaving(false); onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Update Score</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        {/* ...keep the rest of the JSX and controls identical to the user’s version... */}
      </div>
    </div>
  );
};

// Main App Component
const SEPEPSportsHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'upload'|'overview'|'houses'|'fixtures'|'results'|'teams'>('upload');
  const [sepepData, setSepepData] = useState<any>({
    houses: { Wirakuthi: 0, Pondi: 0, Kungari: 0, "No:RI": 0 },
    yearLevels: [], fixtures: [], results: {}, teams: {}, loaded: false, lastUpdated: null
  });
  const [loading, setLoading] = useState(false);
  const [selectedYearLevel, setSelectedYearLevel] = useState<'all'|string>('all');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [notifications, setNotifications] = useState<{id:number;message:string;type:'info'|'success'|'error';timestamp:Date}[]>([]);
  const sheets = useGoogleSheets();
  const houseColors: Record<string,string> = {
    Wirakuthi: 'from-blue-500 to-blue-600',
    Pondi: 'from-red-500 to-red-600',
    Kungari: 'from-green-500 to-green-600',
    "No:RI": 'from-yellow-500 to-yellow-600'
  };
  const showNotification = useCallback((message:string, type:'info'|'success'|'error'='info') => {
    const notification = { id: Date.now(), message, type, timestamp: new Date() };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notification.id)), 5000);
  }, []);
  const saveToLocalStorage = useCallback((data:any) => {
    try { localStorage.setItem('sepep_data', JSON.stringify({ ...data, savedAt: new Date().toISOString() })); } catch {}
  }, []);
  const loadFromLocalStorage = useCallback(() => {
    try { const saved = localStorage.getItem('sepep_data'); if (saved) return JSON.parse(saved); } catch {}
    return null;
  }, []);
  const handleSheetsConnection = useCallback(async (url:string, apiKey = '') => {
    try {
      setLoading(true); showNotification('🔗 Connecting to Google Sheets...', 'info');
      const sheetId = await sheets.connectToSheets(url, apiKey);
      const ranges = ['Scoreboard!A:C','Year 7 (Line 2)!A:N','Year 7 (Line 5)!A:Q','Fixture!A:G'];
      const data = await sheets.readFromSheets(sheetId!, ranges);
      const parsedData = parseGoogleSheetsData(data);
      setSepepData({ ...parsedData, loaded: true, lastUpdated: new Date().toLocaleString() });
      saveToLocalStorage(parsedData); showNotification('✅ Successfully connected to Google Sheets!', 'success');
    } catch (e:any) { showNotification(`❌ Connection failed: ${e.message}`, 'error'); }
    finally { setLoading(false); }
  }, [sheets, showNotification, saveToLocalStorage]);
  const parseGoogleSheetsData = useCallback((data:any) => ({
    houses: { Wirakuthi: 532, Pondi: 390, Kungari: 643.5, "No:RI": 754.5 },
    yearLevels: ['Year 7 (Line 2)', 'Year 7 (Line 5)', 'Year 8', 'Year 9 (Line 1)', 'Year 9 (Line 7)'],
    fixtures: [
      { week: 3, 'Year 7 (Line 2)': 'Netball', 'Year 7 (Line 5)': 'T-Ball', 'Year 8': 'Pool Sports', 'Year 9 (Line 1)': 'Volleyball', 'Year 9 (Line 7)': 'Touch Football' },
      { week: 4, 'Year 7 (Line 2)': 'T-Ball', 'Year 7 (Line 5)': 'Soccer', 'Year 8': 'Multi-Sport', 'Year 9 (Line 1)': 'Touch Football', 'Year 9 (Line 7)': 'Netball' }
    ],
    results: {
      'Year 7 (Line 2)': {
        standings: [
          { team: 'Mingle Masters Kungari 3', wins: 8, draws: 2, losses: 4, points: 73.5, tpsr: 41.5 },
          { team: 'Watermelon Goats Kungari 2', wins: 7, draws: 1, losses: 5, points: 73, tpsr: 45 },
          { team: 'Pondi Predators', wins: 6, draws: 0, losses: 6, points: 67, tpsr: 43 },
          { team: 'Tilted Towers Kungari 1', wins: 5, draws: 1, losses: 8, points: 66, tpsr: 41 },
        ],
        matches: [
          { homeTeam: 'Tilted Towers Kungari 1', awayTeam: 'Watermelon Goats Kungari 2', score: '2-1', round: 'Round 1', status: 'Final' },
          { homeTeam: 'Pondi Pelicans', awayTeam: 'Watermelon Goats Kungari 2', score: 'Live', round: 'Round 2', status: 'Live' }
        ]
      }
    ],
    teams: {
      'Year 9 Line 7': {
        'Blue Swans': ['Hallie','Lashyia','Riley','Zedino','Tamkia','Ella','Josh','Nhial','Jay'],
        'Blue Tongues': ['Rocco','Enchi','Kobi P','Carter','Jordan','Zion','Calliope','CJ','Anbella'],
        'Stingrays': ['Shayla','Nate','Emily','Mia N','Kedan','Kobe','Eddy','Steph','Jaiden']
      }
    }
  }), []);
  const handleScoreSave = useCallback(async (updateData:any) => {
    try {
      showNotification('💾 Saving score to Google Sheets...', 'info');
      const updatedResults = { ...sepepData.results };
      if (updatedResults[updateData.yearLevel]) {
        updatedResults[updateData.yearLevel].matches.unshift({
          homeTeam: updateData.homeTeam, awayTeam: updateData.awayTeam,
          score: `${updateData.homeScore}-${updateData.awayScore}`, round: 'Latest', status: 'Final'
        });
        const standings = updatedResults[updateData.yearLevel].standings as Stand[];
        const homeTeam = standings?.find(t => t.team === updateData.homeTeam);
        const awayTeam = standings?.find(t => t.team === updateData.awayTeam);
        if (homeTeam && awayTeam) {
          if (updateData.homeScore > updateData.awayScore) { homeTeam.wins += 1; awayTeam.losses += 1; homeTeam.points += 3; }
          else if (updateData.homeScore < updateData.awayScore) { awayTeam.wins += 1; homeTeam.losses += 1; awayTeam.points += 3; }
          else { homeTeam.draws += 1; awayTeam.draws += 1; homeTeam.points += 1; awayTeam.points += 1; }
        }
      }
      const newData = { ...sepepData, results: updatedResults, lastUpdated: new Date().toLocaleString() };
      setSepepData(newData); saveToLocalStorage(newData);
      if (sheets.isConnected) { const sheetId = (sheets as any).extractSheetId || 'demo'; await sheets.writeToSheets(sheetId, [updateData]); }
      showNotification('✅ Score saved successfully!', 'success');
    } catch (e:any) { showNotification(`❌ Failed to save score: ${e.message}`, 'error'); }
  }, [sepepData, sheets, showNotification, saveToLocalStorage]);
  const loadSampleData = useCallback(() => {
    setLoading(true); showNotification('📊 Loading sample SEPEP data...', 'info');
    setTimeout(() => {
      const sampleData = parseGoogleSheetsData(null); setSepepData({ ...sampleData, loaded: true, lastUpdated: new Date().toLocaleString() });
      saveToLocalStorage(sampleData); setLoading(false); showNotification('✅ Sample data loaded successfully!', 'success');
    }, 1500);
  }, [parseGoogleSheetsData, saveToLocalStorage, showNotification]);
  useEffect(() => {
    if (sheets.isConnected) {
      const interval = setInterval(async () => { try { console.log('Auto-syncing with Google Sheets...'); } catch {} }, 30000);
      return () => clearInterval(interval);
    }
  }, [sheets.isConnected]);
  useEffect(() => {
    const savedData = loadFromLocalStorage();
   if (savedData && savedData.loaded) { setSepepData(savedData); showNotification('📂 Loaded saved SEPEP data', 'info'); }
  }, [loadFromLocalStorage, showNotification]);
  const getAllTeams = useCallback(() => {
    const teams = new Set<string>();
    Object.values(sepepData.results).forEach((yearData:any) => { yearData.standings?.forEach((s:Stand) => teams.add(s.team)); });
    return Array.from(teams);
  }, [sepepData.results]);
  const navItems = [
    { id: 'upload', label: 'Setup', icon: Settings },
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'houses', label: 'House Scores', icon: Trophy },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Users }
  ] as const;
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      {/* Header, Nav, Notifications, Sections, Modal, Footer, Loading Overlay — keep layout exactly as user’s UI */ }
      {/* Reuse the user’s full JSX for all sections here (convert to TSX where needed). */}
    </div>
  );
};
export default SEPEPSportsHub;
// END UI FROM USER
