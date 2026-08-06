import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { ShieldCheck, Smartphone, KeyRound, User, Calendar, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface CitizenLoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: Mobile Input
  const [mobileNumber, setMobileNumber] = useState('+91 9876543210');
  
  // Step 2: OTP & Profile Inputs
  const [otp, setOtp] = useState('123456');
  const [fullName, setFullName] = useState('Ananya Sharma');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authAPI.requestCitizenOTP(mobileNumber);
      setOtpSentMsg(`OTP Sent! Use test code: ${res.testOtp}`);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !fullName.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authAPI.verifyCitizenOTP({
        mobileNumber,
        otp,
        fullName,
        age,
        gender
      });

      onLoginSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Safety Portal</h1>
        <p className="text-xs text-slate-500 font-medium">Mobile OTP Verification & Profile Registration</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
          {errorMsg}
        </div>
      )}

      {otpSentMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {otpSentMsg}
          </span>
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: MOBILE NUMBER REQUEST */
        <form onSubmit={handleRequestOtp} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Mobile Phone Number</span>
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !mobileNumber.trim()}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Sending Verification SMS...' : 'Send Verification OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* STEP 2: OTP VERIFICATION & PROFILE DETAILS */
        <form onSubmit={handleVerifyOtp} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          
          <div>
            <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>6-Digit Verification OTP</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-center tracking-widest text-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ananya Sharma"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Age</span>
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 24)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !otp.trim() || !fullName.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-sm"
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP & Access Citizen Portal'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-all pt-1 font-semibold"
          >
            ← Change Mobile Phone Number
          </button>
        </form>
      )}

      {/* Privacy Guarantee */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 shadow-sm font-medium">
        <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>End-to-End Encrypted Mobile OTP Authentication.</span>
      </div>

    </div>
  );
};
