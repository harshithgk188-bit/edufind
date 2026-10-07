import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Scale, 
  Heart, 
  BookOpen, 
  Briefcase, 
  Home, 
  Clock, 
  FileText,
  TrendingUp,
  Share2
} from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import { VerifiedBadge, CollegeTypeBadge } from '../components/common/Badge';
import CollegeMap from '../components/college/CollegeMap';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import { useCompare } from '../context/CompareContext';
import { useFavorites } from '../context/FavoritesContext';

export default function CollegeDetails() {
  const { id } = useParams();
  const { addCollege, removeCollege, isSelected } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, courses, admission, placements, reviews, map

  const inCompare = college ? isSelected(college.id) : false;
  const inFavorites = college ? isFavorite(college.id) : false;

  useEffect(() => {
    fetchCollegeData();
  }, [id]);

  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      const [colRes, revRes, sumRes] = await Promise.all([
        api.get(`/colleges/${id}`),
        api.get(`/colleges/${id}/ratings`),
        api.get(`/colleges/${id}/ratings/summary`)
      ]);
      setCollege(colRes.data);
      setReviews(revRes.data);
      setRatingSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load college profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-4">Loading verified college records...</p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">College Not Found</h2>
        <Link to="/colleges" className="text-xs font-semibold text-indigo-600 hover:underline mt-2 inline-block">
          Return to college directory
        </Link>
      </div>
    );
  }

  const latestPlacement = college.placements && college.placements.length > 0 ? college.placements[0] : null;

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. College Header Hero Banner */}
      <div className="relative bg-slate-900 text-white">
        <div className="h-64 sm:h-80 w-full overflow-hidden opacity-30">
          <img
            src={college.banner_url || college.image_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"}
            alt={college.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex flex-col justify-end pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge verified={college.verified} />
                <CollegeTypeBadge type={college.college_type} />
                {college.accreditation && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {college.accreditation}
                  </span>
                )}
                {college.established_year && (
                  <span className="text-xs text-slate-300">
                    Est. {college.established_year}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {college.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {college.address}
                </span>
                {college.affiliation && (
                  <span>Affiliated to: <strong className="text-white">{college.affiliation}</strong></span>
                )}
              </div>
            </div>

            {/* Actions: Compare & Favorite */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => inCompare ? removeCollege(college.id) : addCollege(college)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  inCompare
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(college)}
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  inFavorites
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${inFavorites ? 'fill-white' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Audit Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between text-xs text-indigo-900 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Verified Institutional Profile:</strong> Academic Year <strong>2025-2026</strong> Data.
            </span>
          </div>
          <span className="text-slate-500">
            Last Updated: {new Date(college.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
          {[
            { id: 'overview', label: 'Overview & Facilities' },
            { id: 'courses', label: `Courses & Fee Structure (${college.courses.length})` },
            { id: 'admission', label: 'Admissions & Eligibility' },
            { id: 'placements', label: 'Placements & Packages' },
            { id: 'map', label: 'Campus Map' },
            { id: 'reviews', label: `Student Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* About */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900">About {college.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {college.description || "Leading institution offering undergraduate and postgraduate degrees with state-of-the-art laboratory infrastructure."}
                </p>
              </div>

              {/* Campus Facilities */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">Campus Facilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {college.facilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{fac.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar: Contact & Highlights */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Information</h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  {college.phone && (
                    <li className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{college.phone}</span>
                    </li>
                  )}
                  {college.email && (
                    <li className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{college.email}</span>
                    </li>
                  )}
                  {college.website && (
                    <li className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                      <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline truncate">
                        {college.website}
                      </a>
                    </li>
                  )}
                  <li className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Type: <strong>{college.college_type}</strong></span>
                  </li>
                </ul>
              </div>

              {/* Mini Map preview */}
              <CollegeMap
                collegeName={college.name}
                address={college.address}
                latitude={college.latitude}
                longitude={college.longitude}
              />
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & FEES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Offered Programs & Detailed Annual Fee Structure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Academic Year 2025–2026. Official institutional fees without hidden charges.</p>
                </div>
              </div>

              {/* Courses Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Course Program</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Eligibility</th>
                      <th className="py-3 px-4 text-right">Tuition</th>
                      <th className="py-3 px-4 text-right">Exam & Other</th>
                      <th className="py-3 px-4 text-right">Total Annual Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {college.courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div>{c.short_code}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{c.name}</div>
                        </td>
                        <td className="py-4 px-4">{c.duration}</td>
                        <td className="py-4 px-4 max-w-xs text-slate-600">{c.eligibility}</td>
                        <td className="py-4 px-4 text-right">₹{Number(c.tuition_fee).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-right">₹{(Number(c.exam_fee) + Number(c.other_charges)).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-right font-extrabold text-indigo-700 text-sm">
                          ₹{Number(c.annual_fees).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ADMISSIONS */}
        {activeTab === 'admission' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Admission Procedure & Requirements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Application Procedure</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admission is conducted based on merit in 10+2 / Karnataka PUC examinations and applicable state common entrance tests (KCET / PGCET / KMAT). Candidates must register online through the institutional or state portal.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Mandatory Documents Required</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>SSLC / 10th Marks Card (Original & Copies)</li>
                  <li>PUC / 10+2 Marks Card or Equivalent</li>
                  <li>Transfer Certificate (TC) & Conduct Certificate</li>
                  <li>Migration Certificate (Non-Karnataka Students)</li>
                  <li>Aadhaar Card & 5 Passport-size Photographs</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PLACEMENTS */}
        {activeTab === 'placements' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Verified Placement Statistics</h3>

            {latestPlacement ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-xs font-bold uppercase text-indigo-600">Average Annual Package</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{latestPlacement.average_package} LPA</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Year: {latestPlacement.academic_year}</p>
                  </div>

                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-bold uppercase text-emerald-600">Highest Package Offered</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{latestPlacement.highest_package} LPA</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Campus Drive</p>
                  </div>

                  <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-bold uppercase text-amber-600">Placement Percentage</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{latestPlacement.placement_percentage}%</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Eligible Registered Batch</p>
                  </div>
                </div>

                {latestPlacement.recruiting_companies && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Recruiting Partners</h4>
                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {latestPlacement.recruiting_companies}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Placement statistics currently not reported for this college.</p>
            )}
          </div>
        )}

        {/* TAB 5: MAP */}
        {activeTab === 'map' && (
          <CollegeMap
            collegeName={college.name}
            address={college.address}
            latitude={college.latitude}
            longitude={college.longitude}
          />
        )}

        {/* TAB 6: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <ReviewList reviews={reviews} summary={ratingSummary} />
            <ReviewForm collegeId={college.id} onReviewSubmitted={fetchCollegeData} />
          </div>
        )}

      </div>

    </div>
  );
}
