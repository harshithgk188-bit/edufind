import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, Plus, Star, Check, ShieldCheck, MapPin, Building, ArrowRight, TrendingUp, Phone, Globe } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import { VerifiedBadge, CollegeTypeBadge, OwnershipBadge, CategoryBadge } from '../components/common/Badge';

export default function CollegeCompare() {
  const { selectedColleges, removeCollege, clearCompare, addCollege } = useCompare();

  const [allColleges, setAllColleges] = useState([]);
  const [collegesDetails, setCollegesDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/colleges/search?page_size=100');
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
        const fees = c.courses ? c.courses.map((cr) => Number(cr.annual_fees || 0)).filter(f => f > 0) : [];
        return fees.length > 0 ? Math.min(...fees) : 9999999;
      }))
    : 0;

  // Find highest rating
  const highestRating = collegesDetails.length > 0
    ? Math.max(...collegesDetails.map((c) => c.overall_rating || c.rating || 0))
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
            Compare up to 4 colleges on verified annual fees, ratings, placements, hostels, and course curriculums.
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

      {/* Add College Selector if less than 4 */}
      {selectedColleges.length < 4 && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 font-medium">
            <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Select another college to add to the side-by-side comparison ({selectedColleges.length}/4 selected):</span>
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
                  {c.name} ({c.city ? `${c.city}, ` : ''}{c.district_name})
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
            You can select up to 4 colleges while browsing search cards or add from the dropdown selector above.
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
                          <div className="flex flex-wrap gap-1 items-center mb-1.5">
                            <VerifiedBadge verified={col.verified} status={col.verification_status} />
                            {col.ownership && <OwnershipBadge ownership={col.ownership} />}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1 leading-tight">
                            {col.name}
                          </h3>
                          {col.alternate_name && (
                            <p className="text-[11px] text-slate-400 font-medium">({col.alternate_name})</p>
                          )}
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {col.city ? `${col.city}, ` : ''}{col.district_name || 'Karnataka'}
                          </p>
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
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Rating & Reviews</td>
                  {collegesDetails.map((col) => {
                    const ratingVal = col.overall_rating || col.rating || 4.0;
                    const isBest = ratingVal === highestRating;
                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{ratingVal}</span>
                          <StarRating rating={ratingVal} size="xs" />
                          {isBest && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                              Best Rating
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{col.review_count || 0} student reviews</p>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Ownership & Category */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Ownership & Category</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">{col.ownership || 'Private'}</span>
                        <p className="text-[11px] text-slate-500">{col.college_category || 'Degree College'}</p>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Type & NAAC Grade */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Type & NAAC Grade</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <CollegeTypeBadge type={col.college_type} />
                        <span className="text-xs font-bold text-slate-800">{col.accreditation || 'Information not available'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. Primary Course Fees */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Starting Annual Fee</td>
                  {collegesDetails.map((col) => {
                    const fees = col.courses ? col.courses.map((cr) => Number(cr.annual_fees || 0)).filter(f => f > 0) : [];
                    const minF = fees.length > 0 ? Math.min(...fees) : 0;
                    const isCheapest = minF === lowestFee && minF > 0;

                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900">
                            {minF > 0 ? `₹${minF.toLocaleString('en-IN')}` : 'Information not available'}
                          </span>
                          {isCheapest && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                              Lowest Fee
                            </span>
                          )}
                        </div>
                        {minF > 0 && <span className="text-[11px] text-slate-400">/year (Official fee)</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Programs Offered */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Offered Programs</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1">
                        {col.courses && col.courses.length > 0 ? (
                          col.courses.map((c) => (
                            <span key={c.id} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                              {c.short_code || c.course_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">Information not available</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6. Placement Statistics */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Average Package</td>
                  {collegesDetails.map((col) => {
                    const plc = col.placements && col.placements.length > 0 ? col.placements[0] : null;
                    const avgPkg = col.average_package || plc?.average_package;
                    const highPkg = col.highest_package || plc?.highest_package;

                    return (
                      <td key={col.id} className="py-3.5 px-5">
                        {avgPkg ? (
                          <div>
                            <span className="font-extrabold text-sm text-slate-900">{avgPkg}</span>
                            {highPkg && <p className="text-[11px] text-slate-500 mt-0.5">Highest: {highPkg}</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400">Information not available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Facilities Checklist */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Core Facilities</td>
                  {collegesDetails.map((col) => {
                    const hasHostel = col.hostel_available || col.facilities?.some((f) => f.name.toLowerCase().includes('hostel'));
                    const hasTransport = col.transport_available || col.facilities?.some((f) => f.name.toLowerCase().includes('bus') || f.name.toLowerCase().includes('transport'));
                    const hasLibrary = col.library_available || col.facilities?.some((f) => f.name.toLowerCase().includes('library'));
                    const hasPlacement = col.placement_available || col.facilities?.some((f) => f.name.toLowerCase().includes('placement'));

                    return (
                      <td key={col.id} className="py-3.5 px-5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {hasHostel ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                          <span className={hasHostel ? 'font-semibold text-slate-800' : 'text-slate-400'}>Hostel</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {hasTransport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                          <span className={hasTransport ? 'font-semibold text-slate-800' : 'text-slate-400'}>Transport</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {hasLibrary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                          <span className={hasLibrary ? 'font-semibold text-slate-800' : 'text-slate-400'}>Library</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {hasPlacement ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                          <span className={hasPlacement ? 'font-semibold text-slate-800' : 'text-slate-400'}>Placement Cell</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Contact Info */}
                <tr>
                  <td className="py-3.5 px-5 font-bold text-slate-900 bg-slate-50/30">Official Contact</td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-3.5 px-5 space-y-1 text-[11px]">
                      {col.phone ? (
                        <p className="text-slate-700">{col.phone}</p>
                      ) : (
                        <p className="text-slate-400">Phone not available</p>
                      )}
                      {col.website ? (
                        <a href={col.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block max-w-[200px]">
                          {col.website}
                        </a>
                      ) : (
                        <p className="text-slate-400">Website not available</p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 9. Action Link */}
                <tr>
                  <td className="py-4 px-5 bg-slate-50/30"></td>
                  {collegesDetails.map((col) => (
                    <td key={col.id} className="py-4 px-5">
                      <Link
                        to={`/colleges/${col.slug || col.id}`}
                        className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>View Full Profile</span>
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
