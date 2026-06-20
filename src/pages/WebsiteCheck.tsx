import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, CheckCircle, ArrowLeft, Loader2, Globe } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout } from '../firebase';

export default function WebsiteCheck() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goals, setGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name || !email) {
      setError('Please provide your website URL, name, and email.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        type: 'free_website_check',
        url,
        name,
        email,
        goals,
        status: 'new',
        created_at: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      };

      if (isFirebaseConfigured && db) {
        await withTimeout(addDoc(collection(db, "websiteChecks"), payload), 4000);
        // Optional webhook or internal notification
      } else {
        // Local fallback
        const localChecks = JSON.parse(localStorage.getItem('clarity_website_checks') || '[]');
        localChecks.push({ ...payload, id: 'req_' + Date.now() });
        localStorage.setItem('clarity_website_checks', JSON.stringify(localChecks));
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden py-20 px-4">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors font-mono uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black tracking-tight text-white mb-2">Request Received</h2>
              <p className="text-slate-400 font-light leading-relaxed">
                Thank you, {name}. I’ll review <strong>{url}</strong> and get back to you at <strong>{email}</strong> with 3 practical, actionable improvements shortly.
              </p>
            </div>
            <Link 
              to="/"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all w-full sm:w-auto"
            >
              Return to Homepage
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black tracking-tight text-white">Free Website Check</h1>
                <p className="text-slate-400 text-sm font-light mt-1">Get 3 actionable improvements for your current site.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="url" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Website URL *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. www.mybusiness.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goals" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Specific goals or issues? (Optional)</label>
                <textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Needs to load faster, better mobile view, more conversions..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-slate-950 font-bold rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-500/25 disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Submit for Review <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2 font-mono">
                <Shield className="w-3.5 h-3.5" /> Security & Privacy Assured
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
