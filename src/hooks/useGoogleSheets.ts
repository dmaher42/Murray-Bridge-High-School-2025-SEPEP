import { useState, useCallback, useEffect } from "react";
import { loadConfig } from "../lib/config";

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
    const cfg = await loadConfig();
    const base = (cfg.apiUrl || "").replace(/\/exec.*$/, "");
    const url = new URL(base ? base + "/exec" : "");
    url.searchParams.set("action", "read");
    url.searchParams.set("id", sheetId);
    url.searchParams.set("ranges", ranges.join(","));
    if (apiKey) url.searchParams.set("key", apiKey);

    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) throw new Error(`Sheets API ${r.status}`);
    return r.json();
  }, [apiKey]);

  const writeToSheets = useCallback(async (sheetId: string, updates: any[]) => {
    const cfg = await loadConfig();
    const base = (cfg.apiUrl || "").replace(/\/exec.*$/, "");
    const url = base ? base + "/exec" : "";
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: sheetId, updates, key: apiKey }),
    });
    if (!r.ok) throw new Error(`Sheets API ${r.status}`);
    setLastSync(new Date());
    return r.json();
  }, [apiKey]);

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

export default useGoogleSheets;
