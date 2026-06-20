import React, { useState, useEffect } from 'react';
import { googleSignIn, initAuth, getAccessToken, logout } from '../auth';
import { User } from 'firebase/auth';
import { Folder, File as FileIcon, LogOut, RefreshCw, Upload } from 'lucide-react';

export default function DriveIntegration() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
        fetchFiles();
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        fetchFiles();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setFiles([]);
    setNeedsAuth(true);
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webviewLink)&orderBy=modifiedTime desc', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to fetch files', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
        <h3 className="text-lg font-semibold text-white">Google Drive Integration</h3>
        <p className="text-slate-400 text-sm text-center max-w-sm">
          Connect your Google Drive to manage client assets, proposals, and documents directly from the dashboard.
        </p>
        <button onClick={handleLogin} disabled={isLoggingIn} className="gsi-material-button mt-4">
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper p-2 bg-white rounded flex items-center gap-3 pr-4 shadow hover:bg-gray-50 transition cursor-pointer">
            <div className="gsi-material-button-icon bg-white w-6 h-6">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents font-medium text-gray-700 text-sm">{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Google Drive</h3>
          <p className="text-xs text-slate-400">Connected as {user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFiles} className="p-2 bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="p-2 bg-slate-950 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-800 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {files.length === 0 && !isLoading && (
          <div className="text-slate-500 text-sm text-center py-4">No files found.</div>
        )}
        {files.map((file) => (
          <a
            key={file.id}
            href={file.webviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-slate-950/50 hover:bg-slate-800/50 rounded-xl border border-slate-800 transition group"
          >
            {file.mimeType.includes('folder') ? (
              <Folder className="w-5 h-5 text-amber-500" />
            ) : (
              <FileIcon className="w-5 h-5 text-cyan-500" />
            )}
            <span className="text-sm text-slate-300 group-hover:text-white transition line-clamp-1">{file.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
