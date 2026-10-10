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
  AlertTriangle,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Clock,
  HelpCircle,
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
  const [unverifiedList, setUnverifiedList] = useState([]);
  const [missingDataList, setMissingDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, verification, unverified, missing, import_csv, reviews

  // CSV Import State
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [anRes, colRes, revRes, unvRes, misRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/colleges/search?page_size=200'),
        api.get('/admin/reviews'),
        api.get('/admin/unverified'),
        api.get('/admin/missing-data')
      ]);
      setAnalytics(anRes.data);
      setColleges(colRes.data);
      setReviews(revRes.data);
      setUnverifiedList(unvRes.data);
      setMissingDataList(misRes.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (collegeId, currentStatus) => {
    const nextStatus = currentStatus ? "Pending verification" : "Verified";
    try {
      await api.put(`/admin/colleges/${collegeId}/verify?status=${nextStatus}`);
      setColleges((prev) =>
        prev.map((c) => (c.id === collegeId ? { ...c, verified: !currentStatus, verification_status: nextStatus } : c))
      );
      // Refresh KPIs and unverified list
      const [anRes, unvRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/unverified')
      ]);
      setAnalytics(anRes.data);
      setUnverifiedList(unvRes.data);
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

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a CSV file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setImporting(true);
      setImportResult(null);
      const res = await api.post("/admin/colleges/import-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImportResult(res.data);
      await fetchDashboardData();
    } catch (err) {
      alert("CSV import failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setImporting(false);
    }
  };

  const handleTriggerSeed = async () => {
    if (!window.confirm("Synchronize and re-seed all 65+ verified institutions into database?")) return;
    try {
      setSeedLoading(true);
      setSeedNotice(null);
      const res = await api.post("/admin/seed");
      setSeedNotice(res.data.message || "Seeding complete!");
      await fetchDashboardData();
    } catch (err) {
      alert("Seeding failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSeedLoading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-xs text-slate-500">Loading Super Admin Intelligence Hub...</div>;
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            EduFind Analytics & Audit Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time higher education database statistics, verification audit, CSV batch importer, and review moderation.
          </p>
        </div>

        {/* Global Seeder Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSeed}
            disabled={seedLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin' : ''}`} />
            <span>{seedLoading ? 'Syncing...' : 'Sync Verified Dataset'}</span>
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
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
          All Colleges ({colleges.length})
        </button>
        <button
          onClick={() => setActiveTab('unverified')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'unverified' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Pending Verification ({unverifiedList.length})
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'missing' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          Missing Data Audit ({missingDataList.length})
        </button>
        <button
          onClick={() => setActiveTab('import_csv')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'import_csv' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          Batch CSV Import
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

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Colleges</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_colleges || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{kpis.verified_colleges || 0} Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Districts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_districts || 0}</p>
          <span className="text-[10px] text-slate-500">Tumakuru, BLR Urban/Rural</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Courses</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_courses || 0}</p>
          <span className="text-[10px] text-slate-500">UG & PG Curriculums</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_students || 0}</p>
          <span className="text-[10px] text-slate-500">Registered Users</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-700">Pending Verify</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{kpis.pending_verification || 0}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Needs Inspection</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Reviews</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total_reviews || 0}</p>
          <span className="text-[10px] text-slate-500">Moderated Comments</span>
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

            {/* Chart 2: Colleges by Ownership */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Breakdown by Ownership Type</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.colleges_by_ownership || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(charts.colleges_by_ownership || []).map((entry, index) => (
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

            {/* Chart 4: Courses Popularity */}
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

      {/* TAB 2: ALL COLLEGES AUDIT */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Institution Verification Audit</h3>
              <p className="text-xs text-slate-500">Inspect verified badges and toggle verification status in real-time.</p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">College Name</th>
                  <th className="py-3 px-4">District / City</th>
                  <th className="py-3 px-4">Ownership</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colleges.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{col.name}</div>
                      {col.alternate_name && <div className="text-[11px] text-slate-400 font-normal">{col.alternate_name}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {col.city ? `${col.city}, ` : ''}{col.district_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{col.ownership || 'Private'}</td>
                    <td className="py-3.5 px-4">
                      {col.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending verification
                        </span>
                      )}
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

      {/* TAB 3: PENDING VERIFICATION REVIEW (Vaisiri IMT, etc.) */}
      {activeTab === 'unverified' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900">Unverified / Pending Verification Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutions flagged as pending verification (e.g. Vaisiri Institute of Management of Technology). Missing details remain uninvented until confirmed.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 self-start sm:self-auto">
              {unverifiedList.length} Pending Records
            </span>
          </div>

          {unverifiedList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All colleges in the directory have been fully verified.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">College Name</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">City / Taluk</th>
                    <th className="py-3 px-4">Data Source</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unverifiedList.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                        {item.alternate_name && <span className="text-slate-400 font-normal"> ({item.alternate_name})</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.district}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.city || 'Tumakuru'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.data_source || 'Affiliation Records'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleVerification(item.id, false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          Verify & Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MISSING DATA AUDIT */}
      {activeTab === 'missing' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Missing Data & Completeness Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies colleges with missing contact info (phone, email, website), missing pincode, or no courses listed.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">College Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Missing Attributes</th>
                  <th className="py-3 px-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missingDataList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.city}, {item.district}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.missing_fields?.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Missing {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-600">{item.verification_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BATCH CSV IMPORT */}
      {activeTab === 'import_csv' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Batch College CSV Import</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk upload verified college records using CSV. Automatically normalizes districts, checks for duplicates, and creates courses.
              </p>
            </div>
            <a
              href="data:text/csv;charset=utf-8,college_name,alternate_name,district,city,locality,address,pincode,college_type,ownership,college_category,affiliation,university_name,accreditation,established_year,website,phone,email,hostel_available,transport_available,library_available,placement_available,average_package,highest_package,rating,rating_source,data_source,verification_status%0A%22Sample%20College%20Name%22,%22SCN%22,%22Tumakuru%22,%22Tumakuru%22,%22B.H.%20Road%22,%22B.H.%20Road,%20Tumakuru,%20Karnataka%20572102%22,%22572102%22,%22Affiliated%22,%22Private%22,%22Degree%20College%22,%22Tumkur%20University%22,%22Tumkur%20University%22,%22NAAC%20B%22,2010,%22http://samplecollege.ac.in%22,%22%2B91%20816%202280000%22,%22info@samplecollege.ac.in%22,True,True,True,True,%224.5%20LPA%22,%228.0%20LPA%22,4.2,%22University%20Directory%22,%22Official%20Records%22,%22Verified%22"
              download="sample_colleges.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </a>
          </div>

          <form onSubmit={handleCsvUpload} className="space-y-4 max-w-xl">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <label className="block text-xs font-bold text-slate-700 cursor-pointer">
                <span>Select a .csv file to import</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <p className="text-xs text-indigo-600 font-semibold mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || importing}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{importing ? "Processing CSV..." : "Upload and Import Colleges"}</span>
            </button>
          </form>

          {importResult && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Import Summary</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 font-bold">
                  {importResult.inserted} Inserted
                </div>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-900 font-bold">
                  {importResult.updated} Updated
                </div>
                <div className="p-2 rounded-lg bg-slate-200 text-slate-800 font-bold">
                  {importResult.skipped} Skipped
                </div>
                <div className="p-2 rounded-lg bg-rose-100 text-rose-900 font-bold">
                  {importResult.failed} Failed
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 text-rose-700 text-[11px] space-y-1">
                  <strong>Errors:</strong>
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Student Reviews Moderation</h3>
              <p className="text-xs text-slate-500">Approve or reject community reviews before they appear publicly on college profiles.</p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rev.college_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{rev.user_name}</div>
                      <div className="text-[10px] text-slate-400">{rev.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-700">{rev.overall_rating} ⭐</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      <div className="font-bold text-slate-800">{rev.review_title}</div>
                      <div className="text-[11px] truncate">{rev.review}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        rev.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== 'approved' && (
                          <button
                            onClick={() => handleModerateReview(rev.id, 'approved')}
                            className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            onClick={() => handleModerateReview(rev.id, 'rejected')}
                            className="p-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
