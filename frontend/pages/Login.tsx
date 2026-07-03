import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, ShieldCheck, UserPlus, FileText } from 'lucide-react';
import axios from 'axios';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isRegister) {
      if (!nik.trim() || !nama.trim() || !departemen.trim() || !password.trim()) {
        setError('Semua kolom input wajib diisi.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post('/api/auth/register', {
          username: nik.trim(),
          nama: nama.trim(),
          departemen: departemen.trim(),
          sandi: password.trim()
        });

        if (response.data.success) {
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk.');
          setIsRegister(false);
          setPassword('');
        } else {
          setError(response.data.error || 'Pendaftaran gagal.');
        }
      } catch (err: any) {
        console.error('Register error:', err);
        const errMsg = err.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    } else {
      if (!nik.trim() || !password.trim()) {
        setError('Username dan sandi wajib diisi.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post('/api/auth/login', {
          nik: nik.trim(),
          password: password.trim()
        });

        if (response.data.success && response.data.user) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onLoginSuccess(response.data.user);
        } else {
          setError(response.data.error || 'Autentikasi gagal.');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        const errMsg = err.response?.data?.error || 'Koneksi gagal. Silakan coba lagi.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Header Voksel logo style */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xl border border-blue-500">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">VOKSEL ELECTRIC</h1>
            <p className="text-[10px] text-blue-400 font-mono tracking-widest font-semibold uppercase mt-0.5">Smart IT Assistant</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-950/40 border border-rose-500/35 text-rose-200 rounded-xl p-3 text-xs text-center font-medium leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-950/40 border border-emerald-500/35 text-emerald-200 rounded-xl p-3 text-xs text-center font-medium leading-relaxed"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="login-nik" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
              {isRegister ? 'Username (NIK)' : 'Username'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="login-nik"
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder={isRegister ? "Contoh: VOK123" : "Masukkan Username"}
                disabled={loading}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition duration-200"
              />
            </div>
          </div>

          {isRegister && (
            <>
              {/* Nama Lengkap */}
              <div className="space-y-1.5 text-left animate-fadeIn">
                <label htmlFor="login-nama" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="login-nama"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan Nama Lengkap"
                    disabled={loading}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-655 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition duration-200"
                  />
                </div>
              </div>

              {/* Departemen */}
              <div className="space-y-1.5 text-left animate-fadeIn">
                <label htmlFor="login-dept" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Departemen / Divisi</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <FileText className="h-4 w-4" />
                  </span>
                  <input
                    id="login-dept"
                    type="text"
                    value={departemen}
                    onChange={(e) => setDepartemen(e.target.value)}
                    placeholder="Contoh: IT Support / Produksi"
                    disabled={loading}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-655 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition duration-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="login-password" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Sandi</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Sandi"
                disabled={loading}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-bold transition active:scale-[0.98] shadow-lg shadow-blue-900/25 hover:shadow-blue-600/15 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? <UserPlus className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                <span>{isRegister ? 'Daftar Karyawan Baru' : 'Login'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register Link */}
        <div className="pt-2 text-center border-t border-slate-850/50 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition"
          >
            {isRegister ? 'Sudah punya akun? Login disini' : 'Belum punya akun? Daftar disini'}
          </button>

          {!isRegister && (
            <p className="text-[9px] text-slate-500 font-medium">
              Demo Akun: <span className="font-mono text-slate-400">Username: VOK001</span> dengan <span className="font-mono text-slate-400">Sandi: admin</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
