import React from 'react';
import StarRating from '../common/StarRating';
import { User, CheckCircle2, Calendar } from 'lucide-react';

export default function ReviewList({ reviews = [], summary = null }) {
  const distPercentages = summary?.distribution_percentage || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const categories = summary?.categories || {};

  return (
    <div className="space-y-8">
      
      {/* Summary Score & Distribution Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 mb-6">Student Ratings & Review Breakdown</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Overall Rating Big Card */}
          <div className="text-center md:border-r md:border-slate-100 md:pr-6">
            <p className="text-5xl font-extrabold text-slate-900 tracking-tight">
              {summary?.average_overall ? summary.average_overall.toFixed(1) : '4.2'}
            </p>
            <div className="flex justify-center my-2">
              <StarRating rating={summary?.average_overall || 4.2} size="md" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {summary?.total_reviews || reviews.length} verified ratings
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="space-y-2 md:col-span-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = distPercentages[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-slate-700 flex items-center gap-1">
                    {star} <span className="text-amber-400">★</span>
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right font-medium text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Category Averages Row */}
        {Object.keys(categories).length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Category Score Insights</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(categories).map(([cat, val]) => (
                <div key={cat} className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-[11px] text-slate-500 capitalize">{cat}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{val.toFixed(1)} / 5</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-slate-900">Recent Student Reviews ({reviews.length})</h4>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-sm">
            No reviews submitted yet. Be the first student to review this college!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {rev.user_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{rev.user_name}</p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  <StarRating rating={rev.overall_rating} size="xs" />
                  <span className="text-xs font-bold text-amber-900">{rev.overall_rating}</span>
                </div>
              </div>

              {rev.review_title && (
                <h5 className="text-sm font-semibold text-slate-900">{rev.review_title}</h5>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">{rev.review}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
