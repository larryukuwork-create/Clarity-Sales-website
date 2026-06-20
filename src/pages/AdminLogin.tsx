import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Using import.meta.env for simple client-side check.
    const CORRECT_PASSWORD = (import.meta as any).env.VITE_ADMIN_ACCESS_PASSWORD;
    
    if (!CORRECT_PASSWORD) {
      setErrorMsg("Security Block: Env variable VITE_ADMIN_ACCESS_PASSWORD is not declared in your environment/Workspace Secrets.");
      return;
    }
    
    if (CORRECT_PASSWORD === "clarityadmin") {
      setErrorMsg("Security Block: Unsafe default password 'clarityadmin' cannot be used. Please update VITE_ADMIN_ACCESS_PASSWORD in Workspace Secrets.");
      return;
    }
    
    if (password === CORRECT_PASSWORD) {
      // Very simple local session storage
      sessionStorage.setItem('clarity_admin_auth', 'true');
      navigate('/outreach');
    } else {
      setError(true);
      setErrorMsg("Incorrect access key");
      setTimeout(() => {
        setError(false);
        setErrorMsg("");
      }, 3000);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');
  const CORRECT_PASSWORD_CHECK = (import.meta as any).env.VITE_ADMIN_ACCESS_PASSWORD;
  const isEnvUnset = !CORRECT_PASSWORD_CHECK;
  const isEnvPlaceholder = CORRECT_PASSWORD_CHECK === "clarityadmin";

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-900/10 blur-[150px]" />
      </div>

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-cyan-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Outreach Command</h1>
        <p className="text-sm text-slate-400 mb-8">Secure access for Clarity Space leads and strategy management.</p>

        {isEnvUnset && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 mb-6 text-xs text-red-300 leading-relaxed font-mono">
            ⚠️ <strong>Configuration Error:</strong> VITE_ADMIN_ACCESS_PASSWORD environment variable is not declared. Go to Workspace Settings to configure your password securely before authenticating.
          </div>
        )}

        {isEnvPlaceholder && (
          <div className="bg-amber-950/40 border border-amber-900/50 rounded-2xl p-4 mb-6 text-xs text-amber-300 leading-relaxed font-mono">
            ⚠️ <strong>Security Advisory:</strong> You are using the default password "clarityadmin" which is unsafe and disabled. Please set a unique, strong password in VITE_ADMIN_ACCESS_PASSWORD.
          </div>
        )}

        {errorMsg && !isEnvUnset && !isEnvPlaceholder && (
          <div className="bg-red-950/30 border border-red-900/30 text-xs rounded-xl p-3 text-red-400 mb-4 font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key"
              disabled={isEnvUnset || isEnvPlaceholder}
              className={`w-full px-4 py-3 bg-[#020617] border rounded-xl focus:outline-none transition-all text-sm text-white disabled:opacity-50 ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500'}`}
              autoFocus={!isEnvUnset && !isEnvPlaceholder}
            />
          </div>

          <button 
            type="submit"
            disabled={isEnvUnset || isEnvPlaceholder}
            className="w-full py-3 bg-white text-slate-950 disabled:opacity-30 disabled:hover:bg-white font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Authenticate <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
