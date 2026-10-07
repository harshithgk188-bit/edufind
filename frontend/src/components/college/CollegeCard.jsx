import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Scale, ExternalLink, Award, Check } from 'lucide-react';
import StarRating from '../common/StarRating';
import { VerifiedBadge, CollegeTypeBadge } from '../common/Badge';
import { useCompare } from '../../context/CompareContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function CollegeCard({ college }) {
  const { addCollege, removeCollege, isSelected } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();

  const inCompare = isSelected(college.id);
  const inFavorites = isFavorite(college.id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (inCompare) {
      removeCollege(college.id);
    } else {
      const res = addCollege(college);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(college);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col overflow-hidden group">
      
      {/* College Image Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={college.image_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"}
          alt={college.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <VerifiedBadge verified={college.verified} />
          <CollegeTypeBadge type={college.college_type} />
        </div>

        {/* Action icons on top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
              inFavorites 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title={inFavorites ? "Remove from Favorites" : "Save to Favorites"}
          >
            <Heart className={`w-4 h-4 ${inFavorites ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Accreditation on bottom left of image */}
        {college.accreditation && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-xs">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>{college.accreditation}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location and District */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{college.district_name || "Karnataka"}</span>
          </div>

          {/* College Name */}
          <Link to={`/colleges/${college.slug || college.id}`}>
            <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {college.name}
            </h3>
          </Link>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="text-xs font-bold text-amber-800">{college.overall_rating}</span>
              <StarRating rating={college.overall_rating} size="xs" />
            </div>
            <span className="text-xs text-slate-500">
              ({college.review_count} {college.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Courses Tags */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {college.courses_offered?.slice(0, 4).map((cCode, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {cCode}
              </span>
            ))}
            {college.courses_offered?.length > 4 && (
              <span className="text-[11px] text-slate-400 self-center">
                +{college.courses_offered.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Starting Annual Fee</p>
            <p className="text-base font-extrabold text-slate-900">
              {college.min_fees ? `₹${Number(college.min_fees).toLocaleString('en-IN')}` : '₹ Free / Govt'}
              <span className="text-xs font-normal text-slate-500">/year</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare toggle button */}
            <button
              onClick={handleCompareClick}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                inCompare
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Add to comparison table"
            >
              {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
              <span>{inCompare ? 'Added' : 'Compare'}</span>
            </button>

            {/* View details */}
            <Link
              to={`/colleges/${college.slug || college.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
