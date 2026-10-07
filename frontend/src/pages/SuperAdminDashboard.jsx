import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building, 
  MapPin, 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle, 
  XCircle, 
  Check, 
  X,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4f46e5', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, verification, reviews

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [anRes, colRes, revRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/colleges/search'),
        api.get('/admin/reviews')
      ]);
      setAnalytics(anRes.data);
      setColleges(colRes.data);
      setReviews(revRes.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (collegeId, currentStatus) => {
    try {
      await api.put(`/admin/colleges/${collegeId}/verify?verified=${!currentStatus}`);
      setColleges((prev) =>
        prev.map((c) => (c.id === collegeId ? { ...c, verified: !currentStatus } : c))
      );
      // Refresh KPIs
      const anRes = await api.get('/admin/analytics');
      setAnalytics(anRes.data);
    } catch (err) {
      alert('Verification update failed.');
    }
  };

  const handleModerateReview = async (reviewId, newStatus) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}?status=${newStatus}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('Review moderation failed.');
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-xs text-slate-500">Loading Super Admin Intelligence Hub...</div>;
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            EduFind Analytics & Audit Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time higher education database statistics, institutional verification audit, and review moderation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'verification' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            College Audits ({colleges.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'reviews' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Colleges</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_colleges || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{kpis.verified_colleges} Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Districts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_districts || 0}</p>
          <span className="text-[10px] text-slate-500">Karnataka Region</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Courses</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_courses || 0}</p>
          <span className="text-[10px] text-slate-500">UG & PG Degrees</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_students || 0}</p>
          <span className="text-[10px] text-slate-500">Registered Users</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Reviews</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_reviews || 0}</p>
          <span className="text-[10px] text-slate-500">Public Comments</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-700">Pending Reviews</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{kpis.pending_reviews || 0}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Needs Moderation</span>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Colleges by District */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Colleges Distributed by District</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.colleges_by_district || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Colleges by Type (Pie Chart) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">College Breakdown by Institution Type</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.colleges_by_type || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(charts.colleges_by_type || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Most Searched Courses */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Most Searched Courses by Students</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.most_searched_courses || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="course" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="searches" fill="#0d9488" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Courses Popularity in Karnataka */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Course Offerings Across Campuses</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.courses_popularity || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: COLLEGE AUDIT & VERIFICATION TOGGLE */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Institution Verification Audit</h3>
              <p className="text-xs text-slate-500">Toggle official verified badges. Updates public verified indicators in real-time.</p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">College Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Last Audit Date</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colleges.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{col.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{col.district_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{col.college_type}</td>
                    <td className="py-3.5 px-4">
                      {col.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(col.last_updated).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleVerification(col.id, col.verified)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          col.verified
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {col.verified ? 'Revoke Badge' : 'Mark Verified'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Student Reviews Moderation</h3>
            <p className="text-xs text-slate-500">Approve or reject reviews to preserve quality and eliminate spam.</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{r.user_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-indigo-600 font-semibold">{r.college_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-amber-700">{r.overall_rating} ★</span>
                  </div>
                  {r.review_title && <p className="font-semibold text-slate-800">{r.review_title}</p>}
                  <p className="text-slate-600">{r.review}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>

                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleModerateReview(r.id, 'approved')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerateReview(r.id, 'rejected')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
