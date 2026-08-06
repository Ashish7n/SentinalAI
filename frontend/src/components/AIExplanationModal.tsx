import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { AIDecisionExplanation } from '../types';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: AIDecisionExplanation | null;
  title?: string;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  explanation,
  title = 'AI Decision Intelligence Audit & Reasoning'
}) => {
  if (!isOpen || !explanation) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Backend Math + Gemini 1.5 Flash Synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Deterministic Score Verification Passed</span>
          </div>
          <span className="font-extrabold bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-900">
            {(explanation.confidenceScore * 100).toFixed(0)}% Confidence
          </span>
        </div>

        {/* Core Reason */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Reasoning & Justification</span>
          </label>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-800 font-medium">
            {explanation.reason}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Key Contributing Factors</span>
          </label>
          <ul className="grid grid-cols-1 gap-2">
            {explanation.contributingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternatives Considered */}
        {explanation.alternativesConsidered.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Alternatives Evaluated</span>
            </label>
            <div className="text-xs text-slate-600 space-y-1 font-medium">
              {explanation.alternativesConsidered.map((alt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stated Limitations */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <strong className="text-slate-800">System Stated Limitation:</strong>
          <p className="font-medium">{explanation.statedLimitations}</p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm"
          >
            Close Audit Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};
