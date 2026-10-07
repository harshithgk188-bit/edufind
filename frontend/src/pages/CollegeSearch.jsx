import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Building2, MapPin } from 'lucide-react';
import api from '../services/api';
import CollegeCard from '../components/college/CollegeCard';
import FilterSidebar from '../components/college/FilterSidebar';

export default function CollegeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const districtParam = searchParams.get('district_id') || '';
  const courseParam = searchParams.get('course') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [colleges, setColleges] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedDistrict, setSelectedDistrict] = useState(districtParam);
  const [selectedCourse, setSelectedCourse] = useState(courseParam);
  const [selectedFeeRange, setSelectedFeeRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [cRes, dRes] = await Promise.all([
          api.get('/courses'),
          api.get('/districts')
        ]);
        setCoursesList(cRes.data);
        setDistrictsList(dRes.data);
      } catch (err) {
        console.error('Failed to load lookup data:', err);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchFilteredColleges();
  }, [selectedDistrict, selectedCourse, selectedFeeRange, selectedRating, selectedType, selectedFacilities, sortBy, searchQuery]);

  const fetchFilteredColleges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district_id', selectedDistrict);
      if (selectedCourse && selectedCourse !== 'All') params.append('course', selectedCourse);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedType && selectedType !== 'All') params.append('college_type', selectedType);
      if (selectedRating > 0) params.append('min_rating', selectedRating);
      if (selectedFeeRange && selectedFeeRange !== 'all') params.append('fee_range', selectedFeeRange);
      if (sortBy) params.append('sort_by', sortBy);

      selectedFacilities.forEach((fac) => {
        params.append('facilities', fac);
      });

      const res = await api.get(`/colleges/search?${params.toString()}`);
      setColleges(res.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facilityName) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  const resetFilters = () => {
    setSelectedCourse('All');
    setSelectedDistrict('');
    setSelectedFeeRange('all');
    setSelectedRating(0);
    setSelectedType('All');
    setSelectedFacilities([]);
    setSearchQuery('');
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Search & Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name, city, or keyword (e.g. SIT Tumkur)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* District Quick Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Karnataka Districts</option>
              {districtsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district_name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sm:hidden px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>
        </div>

        {/* Results Counter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs gap-3">
          <p className="font-semibold text-slate-700">
            Found <span className="text-indigo-600 font-bold">{colleges.length}</span> accredited colleges
            {selectedCourse !== 'All' && <span> offering <strong>{selectedCourse}</strong></span>}
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="fees_asc">Fees: Low to High</option>
              <option value="fees_desc">Fees: High to Low</option>
              <option value="name">College Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + College Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedFeeRange={selectedFeeRange}
            setSelectedFeeRange={setSelectedFeeRange}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedFacilities={selectedFacilities}
            toggleFacility={toggleFacility}
            resetFilters={resetFilters}
            coursesList={coursesList}
          />
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <FilterSidebar
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              selectedFeeRange={selectedFeeRange}
              setSelectedFeeRange={setSelectedFeeRange}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedFacilities={selectedFacilities}
              toggleFacility={toggleFacility}
              resetFilters={resetFilters}
              coursesList={coursesList}
            />
          </div>
        )}

        {/* Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Colleges Match Your Current Filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your fee budget, unchecking required facilities, or switching to "All Karnataka Districts".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
