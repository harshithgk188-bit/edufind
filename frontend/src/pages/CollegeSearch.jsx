import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Building2, MapPin, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import CollegeCard from '../components/college/CollegeCard';
import FilterSidebar from '../components/college/FilterSidebar';

export default function CollegeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const districtParam = searchParams.get('district_id') || searchParams.get('district') || '';
  const courseParam = searchParams.get('course') || 'All';
  const queryParam = searchParams.get('q') || '';
  const cityParam = searchParams.get('city') || '';

  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [coursesList, setCoursesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedDistrict, setSelectedDistrict] = useState(districtParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(courseParam);
  const [feeType, setFeeType] = useState('annual');
  const [selectedFeeRange, setSelectedFeeRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Lookups & Dynamic Metadata
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [cRes, dRes, metaRes] = await Promise.all([
          api.get('/courses'),
          api.get('/districts'),
          api.get('/colleges/meta')
        ]);
        setCoursesList(cRes.data);
        setDistrictsList(dRes.data);
        setMetadata(metaRes.data);
      } catch (err) {
        console.error('Failed to load lookup data:', err);
      }
    };
    fetchLookups();
  }, []);

  // Compute available cities for selected district
  const availableCities = React.useMemo(() => {
    if (!metadata?.cities_by_district) return [];
    if (!selectedDistrict) {
      // Flatten all cities
      const all = new Set();
      Object.values(metadata.cities_by_district).forEach((arr) => {
        arr.forEach((c) => all.add(c));
      });
      return Array.from(all).sort();
    }
    // Match selectedDistrict ID or name
    const foundDist = districtsList.find((d) => String(d.id) === String(selectedDistrict) || d.district_name.toLowerCase() === String(selectedDistrict).toLowerCase());
    const dName = foundDist ? foundDist.district_name : selectedDistrict;
    return metadata.cities_by_district[dName] || [];
  }, [metadata, selectedDistrict, districtsList]);

  // Refetch when filters or pagination change
  useEffect(() => {
    fetchFilteredColleges();
  }, [
    selectedDistrict,
    selectedCity,
    selectedCategory,
    selectedOwnership,
    selectedCourse,
    feeType,
    selectedFeeRange,
    selectedRating,
    selectedType,
    selectedVerification,
    selectedFacilities,
    sortBy,
    searchQuery,
    currentPage
  ]);

  const fetchFilteredColleges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedDistrict) {
        // Pass district_id if numeric, else district
        if (!isNaN(selectedDistrict)) {
          params.append('district_id', selectedDistrict);
        } else {
          params.append('district', selectedDistrict);
        }
      }

      if (selectedCity && selectedCity.trim()) params.append('city', selectedCity.trim());
      if (selectedCategory && selectedCategory !== 'All') params.append('college_category', selectedCategory);
      if (selectedOwnership && selectedOwnership !== 'All') params.append('ownership', selectedOwnership);
      if (selectedCourse && selectedCourse !== 'All') params.append('course', selectedCourse);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedType && selectedType !== 'All') params.append('college_type', selectedType);
      if (selectedRating > 0) params.append('min_rating', selectedRating);
      if (selectedFeeRange && selectedFeeRange !== 'all') params.append('fee_range', selectedFeeRange);
      if (feeType) params.append('fee_type', feeType);
      if (selectedVerification && selectedVerification !== 'All') params.append('verification_status', selectedVerification);
      if (sortBy) params.append('sort_by', sortBy);

      params.append('page', currentPage);
      params.append('page_size', pageSize);

      selectedFacilities.forEach((fac) => {
        params.append('facilities', fac);
      });

      const res = await api.get(`/colleges/search?${params.toString()}`);
      setColleges(res.data);

      const totalHeader = res.headers['x-total-count'];
      if (totalHeader) {
        setTotalCount(parseInt(totalHeader, 10));
      } else {
        setTotalCount(res.data.length);
      }
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
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCourse('All');
    setSelectedDistrict('');
    setSelectedCity('');
    setSelectedCategory('All');
    setSelectedOwnership('All');
    setSelectedFeeRange('all');
    setFeeType('annual');
    setSelectedRating(0);
    setSelectedType('All');
    setSelectedVerification('All');
    setSelectedFacilities([]);
    setSearchQuery('');
    setSortBy('rating');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by college name, city/taluk, or keyword (e.g. SIT, RVCE, GFGC, Vaisiri)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* District Quick Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedCity('');
                setCurrentPage(1);
              }}
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
            Showing <span className="text-indigo-600 font-bold">{totalCount}</span> colleges in Karnataka
            {selectedCourse !== 'All' && <span> offering <strong>{selectedCourse}</strong></span>}
            {selectedCity && <span> in <strong>{selectedCity}</strong></span>}
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="fees_asc">Fees: Low to High</option>
              <option value="fees_desc">Fees: High to Low</option>
              <option value="name">College Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedDistrict || selectedCity || selectedCategory !== 'All' || selectedOwnership !== 'All' || selectedCourse !== 'All' || selectedFeeRange !== 'all' || selectedRating > 0 || selectedVerification !== 'All' || selectedFacilities.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Active:</span>

            {selectedDistrict && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                District: {districtsList.find(d => String(d.id) === String(selectedDistrict))?.district_name || selectedDistrict}
                <X className="w-3 h-3 cursor-pointer hover:text-indigo-900" onClick={() => setSelectedDistrict('')} />
              </span>
            )}

            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                City: {selectedCity}
                <X className="w-3 h-3 cursor-pointer hover:text-indigo-900" onClick={() => setSelectedCity('')} />
              </span>
            )}

            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                {selectedCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-purple-900" onClick={() => setSelectedCategory('All')} />
              </span>
            )}

            {selectedOwnership !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                {selectedOwnership}
                <X className="w-3 h-3 cursor-pointer hover:text-teal-900" onClick={() => setSelectedOwnership('All')} />
              </span>
            )}

            {selectedCourse !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Course: {selectedCourse}
                <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCourse('All')} />
              </span>
            )}

            {selectedVerification !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                Status: {selectedVerification}
                <X className="w-3 h-3 cursor-pointer hover:text-amber-900" onClick={() => setSelectedVerification('All')} />
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors ml-2"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* Main Grid: Sidebar Filters + College Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedOwnership={selectedOwnership}
            setSelectedOwnership={setSelectedOwnership}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            feeType={feeType}
            setFeeType={setFeeType}
            selectedFeeRange={selectedFeeRange}
            setSelectedFeeRange={setSelectedFeeRange}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedVerification={selectedVerification}
            setSelectedVerification={setSelectedVerification}
            selectedFacilities={selectedFacilities}
            toggleFacility={toggleFacility}
            resetFilters={resetFilters}
            coursesList={coursesList}
            districtsList={districtsList}
            availableCities={availableCities}
          />
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <FilterSidebar
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedOwnership={selectedOwnership}
              setSelectedOwnership={setSelectedOwnership}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              feeType={feeType}
              setFeeType={setFeeType}
              selectedFeeRange={selectedFeeRange}
              setSelectedFeeRange={setSelectedFeeRange}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedVerification={selectedVerification}
              setSelectedVerification={setSelectedVerification}
              selectedFacilities={selectedFacilities}
              toggleFacility={toggleFacility}
              resetFilters={resetFilters}
              coursesList={coursesList}
              districtsList={districtsList}
              availableCities={availableCities}
            />
          </div>
        )}

        {/* Cards Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
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
                Try widening your fee budget, unchecking required facilities, or selecting "All Karnataka Districts".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {colleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-2 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-slate-500 font-semibold">
                    Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
}
