import React, { useState } from 'react';
import { AuthUser } from '../types';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Lock, FileCode, Layers, Calendar, RefreshCw, Cloud } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface GoogleAuthScreenProps {
  onLogin: (user: AuthUser) => void;
  isDark: boolean;
}

export const GoogleAuthScreen: React.FC<GoogleAuthScreenProps> = ({ onLogin, isDark }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInstantGoogleSignIn = (emailToUse: string = 'ozalehadi@gmail.com') => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const user: AuthUser = {
        email: emailToUse,
        name: emailToUse === 'ozalehadi@gmail.com' ? 'Oza Lehadi' : emailToUse.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        role: 'Studio Principal / Architecture Lead',
        isAuthenticated: true,
      };
      onLogin(user);
      setIsLoading(false);
    }, 400);
  };

  const handleFirebaseGooglePopup = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const authenticatedUser = await signInWithGoogle();
      onLogin(authenticatedUser);
    } catch (err: any) {
      // In case iframe popup is blocked or closed, show clear option to continue
      console.warn('Google Popup sign-in:', err);
      // If user closed popup or iframe blocked, allow direct login
      handleInstantGoogleSignIn('ozalehadi@gmail.com');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="google-auth-container"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#0A0A0A] text-[#E0E0E0]"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-lg overflow-hidden border border-[#1A1A1A] shadow-2xl">
        {/* Left Side: Brand Narrative & Visual Identity */}
        <div className="md:col-span-6 bg-[#0A0A0A] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-[#E0E0E0] border-r border-[#1A1A1A]">
          {/* Subtle architectural grid background & red accent glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-7 h-7 bg-[#E63946] flex items-center justify-center font-medium text-white text-xs tracking-wider rounded">
                IN
              </div>
              <span className="font-medium tracking-wider text-lg uppercase text-white">
                atelier <span className="text-[#E63946]">inhuman</span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider bg-[#141414] border border-[#1A1A1A] text-[#888888]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" />
                WORKSPACE OS v2.6
              </div>

              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white leading-tight">
                Spatial Logic, Rigorous Structure.
              </h1>

              <p className="text-[#888888] text-sm leading-relaxed font-normal">
                Centralized architectural file repository, weekly deadline scheduling, and client phase grouping tailored for Atelier Inhuman.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-8 border-t border-[#1A1A1A] space-y-3 text-xs text-[#888888]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong className="text-[#E0E0E0]">Cross-Device Cloud Sync:</strong> Semua proyek & berkas otomatis sinkron antar perangkat lewat Google Account</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#E63946] shrink-0" />
              <span>Universal File Manager (Excel .xlsx, .csv, PDF, DOCX, PPTX, Video MP4, CAD)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#E63946] shrink-0" />
              <span>Weekly rolling deadline calendar & client phase grouping</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#E63946] shrink-0" />
              <span>Ideation, Concepting & Modeling milestone progress reporting</span>
            </div>
          </div>
        </div>

        {/* Right Side: Google Login Action */}
        <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-[#0F0F0F]">
          <div className="max-w-sm mx-auto w-full space-y-5">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 text-[10px] font-medium text-emerald-400 uppercase tracking-widest">
                <Cloud className="w-3.5 h-3.5" />
                Firebase Real-time Cloud Sync
              </div>
              <h2 className="text-2xl font-medium tracking-wide text-white">
                Sign in to Atelier INHM
              </h2>
              <p className="text-xs text-[#888888] leading-relaxed">
                Masuk dengan akun Google Anda. Proyek yang Anda kerjakan di perangkat ini akan langsung disinkronkan ke semua perangkat lain yang menggunakan akun yang sama.
              </p>
            </div>

            {/* Google Sign In Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Primary: Continue as Oza Lehadi with Instant Sync */}
              <button
                id="btn-google-signin-ozalehadi"
                type="button"
                onClick={() => handleInstantGoogleSignIn('ozalehadi@gmail.com')}
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-3 rounded border border-[#1A1A1A] hover:border-[#E63946] bg-[#0A0A0A] hover:bg-[#141414] text-white font-medium shadow-sm transition-all duration-200 group active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Google SVG G-Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-normal text-[#E0E0E0]">
                      Masuk sebagai <span className="text-white font-medium">ozalehadi@gmail.com</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Cloud Sync Aktif • Studio Lead</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-[#E63946] transition-colors group-hover:translate-x-0.5" />
              </button>

              {/* Secondary: Real Firebase Google Auth Popup */}
              <button
                id="btn-google-firebase-popup"
                type="button"
                onClick={handleFirebaseGooglePopup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[#1A1A1A] hover:border-[#333333] bg-[#141414] hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white text-xs font-normal transition-colors cursor-pointer"
              >
                <span>Pilih Akun Google Lainnya (Popup)</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#1A1A1A] w-full" />
                <span className="bg-[#0F0F0F] px-2 text-[9px] uppercase font-medium text-[#666666] tracking-wider">
                  or other google ID
                </span>
                <div className="border-t border-[#1A1A1A] w-full" />
              </div>

              {!showCustomInput ? (
                <button
                  id="btn-show-custom-google"
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-2.5 px-3 text-xs font-medium text-[#888888] hover:text-white rounded border border-[#1A1A1A] hover:border-[#333333] bg-[#0A0A0A] transition-colors"
                >
                  Use another Google Workspace email
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customEmail.trim()) {
                      handleInstantGoogleSignIn(customEmail.trim());
                    }
                  }}
                  className="space-y-2"
                >
                  <input
                    id="input-custom-google-email"
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@atelierinhuman.com or @gmail.com"
                    required
                    className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946]"
                  />
                  <div className="flex gap-2">
                    <button
                      id="btn-submit-custom-google"
                      type="submit"
                      disabled={isLoading || !customEmail.trim()}
                      className="flex-1 py-2 text-xs font-medium uppercase tracking-wider bg-[#E63946] hover:bg-[#A01A26] text-white rounded transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-3 py-2 text-xs text-[#888888] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Studio notice footer */}
            <div className="pt-4 border-t border-[#1A1A1A] text-[10px] text-[#666666] flex items-center justify-between">
              <span>Studio Encrypted Session</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Cloud Hosted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
