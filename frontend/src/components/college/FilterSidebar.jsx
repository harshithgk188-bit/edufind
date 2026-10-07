import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterSidebar({
  selectedCourse,
  setSelectedCourse,
  selectedFeeRange,
  setSelectedFeeRange,
  selectedRating,
  setSelectedRating,
  selectedType,
  setSelectedType,
  selectedFacilities,
  toggleFacility,
  resetFilters,
  coursesList = []
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

  const collegeTypes = ['All', 'Government', 'Private', 'Autonomous', 'University'];

  const facilityOptions = [
    'Hostel',
    'Library',
    'Wi-Fi',
    'Computer Lab',
    'Sports Complex',
    'Canteen',
    'Transportation / Bus',
    'Placement Cell'
  ];

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Course Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Program / Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50/50 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">All Courses</option>
          {coursesList.map((c) => (
            <option key={c.id} value={c.short_code}>
              {c.short_code} – {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Fee Range Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Annual Fees
        </label>
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

      {/* 3. Rating Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Student Rating
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

      {/* 4. College Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Institution Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {collegeTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Facilities Checkboxes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Campus Facilities
        </label>
        <div className="space-y-2">
          {facilityOptions.map((fac) => {
            const checked = selectedFacilities.includes(fac);
            return (
              <label
                key={fac}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFacility(fac)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                />
                <span>{fac}</span>
              </label>
            );
          })}
        </div>
      </div>

    </aside>
  );
}
