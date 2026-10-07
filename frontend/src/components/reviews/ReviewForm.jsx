import React, { useState } from 'react';
import StarRating from '../common/StarRating';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReviewForm({ collegeId, onReviewSubmitted }) {
  const { user } = useAuth();

  const [overallRating, setOverallRating] = useState(5.0);
  const [academicsRating, setAcademicsRating] = useState(4.5);
  const [facultyRating, setFacultyRating] = useState(4.5);
  const [infrastructureRating, setInfrastructureRating] = useState(4.5);
  const [placementRating, setPlacementRating] = useState(4.5);
  const [hostelRating, setHostelRating] = useState(4.0);
  const [valueRating, setValueRating] = useState(4.5);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-600 font-medium">Please sign in to write an official student review for this college.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setErrorMsg('Please share detailed comments about your college experience.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post(`/colleges/${collegeId}/ratings`, {
        overall_rating: overallRating,
        academics_rating: academicsRating,
        faculty_rating: facultyRating,
        infrastructure_rating: infrastructureRating,
        placement_rating: placementRating,
        hostel_rating: hostelRating,
        value_rating: valueRating,
        review_title: reviewTitle.trim() || 'Student College Experience',
        review: reviewText.trim()
      });

      setSuccessMsg('Thank you! Your verified review has been submitted.');
      setReviewTitle('');
      setReviewText('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit review. You may have already reviewed this college.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { label: 'Academics & Curriculum', value: academicsRating, setter: setAcademicsRating },
    { label: 'Faculty & Mentorship', value: facultyRating, setter: setFacultyRating },
    { label: 'Campus Infrastructure & Labs', value: infrastructureRating, setter: setInfrastructureRating },
    { label: 'Placements & Opportunities', value: placementRating, setter: setPlacementRating },
    { label: 'Hostel & Mess Life', value: hostelRating, setter: setHostelRating },
    { label: 'Value for Money', value: valueRating, setter: setValueRating },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div>
        <h4 className="text-base font-bold text-slate-900">Write an Honest Student Review</h4>
        <p className="text-xs text-slate-500 mt-0.5">Help aspiring students understand the real ground situation and academics.</p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overall Star Rating */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Overall Rating (1–5 Stars)</label>
          <p className="text-xs text-slate-500">How would you summarize your overall experience?</p>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={overallRating} size="md" interactive={true} onChange={setOverallRating} />
          <span className="text-sm font-bold text-slate-900 w-8 text-right">{overallRating}.0</span>
        </div>
      </div>

      {/* 6 Category Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
            <span className="text-xs font-medium text-slate-700">{cat.label}</span>
            <div className="flex items-center gap-1.5">
              <StarRating rating={cat.value} size="sm" interactive={true} onChange={cat.setter} />
              <span className="text-xs font-semibold text-slate-800 w-6 text-right">{cat.value}.0</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Review Headline / Title
        </label>
        <input
          type="text"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          placeholder="e.g. Excellent computer labs, supportive faculty, and decent placements"
          className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Review Text Body */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Detailed Comments & Feedback
        </label>
        <textarea
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience regarding syllabus coverage, coding practicals, campus placement rounds, hostel food quality, and annual fees..."
          className="w-full text-sm rounded-xl border border-slate-200 p-3.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
      </button>
    </form>
  );
}
