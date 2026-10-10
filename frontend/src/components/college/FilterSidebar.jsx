import React from 'react';
import { Filter, RotateCcw, MapPin, Building, GraduationCap, DollarSign, Award, CheckCircle2 } from 'lucide-react';

export default function FilterSidebar({
  selectedDistrict,
  setSelectedDistrict,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  selectedOwnership,
  setSelectedOwnership,
  selectedCourse,
  setSelectedCourse,
  feeType,
  setFeeType,
  selectedFeeRange,
  setSelectedFeeRange,
  selectedRating,
  setSelectedRating,
  selectedType,
  setSelectedType,
  selectedVerification,
  setSelectedVerification,
  selectedFacilities,
  toggleFacility,
  resetFilters,
  coursesList = [],
  districtsList = [],
  availableCities = []
}) {
  const feeRanges = [
    { label: 'All Budgets', value: 'all' },
    { label: 'Under ₹25,000', value: 'under_25k' },
    { label: '₹25,000 – ₹50,000', value: '25k_50k' },
    { label: '₹50,000 – ₹1,00,000', value: '50k_100k' },
    { label: 'Above ₹1,00,000', value: 'above_100k' },
  ];

  const ratingOptions = [
    { label: 'Any Rating', value: 0 },
    { label: '4.5 & above ⭐', value: 4.5 },
    { label: '4.0 & above ⭐', value: 4.0 },
    { label: '3.5 & above ⭐', value: 3.5 },
  ];

  const ownershipOptions = ['All', 'Government', 'Government-aided', 'Private', 'University'];
  const collegeTypes = ['All', 'Government', 'Private', 'Autonomous', 'University'];
  
  const categoryOptions = [
    'All',
    'Engineering and Technology',
    'Arts, Science and Commerce',
    'Management',
    'BCA / Degree College',
    'Autonomous University'
  ];

  const facilityOptions = [
    { name: 'Hostel', key: 'hostel' },
    { name: 'Transportation / Bus', key: 'transport' },
    { name: 'Library', key: 'library' },
    { name: 'Placement Cell', key: 'placement' },
    { name: 'Wi-Fi', key: 'wifi' },
    { name: 'Computer Lab', key: 'lab' },
    { name: 'Sports Complex', key: 'sports' },
    { name: 'Canteen', key: 'canteen' }
  ];

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Search Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. District Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          <span>District</span>
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            if (setSelectedCity) setSelectedCity('');
          }}
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">All Karnataka Districts</option>
          {districtsList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.district_name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. City / Taluk Filter */}
      {availableCities && availableCities.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-500" />
            <span>City / Taluk</span>
          </label>
          <select
            value={selectedCity || ''}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Cities / Taluks</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. College Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
          <span>College Category</span>
        </label>
        <select
          value={selectedCategory || 'All'}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Ownership Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Management Ownership
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ownershipOptions.map((own) => (
            <button
              type="button"
              key={own}
              onClick={() => setSelectedOwnership(own)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (selectedOwnership || 'All') === own
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {own}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Course Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Program / Degree
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">All Programs</option>
          {coursesList.map((c) => (
            <option key={c.id} value={c.short_code}>
              {c.short_code} – {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 6. Fee Type & Budget Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Fee Budget
          </label>
          {/* Fee Type Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFeeType && setFeeType('annual')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                (feeType || 'annual') === 'annual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Annual
            </button>
            <button
              type="button"
              onClick={() => setFeeType && setFeeType('total')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                feeType === 'total' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Total Fee
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {feeRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 select-none py-0.5"
            >
              <input
                type="radio"
                name="feeRange"
                value={range.value}
                checked={selectedFeeRange === range.value}
                onChange={() => setSelectedFeeRange(range.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 7. Verification Status Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Verification Status</span>
        </label>
        <select
          value={selectedVerification || 'All'}
          onChange={(e) => setSelectedVerification && setSelectedVerification(e.target.value)}
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">All Records (Verified & Pending)</option>
          <option value="Verified">Verified Only</option>
          <option value="Pending verification">Pending Verification</option>
        </select>
      </div>

      {/* 8. Student Rating */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 select-none py-0.5"
            >
              <input
                type="radio"
                name="ratingOption"
                checked={selectedRating === opt.value}
                onChange={() => setSelectedRating(opt.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 9. Facilities Checkboxes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Facilities Available
        </label>
        <div className="space-y-2">
          {facilityOptions.map((fac) => {
            const checked = selectedFacilities.includes(fac.name);
            return (
              <label
                key={fac.name}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFacility(fac.name)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                />
                <span>{fac.name}</span>
              </label>
            );
          })}
        </div>
      </div>

    </aside>
  );
}
