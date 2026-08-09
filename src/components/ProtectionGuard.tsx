import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface ProtectionGuardProps {
  isProtected: boolean;
}

export const ProtectionGuard: React.FC<ProtectionGuardProps> = ({ isProtected }) => {
  if (!isProtected) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col gap-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto">
          <Shield size={28} />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
            <Lock size={11} /> Maintenance Mode
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CTSpace Portal</h1>
          <p className="text-xs text-zinc-400 leading-relaxed mt-3">
            This site is currently under active construction and maintenance. Access is restricted while system updates are being completed.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 text-[11px] text-zinc-500 font-mono">
          System Status: Under Active Construction
        </div>
      </div>
    </div>
  );
};
