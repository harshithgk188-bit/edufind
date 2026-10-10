import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Building2, School } from 'lucide-react';

export function VerifiedBadge({ verified = false, status = null }) {
  const currentStatus = status || (verified ? 'Verified' : 'Pending verification');

  if (currentStatus === 'Pending verification' || (!verified && currentStatus !== 'Verified')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Pending verification</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Verified</span>
    </span>
  );
}

export function OwnershipBadge({ ownership = "Private" }) {
  const styles = {
    Government: "bg-blue-50 text-blue-700 border-blue-200",
    "Government-aided": "bg-cyan-50 text-cyan-700 border-cyan-200",
    University: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Private: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const currentStyle = styles[ownership] || styles.Private;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${currentStyle}`}>
      {ownership}
    </span>
  );
}

export function CollegeTypeBadge({ type = "Private" }) {
  const styles = {
    Government: "bg-blue-50 text-blue-700 border-blue-200",
    Autonomous: "bg-purple-50 text-purple-700 border-purple-200",
    University: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Private: "bg-slate-100 text-slate-700 border-slate-200",
    Constituent: "bg-teal-50 text-teal-700 border-teal-200",
    Affiliated: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const currentStyle = styles[type] || styles.Private;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}>
      {type}
    </span>
  );
}

export function CategoryBadge({ category = "Degree College" }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
      {category}
    </span>
  );
}
