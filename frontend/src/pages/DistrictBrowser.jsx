import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, GraduationCap, Star, ArrowRight, BookOpen, Building } from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import { VerifiedBadge, CollegeTypeBadge } from '../components/common/Badge';

export default function DistrictBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const districtParam = searchParams.get('district_id') || '1'; // default Tumkur

  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(Number(districtParam));
  const [districtStats, setDistrictStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          api.get('/districts'),
          api.get('/courses')
        ]);
        setDistricts(dRes.data);
        setCourses(cRes.data);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedDistrictId) return;
      try {
        setLoading(true);
        const res = await api.get(`/districts/${selectedDistrictId}/stats`);
        setDistrictStats(res.data);
      } catch (err) {
        console.error('Failed to load district stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedDistrictId]);

  const handleSelectDistrict = (id) => {
    setSelectedDistrictId(id);
    setSearchParams({ district_id: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <MapPin className="w-4 h-4" />
          <span>Regional Higher Education Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Karnataka District Browser
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore colleges, available curriculums, and accreditation across Karnataka districts.
        </p>
      </div>

      {/* District Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {districts.map((d) => (
          <button
            key={d.id}
            onClick={() => handleSelectDistrict(d.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedDistrictId === d.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d.district_name} ({d.college_count})
          </button>
        ))}
      </div>

      {/* Selected District Dashboard Banner */}
      {districtStats && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">District Overview</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                Colleges in {districtStats.district_name} District
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                State: {districtStats.state} • Data verified via Department of Collegiate Education & Universities
              </p>
            </div>

            <Link
              to={`/colleges?district_id=${districtStats.district_id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all self-start sm:self-auto"
            >
              <span>Browse All {districtStats.total_colleges} Colleges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-bold text-indigo-600 uppercase">Total Colleges</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{districtStats.total_colleges}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Autonomous, Govt & Private</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-600 uppercase">Distinct Courses</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{districtStats.total_courses}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">UG & PG Curriculums</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs font-bold text-amber-600 uppercase">Average Rating</span>
              <p className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                {districtStats.average_rating} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
              </p>
              <div className="mt-1">
                <StarRating rating={districtStats.average_rating} size="xs" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
              <span className="text-xs font-bold text-purple-600 uppercase">Popular Search</span>
              <p className="text-xl font-black text-slate-900 mt-1">BCA & B.Com</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Highest Student Enquiries</p>
            </div>
          </div>

          {/* Quick Course Links in This District */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
              Search by Popular Courses in {districtStats.district_name}:
            </h3>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/colleges?district_id=${districtStats.district_id}&course=${c.short_code}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{c.short_code} in {districtStats.district_name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top-Rated Colleges in This District */}
          {districtStats.top_rated_colleges && districtStats.top_rated_colleges.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
                Top-Rated Institutions in {districtStats.district_name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {districtStats.top_rated_colleges.map((col) => (
                  <Link
                    key={col.id}
                    to={`/colleges/${col.slug || col.id}`}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-sm transition-all flex items-center gap-3.5 group bg-white"
                  >
                    <img
                      src={col.image_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80"}
                      alt={col.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {col.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CollegeTypeBadge type={col.college_type} />
                        <div className="flex items-center gap-1 text-xs text-amber-700 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{col.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
