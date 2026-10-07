import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, Plus, Star, Check, ShieldCheck, MapPin, Building, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import { VerifiedBadge, CollegeTypeBadge } from '../components/common/Badge';

export default function CollegeCompare() {
  const { selectedColleges, removeCollege, clearCompare, addCollege } = useCompare();

  const [allColleges, setAllColleges] = useState([]);
  const [collegesDetails, setCollegesDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/colleges/search');
        setAllColleges(res.data);
      } catch (err) {
        console.error('Failed to load college list:', err);
      }
    };
    fetchAll();
  }, []);

  // Fetch full details of each compared college to display deep comparison
  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedColleges.length === 0) {
        setCollegesDetails([]);
        return;
      }
      try {
        setLoading(true);
        const detailPromises = selectedColleges.map((c) => api.get(`/colleges/${c.id}`));
        const responses = await Promise.all(detailPromises);
        setCollegesDetails(responses.map((r) => r.data));
      } catch (err) {
        console.error('Failed to fetch comparison details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedColleges]);

  const handleAddFromDropdown = (e) => {
    const colId = Number(e.target.value);
    if (!colId) return;
    const target = allColleges.find((c) => c.id === colId);
    if (target) {
      addCollege(target);
    }
    e.target.value = '';
  };

  // Find lowest fee among compared colleges
  const lowestFee = collegesDetails.length > 0
    ? Math.min(...collegesDetails.map((c) => {
        const fees = c.courses.map((cr) => Number(cr.annual_fees));
        return fees.length > 0 ? Math.min(...fees) : 9999999;
      }))
    : 0;

  // Find highest rating
  const highestRating = collegesDetails.length > 0
    ? Math.max(...collegesDetails.map((c) => c.overall_rating))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Scale className="w-4 h-4" />
            <span>Multi-College Decision Tool</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Compare Colleges Side-by-Side
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare up to 3 colleges on verified annual fees, ratings, placements, hostels, and course curriculums.
          </p>
        </div>

        {selectedColleges.length > 0 && (
          <button
            onClick={clearCompare}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors self-start sm:self-auto"
          >
            Clear All ({selectedColleges.length})
          </button>
        )}
      </div>

      {/* Add College Selector if less than 3 */}
      {selectedColleges.length < 3 && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 font-medium">
            <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Select another college to add to the side-by-side comparison ({selectedColleges.length}/3 selected):</span>
          </div>
          <select
            onChange={handleAddFromDropdown}
            className="w-full sm:w-64 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">+ Add College to Compare</option>
            {allColleges
              .filter((ac) => !selectedColleges.some((sc) => sc.id === ac.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.district_name})
                </option>
              ))}
          </select>
        </div>
      )}

      {selectedColleges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Colleges Selected for Comparison</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You can select up to 3 colleges while browsing search cards or add from the dropdown selector above.
          </p>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <span>Browse Colleges</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading comparison matrix...
        </div>
      ) : (
        /* Comparison Table Matrix */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-4 px-5 text-slate-500 font-bold uppercase tracking-wider w-44">
                    Comparison Metrics
                  </th>
                  {collegesDetails.map((col) => (
                    <th key={col.id} className="py-4 px-5 align-top min-w-[240px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <VerifiedBadge verified={col.verified} />
                          <h3 className="text-sm font-bold text-slate-900 mt-2 leading-tight">
                            {col.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">{col.district_name}</p>
                        </div>
                        <button
                          onClick={() => removeCollege(col.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* 1. Rating */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Overall Rating</td>
                  {collegesDetails.map((col) => {
                    const isBest = col.overall_rating === highestRating;
                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{col.overall_rating}</span>
                          <StarRating rating={col.overall_rating} size="xs" />
                          {isBest && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                              Best Rating
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{col.review_count} reviews</p>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. College Type & Accreditation */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Type & NAAC Grade</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <CollegeTypeBadge type={col.college_type} />
                        <span className="text-xs font-bold text-slate-800">{col.accreditation || 'NAAC B'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Primary Course Fees */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Starting Annual Fees</td>
                  {collegesDetails.map((col) => {
                    const fees = col.courses.map((cr) => Number(cr.annual_fees));
                    const minF = fees.length > 0 ? Math.min(...fees) : 0;
                    const isCheapest = minF === lowestFee && minF > 0;

                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900">
                            {minF > 0 ? `₹${minF.toLocaleString('en-IN')}` : 'Govt / Free'}
                          </span>
                          {isCheapest && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                              Lowest Fee
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">/year (Official fee)</span>
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Programs Offered */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Programs Offered</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1">
                        {col.courses.map((c) => (
                          <span key={c.id} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            {c.short_code}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. Hostel Facility */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Hostel Facility</td>
                  {collegesDetails.map((col) => {
                    const hasHostel = col.facilities.some((f) => f.name.toLowerCase().includes('hostel'));
                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        {hasHostel ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <Check className="w-4 h-4" /> Available On-Campus
                          </span>
                        ) : (
                          <span className="text-slate-400">Not Available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Placement Statistics */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Average Package</td>
                  {collegesDetails.map((col) => {
                    const plc = col.placements && col.placements.length > 0 ? col.placements[0] : null;
                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        {plc && plc.average_package ? (
                          <div>
                            <span className="font-extrabold text-sm text-slate-900">{plc.average_package} LPA</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Highest: {plc.highest_package} LPA</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Facilities List */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Key Facilities</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {col.facilities.map((f) => f.name).join(', ') || 'Standard Classrooms'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 8. Action Link */}
                <tr>
                  <td className="py-4 px-5 bg-slate-50/30"></td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-4 px-5">
                      <Link
                        to={`/colleges/${col.slug || col.id}`}
                        className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
