import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, ArrowRight, Building2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import CollegeCard from '../components/college/CollegeCard';

export default function Favorites() {
  const { favoriteColleges, loading } = useFavorites();
  const { addCollege } = useCompare();

  const handleCompareAll = () => {
    favoriteColleges.slice(0, 3).forEach((col) => {
      addCollege(col);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Shortlisted Colleges</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Favorite Colleges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of colleges you are considering and compare them directly before admission deadlines.
          </p>
        </div>

        {favoriteColleges.length > 1 && (
          <Link
            to="/compare"
            onClick={handleCompareAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors self-start sm:self-auto"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Shortlisted Colleges</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : favoriteColleges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Your Favorites List is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click the heart icon on any college card while browsing to save colleges here for quick access.
          </p>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <span>Discover Colleges</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteColleges.map((col) => (
            <CollegeCard key={col.id} college={col} />
          ))}
        </div>
      )}

    </div>
  );
}
