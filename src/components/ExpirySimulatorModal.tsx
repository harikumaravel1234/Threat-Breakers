import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Bell, 
  Check 
} from 'lucide-react';

interface ExpirySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: number;
  onApplyDays: (days: number) => void;
}

export const ExpirySimulatorModal: React.FC<ExpirySimulatorModalProps> = ({
  isOpen,
  onClose,
  currentDays,
  onApplyDays,
}) => {
  const [simulatedDays, setSimulatedDays] = useState(currentDays);

  if (!isOpen) return null;

  const isExpired = simulatedDays <= 0;
  const isCritical = simulatedDays > 0 && simulatedDays <= 7;
  const isWarning = simulatedDays > 7 && simulatedDays <= 30;
  const isHealthy = simulatedDays > 30;

  const handleApply = () => {
    onApplyDays(simulatedDays);
    onClose();
  };

  const handleReset = () => {
    setSimulatedDays(28);
    onApplyDays(28);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Certificate Expiry & Alert Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Test how scorecard grades, alerting rules, and browser security screens react.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Days Slider */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Simulated Validity Window:
            </span>
            <span className={`text-base font-mono font-bold ${
              isExpired ? 'text-rose-400' :
              isCritical ? 'text-rose-400' :
              isWarning ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {isExpired ? 'Expired (0 days)' : `${simulatedDays} Days Left`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={90}
            value={simulatedDays}
            onChange={(e) => setSimulatedDays(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <button
              onClick={() => setSimulatedDays(0)}
              className="hover:text-rose-400 transition-colors"
            >
              0d (Outage)
            </button>
            <button
              onClick={() => setSimulatedDays(4)}
              className="hover:text-rose-400 transition-colors"
            >
              4d (Critical)
            </button>
            <button
              onClick={() => setSimulatedDays(28)}
              className="hover:text-amber-400 transition-colors"
            >
              28d (Warning)
            </button>
            <button
              onClick={() => setSimulatedDays(85)}
              className="hover:text-emerald-400 transition-colors"
            >
              85d (Healthy)
            </button>
          </div>
        </div>

        {/* Browser Interruption Mock */}
        <div className={`p-4 rounded-xl border space-y-2 text-xs ${
          isExpired
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : isCritical
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : isWarning
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {isExpired ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : isCritical ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : isWarning ? (
              <Clock className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {isExpired
                ? 'Fatal Browser Alert: NET::ERR_CERT_DATE_INVALID'
                : isCritical
                ? 'Critical Expiry: Immediate Outage Warning'
                : isWarning
                ? 'Expiring Soon Warning: Renewal Scheduled'
                : 'Nominal Operational State'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isExpired
              ? 'Every visitor will see a full-page security block requiring manual bypass. API clients and payment gateways will terminate connections instantly.'
              : isCritical
              ? 'Certbot/ACME renewal failures likely. Operations team must intervene manually within 168 hours.'
              : isWarning
              ? 'Standard automated ACME renewal window open (30 days prior to expiry). Certbot will re-verify domain control.'
              : 'Certificate is well within validity lifecycle. No manual intervention required.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            Reset Default (28d)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              Apply Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
