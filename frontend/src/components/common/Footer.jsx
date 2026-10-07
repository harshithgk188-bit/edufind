import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white">EduFind</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart College & Course Discovery and Recommendation System. Designed to empower students with verified college fees, cutoffs, ratings, and AI guidance.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-800/50 rounded-full text-xs text-indigo-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>BCA Final Year Major Project</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Discovery</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/colleges" className="hover:text-indigo-400 transition-colors">Search All Colleges</Link>
              </li>
              <li>
                <Link to="/districts" className="hover:text-indigo-400 transition-colors">Districts of Karnataka</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-indigo-400 transition-colors">Smart Recommendations</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-indigo-400 transition-colors">College Comparison Matrix</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Courses */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Popular Programs</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>BCA – Bachelor of Computer Applications</li>
              <li>MCA – Master of Computer Applications</li>
              <li>B.Com – Bachelor of Commerce</li>
              <li>MBA – Master of Business Administration</li>
              <li>BE / B.Tech Computer Science</li>
            </ul>
          </div>

          {/* Col 4: Contact & Project Info */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Project Information</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Tumkur District, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@edufind.ac.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 816 2280000</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EduFind System. All verified educational data preserved.</p>
          <p className="flex items-center gap-1">
            Built for BCA Final Year Major Project Demonstration & Viva
          </p>
        </div>
      </div>
    </footer>
  );
}
