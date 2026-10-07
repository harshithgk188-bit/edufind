import React from 'react';
import { CheckCircle2, ShieldCheck, Building2, School } from 'lucide-react';

export function VerifiedBadge({ verified = false }) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Unverified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Verified by Admin</span>
    </span>
  );
}

export function CollegeTypeBadge({ type = "Private" }) {
  const styles = {
    Government: "bg-blue-50 text-blue-700 border-blue-200",
    Autonomous: "bg-purple-50 text-purple-700 border-purple-200",
    University: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Private: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const currentStyle = styles[type] || styles.Private;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}>
      {type}
    </span>
  );
}
