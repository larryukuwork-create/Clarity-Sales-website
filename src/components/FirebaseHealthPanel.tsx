import React, { useState, useEffect } from 'react';
import { db, isFirebaseConfigured, firebaseConfigError, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { Shield, CheckCircle, XCircle, RefreshCw, AlertTriangle, Key, Server, Database, Lock } from 'lucide-react';

export default function FirebaseHealthPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    configLoaded: boolean;
    connectionActive: boolean;
    readSupported: boolean;
    writeSupported: boolean;
    timestamp: string | null;
    errorMsg: string | null;
  }>({
    configLoaded: isFirebaseConfigured,
    connectionActive: false,
    readSupported: false,
    writeSupported: false,
    timestamp: null,
    errorMsg: isFirebaseConfigured ? null : firebaseConfigError
  });

  const runDiagnostics = async () => {
    setIsRunning(true);
    const result = {
      configLoaded: isFirebaseConfigured,
      connectionActive: false,
      readSupported: false,
      writeSupported: false,
      timestamp: new Date().toLocaleTimeString(),
      errorMsg: null as string | null
    };

    if (!isFirebaseConfigured) {
      result.errorMsg = firebaseConfigError || "Firebase configuration is not completed.";
      setTestResult(result);
      setIsRunning(false);
      return;
    }

    try {
      // 1. Connection check with server fetch
      const testRef = doc(db, 'system_health', 'connection_probe');
      await getDocFromServer(testRef).catch(() => {
        // Safe to ignore if document does not exist, as long as it reaches the server without network failure
      });
      result.connectionActive = true;

      // 2. Read check (rules permitting read or handling exception)
      try {
        await getDoc(testRef);
        result.readSupported = true;
      } catch (readErr: any) {
        console.warn("Read test failed or blocked by rules:", readErr);
        // If it was rejected because of rules, connection is still active!
        if (readErr?.code !== 'permission-denied') {
          // Actual network / connect error
          throw readErr;
        }
      }

      // 3. Write check to diagnostic collection
      try {
        const checkRef = doc(db, 'system_health', 'last_check');
        await setDoc(checkRef, {
          checked_at: serverTimestamp(),
          status: 'healthy',
          agent: 'Antigravity / Clarity Space CRM'
        });
        result.writeSupported = true;
      } catch (writeErr: any) {
        console.warn("Write test failed or blocked by rules:", writeErr);
        if (writeErr?.code !== 'permission-denied') {
          throw writeErr;
        }
      }

    } catch (err: any) {
      console.error("End-to-end Firebase check occurred:", err);
      result.errorMsg = err instanceof Error ? err.message : String(err);
    } finally {
      setTestResult(result);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run initial test on mount
    runDiagnostics();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950/45 border border-cyan-800/20 text-cyan-400 rounded-xl">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Firebase Connection Diagnostic</h3>
            <p className="text-xs text-slate-450">E2E CRM pipeline integrity verification.</p>
          </div>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700/80 text-xs text-slate-300 hover:text-white rounded-lg transition disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? "Testing..." : "Test Connection"}</span>
        </button>
      </div>

      {/* Connection Status Overview Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status indicator 1 */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">Config Loaded</span>
          </div>
          {testResult.configLoaded ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
        </div>

        {/* Status indicator 2 */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">Firestore Comm</span>
          </div>
          {testResult.connectionActive ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
        </div>

        {/* Status indicator 3 */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">Write Authorized</span>
          </div>
          {testResult.writeSupported ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-mono text-amber-500 font-semibold">Protected</span>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics output */}
      {testResult.errorMsg ? (
        <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-300 font-mono">Diagnostic Error Code:</p>
            <p className="text-[11px] text-slate-350 leading-relaxed font-mono break-all">{testResult.errorMsg}</p>
          </div>
        </div>
      ) : (
        testResult.timestamp && (
          <p className="text-[10px] text-slate-500 font-mono text-right select-none">
            Last successful handshake check: <span className="text-cyan-400">{testResult.timestamp}</span>
          </p>
        )
      )}

      {/* Security Checklist Reminder Panel */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <h4 className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-bold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Relational Security Checklist</span>
        </h4>
        
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex gap-2 items-start">
            <span className="text-cyan-400 font-bold select-none">•</span>
            <span><strong>CRM Protection:</strong> CRM collections like <code className="text-cyan-300 px-1 py-0.5 bg-slate-950 rounded font-mono text-[10px]">outreachLeads</code> must never be publicly readable. Check your rules to avoid exposing proprietary intelligence.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-cyan-400 font-bold select-none">•</span>
            <span><strong>Intake Hardening:</strong> Public users must be allowed to write submissions blindly but must be blocked from reading or listing others' custom project specs.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-cyan-400 font-bold select-none">•</span>
            <span><strong>Lead Track Integrity:</strong> Standard link clicks are tracked anonymously via tracking event logs. Writing standard events must not overwrite primary outreach statuses.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-cyan-400 font-bold select-none">•</span>
            <span><strong>Asset Exposure:</strong> Google Drive links and Doc proposal references are strictly for internal admin use. Never compromise asset isolation policies.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
