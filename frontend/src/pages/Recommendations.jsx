import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Award, ArrowRight, Sliders, MapPin, GraduationCap, DollarSign, Star, Home, Briefcase } from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import { CollegeTypeBadge } from '../components/common/Badge';

export default function Recommendations() {
  const [districts, setDistricts] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form inputs
  const [districtId, setDistrictId] = useState('');
  const [courseCode, setCourseCode] = useState('BCA');
  const [maxBudget, setMaxBudget] = useState(75000);
  const [minRating, setMinRating] = useState(4.0);
  const [hostelRequired, setHostelRequired] = useState(false);
  const [placementImportance, setPlacementImportance] = useState('High');
  const [collegeType, setCollegeType] = useState('Any');

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          api.get('/districts'),
          api.get('/courses')
        ]);
        setDistricts(dRes.data);
        setCourses(cRes.data);
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    fetchLookups();
  }, []);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasCalculated(true);

    try {
      const res = await api.post('/recommendations', {
        district_id: districtId ? Number(districtId) : null,
        course_code: courseCode || null,
        max_budget: maxBudget ? Number(maxBudget) : null,
        min_rating: Number(minRating),
        hostel_required: hostelRequired,
        placement_importance: placementImportance,
        college_type: collegeType !== 'Any' ? collegeType : null
      });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Recommendation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial calculation once data is ready
  useEffect(() => {
    if (courses.length > 0 && !hasCalculated) {
      handleCalculate();
    }
  }, [courses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Decision Intelligence Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart College Recommendation System
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell us your budget, preferred district, and career focus. Our algorithm matches verified college records and calculates an accurate percentage match.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Preference Wizard Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 lg:col-span-1">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Your Preferences</h3>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            
            {/* Preferred District */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred District</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any Karnataka District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desired Course */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Desired Course / Program</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.short_code}>
                    {c.short_code} – {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Maximum Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Maximum Annual Budget</label>
                <span className="font-extrabold text-indigo-600">₹{Number(maxBudget).toLocaleString('en-IN')}/yr</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>₹10,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Student Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="3.5">3.5 & Above (Good)</option>
                <option value="4.0">4.0 & Above (Very Good)</option>
                <option value="4.5">4.5 & Above (Top Tier)</option>
              </select>
            </div>

            {/* Placement Importance */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Placement Priority</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPlacementImportance(p)}
                    className={`py-1.5 rounded-lg font-bold transition-colors ${
                      placementImportance === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* College Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institution Type</label>
              <select
                value={collegeType}
                onChange={(e) => setCollegeType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Any">Any Type</option>
                <option value="Government">Government Only</option>
                <option value="Autonomous">Autonomous Only</option>
                <option value="Private">Private Only</option>
                <option value="University">University Only</option>
              </select>
            </div>

            {/* Hostel Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hostelRequired}
                  onChange={(e) => setHostelRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Campus Hostel Required</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Options...' : 'Generate Recommendations'}</span>
            </button>

          </form>
        </div>

        {/* Right: Results List with Match Score % and Reasoning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Personalized Recommendations ({recommendations.length})
            </h3>
            <span className="text-xs text-slate-500">Sorted by Highest Match Score</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
              No colleges found that strictly fulfill all chosen criteria. Try increasing the annual budget or lowering minimum ratings.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.college_id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.image_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80"}
                      alt={rec.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <Link to={`/colleges/${rec.slug || rec.college_id}`}>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors">
                          {rec.name}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{rec.district_name}</span>
                        <CollegeTypeBadge type={rec.college_type} />
                      </div>
                    </div>
                  </div>

                  {/* Big Match Score % Badge */}
                  <div className="self-start sm:self-center flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-200">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-extrabold">{rec.match_score}% Match</span>
                  </div>
                </div>

                {/* Natural Language Transparent Explanation (Section 11 Requirement) */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  <span className="font-bold text-indigo-700">Why recommended: </span>
                  {rec.reasoning}
                </div>

                {/* Metrics Row */}
                <div className="flex flex-wrap items-center justify-between pt-1 text-xs gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Annual Fee</span>
                      <p className="font-bold text-slate-900">₹{Number(rec.annual_fees).toLocaleString('en-IN')}/yr</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Student Rating</span>
                      <div className="flex items-center gap-1 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rec.overall_rating} / 5</span>
                      </div>
                    </div>
                    {rec.placement_package && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Package</span>
                        <p className="font-bold text-emerald-700">{rec.placement_package} LPA</p>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/colleges/${rec.slug || rec.college_id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <span>View College Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
