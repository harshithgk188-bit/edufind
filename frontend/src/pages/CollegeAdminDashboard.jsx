import React, { useState, useEffect } from 'react';
import { Building, Save, CheckCircle, AlertCircle, Plus, BookOpen, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CollegeAdminDashboard() {
  const { user } = useAuth();
  const collegeId = user?.college_id || 1; // Default to SIT Tumkur for admin

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [accreditation, setAccreditation] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [collegeId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/colleges/${collegeId}`);
      setCollege(res.data);
      setName(res.data.name);
      setDescription(res.data.description || '');
      setAddress(res.data.address || '');
      setWebsite(res.data.website || '');
      setPhone(res.data.phone || '');
      setEmail(res.data.email || '');
      setAccreditation(res.data.accreditation || 'NAAC A');
    } catch (err) {
      console.error('Failed to load institution profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.put(`/admin/colleges/${collegeId}`, {
        name,
        district_id: college.district_id,
        description,
        address,
        college_type: college.college_type,
        accreditation,
        website,
        phone,
        email,
        latitude: college.latitude,
        longitude: college.longitude,
        image_url: college.image_url
      });
      setSuccessMsg('College profile and admissions updated successfully!');
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update institution information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-xs text-slate-500">Loading College Admin Portal...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
            <Building className="w-4 h-4" />
            <span>Institution Administration Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage {college?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            District: {college?.district_name} • Verification: {college?.verified ? 'Verified Active' : 'Pending Verification'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Profile Updates'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Editor Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900">Institution Information & Contact Details</h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Official College Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">About & Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">NAAC Accreditation</label>
            <input
              type="text"
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admission Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>
        </form>
      </div>

      {/* Courses & Fees Management Preview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Registered Courses & Fee Breakdown</h3>
            <p className="text-xs text-slate-500">Currently published for public search and recommendations.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {college?.courses.map((c) => (
            <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">{c.short_code}</span> — {c.name} ({c.duration})
                <p className="text-[11px] text-slate-500">{c.eligibility}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-700">₹{Number(c.annual_fees).toLocaleString('en-IN')}/yr</p>
                <p className="text-[10px] text-slate-400">Seats: {c.seats} • AY {c.academic_year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
