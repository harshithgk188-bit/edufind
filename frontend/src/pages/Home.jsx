import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  TrendingUp,
  Compass,
  CheckCircle2,
  Users
} from 'lucide-react';
import api from '../services/api';
import CollegeCard from '../components/college/CollegeCard';

export default function Home({ onOpenAiChat }) {
  const navigate = useNavigate();

  const [districts, setDistricts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topColleges, setTopColleges] = useState([]);

  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('1'); // Default Tumkur
  const [selectedCourse, setSelectedCourse] = useState('BCA'); // Default BCA

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, courseRes, colRes] = await Promise.all([
          api.get('/districts'),
          api.get('/courses'),
          api.get('/colleges/search?sort_by=rating')
        ]);
        setDistricts(distRes.data);
        setCourses(courseRes.data);
        setTopColleges(colRes.data.slice(0, 3));
      } catch (err) {
        console.error('Home load error:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/colleges?district_id=${selectedDistrict}&course=${selectedCourse}`);
  };

  const popularCoursesList = [
    { code: 'BCA', name: 'Bachelor of Computer Applications', duration: '3 Years', desc: 'Software development, algorithms, web & cloud tech' },
    { code: 'MCA', name: 'Master of Computer Applications', duration: '2 Years', desc: 'Advanced computing, artificial intelligence, enterprise systems' },
    { code: 'B.Com', name: 'Bachelor of Commerce', duration: '3 Years', desc: 'Financial accounting, taxation, corporate finance' },
    { code: 'BBA', name: 'Bachelor of Business Administration', duration: '3 Years', desc: 'Business management, operations, marketing leadership' },
    { code: 'BE / CS', name: 'Bachelor of Engineering (CS)', duration: '4 Years', desc: 'Computer architecture, high performance computing' },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Higher Education Discovery System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find the Right College for Your <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-sky-300 bg-clip-text text-transparent">Future</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Search, compare and discover colleges, courses, fees, ratings and admission information in one place. Verified data with zero guesswork.
          </p>

          {/* Prominent Search Interface */}
          <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-200/40 text-slate-900">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end">
              
              {/* State */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">State</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-transparent w-full focus:outline-none cursor-pointer"
                  >
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
              </div>

              {/* District */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">District</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                  <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-transparent w-full focus:outline-none cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Course</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-transparent w-full focus:outline-none cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.short_code}>
                        {c.short_code} ({c.name.split('(')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Find Colleges Button */}
              <div>
                <button
                  type="submit"
                  className="w-full h-[42px] px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Colleges</span>
                </button>
              </div>

            </form>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Example:</span> State: Karnataka → District: Tumkur → Course: BCA
              </span>
              <button
                type="button"
                onClick={onOpenAiChat}
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask EduFind AI Assistant
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top Rated Colleges Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Highest Rated Institutions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Rated Colleges in Karnataka
            </h2>
          </div>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View All Colleges</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topColleges.map((col) => (
            <CollegeCard key={col.id} college={col} />
          ))}
        </div>
      </section>

      {/* 3. Popular Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Curriculum Options</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Undergraduate & Postgraduate Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore industry-aligned curriculums with detailed annual fees and eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularCoursesList.map((pc, idx) => (
            <Link
              key={idx}
              to={`/colleges?course=${pc.code}`}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-extrabold px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {pc.code}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{pc.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {pc.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pc.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Explore Colleges</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Popular Districts Section */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Geographic Discovery</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Explore Colleges by District
              </h2>
            </div>
            <Link
              to="/districts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>All Districts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {districts.map((d) => (
              <Link
                key={d.id}
                to={`/colleges?district_id=${d.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {d.district_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {d.college_count} {d.college_count === 1 ? 'College' : 'Colleges'} Available
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose EduFind & How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The EduFind Advantage</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Why Students Trust EduFind for College Admissions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">100% Verified Fee Structures</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Clear transparent breakdown of tuition fees, examination fees, and other charges with academic year audits.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Side-by-Side Comparison Matrix</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Compare up to 3 institutions simultaneously on ratings, placements, hostels, and total course fees.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI Assistant & Recommendation Engine</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Multi-criteria recommendation scoring and conversational AI assistant bounded strictly to real database facts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold">How EduFind Works in 3 Steps</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <div>
                  <h4 className="text-sm font-bold text-indigo-200">Select Your District & Desired Course</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Filter by Tumkur, Bangalore, Mysore, or other regions with BCA, MCA, or MBA.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <div>
                  <h4 className="text-sm font-bold text-indigo-200">Inspect Verified Data & Compare</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Review NAAC accreditation, campus hostel facilities, and student reviews.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">3</span>
                <div>
                  <h4 className="text-sm font-bold text-indigo-200">Get Recommendation & Take Admission</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Use the matching score engine or consult the EduFind AI Assistant to make your decision.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-800/60">
              <Link
                to="/recommendations"
                className="w-full py-3 bg-white hover:bg-slate-100 text-indigo-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Calculate Recommendation Match</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
