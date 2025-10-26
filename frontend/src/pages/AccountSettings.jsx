import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

export default function AccountSettings() {
  const { token, backendUrl } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/me`, { headers: { token } });
        if (res.data.success) {
          setName(res.data.user.name || '');
          setEmail(res.data.user.email || '');
        } else {
          toast.error(res.data.message || 'Failed to load profile');
        }
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [backendUrl, token]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await axios.put(`${backendUrl}/api/user/me`, { name, email }, { headers: { token } });
      if (res.data.success) toast.success('Profile updated');
      else toast.error(res.data.message);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    try {
      setSavingPassword(true);
      const res = await axios.put(
        `${backendUrl}/api/user/password`,
        { currentPassword, newPassword },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Password changed');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else toast.error(res.data.message);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>Account Settings</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="border w-full px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="border w-full px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <button disabled={savingProfile} className="bg-black text-white px-4 py-2">
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <hr />

      {/* Password */}
      <form onSubmit={changePassword} className="space-y-3">
        <h2 className="text-lg font-medium">Change Password</h2>
        <input
          className="border w-full px-3 py-2"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e)=>setCurrentPassword(e.target.value)}
          required
        />
        <input
          className="border w-full px-3 py-2"
          type="password"
          placeholder="New password (min 8 chars)"
          value={newPassword}
          onChange={(e)=>setNewPassword(e.target.value)}
          required
        />
        <input
          className="border w-full px-3 py-2"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          required
        />
        <button disabled={savingPassword} className="bg-black text-white px-4 py-2">
          {savingPassword ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}