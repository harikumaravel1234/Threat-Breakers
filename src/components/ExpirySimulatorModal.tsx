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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26374F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Certificate Expiry & Alert Simulator
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Test how scorecard grades, alerting rules, and browser security screens react.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Days Slider */}
        <div className="space-y-4 bg-[#0B1220] p-4 rounded-xl border border-[#26374F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Simulated Validity Window:
            </span>
            <span className={`text-base font-mono font-bold ${
              isExpired ? 'text-[#F43F5E]' :
              isCritical ? 'text-[#F43F5E]' :
              isWarning ? 'text-[#FACC15]' : 'text-[#10B981]'
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
            className="w-full accent-[#06B6D4] cursor-pointer h-2 bg-[#1B2B42] rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
            <button
              onClick={() => setSimulatedDays(0)}
              className="hover:text-[#F43F5E] transition-colors cursor-pointer"
            >
              0d (Outage)
            </button>
            <button
              onClick={() => setSimulatedDays(4)}
              className="hover:text-[#F43F5E] transition-colors cursor-pointer"
            >
              4d (Critical)
            </button>
            <button
              onClick={() => setSimulatedDays(28)}
              className="hover:text-[#FACC15] transition-colors cursor-pointer"
            >
              28d (Warning)
            </button>
            <button
              onClick={() => setSimulatedDays(85)}
              className="hover:text-[#10B981] transition-colors cursor-pointer"
            >
              85d (Healthy)
            </button>
          </div>
        </div>

        {/* Browser Interruption Mock */}
        <div className={`p-4 rounded-xl border space-y-2 text-xs ${
          isExpired
            ? 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
            : isCritical
            ? 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
            : isWarning
            ? 'bg-[#FACC15]/15 border-[#FACC15]/40 text-[#FACC15]'
            : 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {isExpired ? (
              <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />
            ) : isCritical ? (
              <AlertTriangle className="w-4 h-4 text-[#F43F5E]" />
            ) : isWarning ? (
              <Clock className="w-4 h-4 text-[#FACC15]" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
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
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
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
            className="px-4 py-2 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Reset Default (28d)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:bg-[#1B2B42] hover:text-[#F8FAFC] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl transition-colors shadow-sm shadow-[#3B82F6]/30 cursor-pointer"
            >
              Apply Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
