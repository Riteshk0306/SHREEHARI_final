import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { User as UserIcon, MapPin, Package, FileText, Settings, Camera, Loader2 } from 'lucide-react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { api } from '../../api';
import { uploadProfileAvatar } from '../../lib/storage';

const ProfileDetails = () => {
  const { user, setUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    gstNumber: user?.gstNumber || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        companyName: user.companyName || '',
        gstNumber: user.gstNumber || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = { ...user, ...formData };
      await api.put(`/api/profiles/${user.id}`, {
        name: formData.name,
        mobile: formData.mobile,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber
      });
      setUser(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Personal Information</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-amber-600 font-bold uppercase tracking-wider text-xs hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
              <input type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" value={formData.email} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Name (Optional)</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">GST Number (Optional)</label>
              <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
            <p className="font-bold text-slate-900">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</p>
            <p className="font-bold text-slate-900">{user?.mobile || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
            <p className="font-bold text-slate-900">{user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p>
            <p className="font-bold text-slate-900">{user?.companyName || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">GST Number</p>
            <p className="font-bold text-slate-900">{user?.gstNumber || '-'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Addresses = () => {
  const { user, setUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '', fullName: '', mobile: '', alternateMobile: '', houseFlat: '', street: '', area: '', city: '', state: '', pinCode: '', landmark: '', isDefault: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    let updatedAddresses = [...(user.addresses || [])];
    
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    
    if (formData.id) {
      updatedAddresses = updatedAddresses.map(a => a.id === formData.id ? formData : a);
    } else {
      updatedAddresses.push({ ...formData, id: Date.now().toString() });
    }
    
    if (updatedAddresses.length === 1) updatedAddresses[0].isDefault = true;

    try {
      await api.put(`/api/profiles/${user.id}`, {
        addresses: updatedAddresses
      });
      setUser({ ...user, addresses: updatedAddresses });
      setIsAdding(false);
    } catch (err: any) {
      console.error('Failed to save address:', err);
      // Still update local store
      setUser({ ...user, addresses: updatedAddresses });
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user || !window.confirm('Delete this address?')) return;
    const updated = (user.addresses || []).filter(a => a.id !== id);
    try {
      await api.put(`/api/profiles/${user.id}`, { addresses: updated });
    } catch (err) {
      console.error(err);
    }
    setUser({ ...user, addresses: updated });
  };

  const setAsDefault = async (id: string) => {
    if (!user) return;
    const updated = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
    try {
      await api.put(`/api/profiles/${user.id}`, { addresses: updated });
    } catch (err) {
      console.error(err);
    }
    setUser({ ...user, addresses: updated });
  };

  return (
    <div className="space-y-6">
      {isAdding ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-6">{formData.id ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name *</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number *</label>
                <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">House/Flat No *</label>
                <input required type="text" value={formData.houseFlat} onChange={e => setFormData({...formData, houseFlat: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Street *</label>
                <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Area / Locality *</label>
                <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City *</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State *</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">PIN Code *</label>
                <input required type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Set as Default Address</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Address
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => { setFormData({ id: '', fullName: '', mobile: '', alternateMobile: '', houseFlat: '', street: '', area: '', city: '', state: '', pinCode: '', landmark: '', isDefault: false }); setIsAdding(true); }}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all gap-2"
          >
            <MapPin className="w-6 h-6" />
            <span className="font-bold uppercase tracking-wider text-sm">+ Add New Address</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user?.addresses || []).map(address => (
              <div key={address.id} className={`bg-white p-5 rounded-xl shadow-sm border-2 ${address.isDefault ? 'border-amber-500' : 'border-slate-200'} relative`}>
                {address.isDefault && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">Default</span>
                )}
                <h3 className="font-bold text-slate-900 mb-1">{address.fullName} <span className="text-sm font-medium text-slate-500 ml-2">{address.mobile}</span></h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {address.houseFlat}, {address.street}<br/>
                  {address.area}, {address.city}<br/>
                  {address.state} - {address.pinCode}
                </p>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
                  <button onClick={() => { setFormData(address); setIsAdding(true); }} className="text-amber-600 hover:underline">Edit</button>
                  <button onClick={() => deleteAddress(address.id)} className="text-red-500 hover:underline">Delete</button>
                  {!address.isDefault && (
                    <button onClick={() => setAsDefault(address.id)} className="text-slate-500 hover:text-slate-900 ml-auto">Set Default</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Profile() {
  const { user, setUser } = useStore();
  const location = useLocation();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadProfileAvatar(file, user.id);
      await api.put(`/api/profiles/${user.id}`, { profilePicture: publicUrl });
      setUser({ ...user, profilePicture: publicUrl });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
    { name: 'My Orders', path: '/my-orders', icon: Package },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50 relative">
              <div className="relative inline-block">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-500 shadow-inner" />
                ) : (
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full cursor-pointer hover:bg-amber-600 transition-colors shadow" title="Upload Avatar">
                  {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} className="hidden" />
                </label>
              </div>
              <h2 className="font-bold text-slate-900 truncate mt-3">{user.name}</h2>
              <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-2 ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                {user.role}
              </span>
            </div>
            <nav className="p-2">
              {tabs.map(tab => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link 
                    key={tab.path} 
                    to={tab.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Routes>
            <Route index element={<ProfileDetails />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="*" element={<div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 font-medium">Page not found.</div>} />
          </Routes>
        </div>

      </div>
    </div>
  );
}
