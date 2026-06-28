import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { validatePassword } from '../../utils/validators';
import { formatDate } from '../../utils/formatters';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ fullName: user?.fullName, mobileNumber: user?.mobileNumber });
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(user.userId, profile);
      updateUser(profile);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const err = validatePassword(pwd.next);
    if (err) return toast.error(err);
    try {
      await authService.changePassword(pwd.current, pwd.next);
      toast.success('Password changed');
      setPwd({ current: '', next: '' });
    } catch (err) { toast.error(err.message); }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold">
            {user.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.fullName}</h2>
            <p className="text-text-secondary">@{user.username}</p>
            <Badge variant="info" className="mt-1">{user.role}</Badge>
          </div>
        </div>
        <div className="text-sm text-text-secondary space-y-1">
          <p>📧 {user.email}</p>
          <p>📱 {user.mobileNumber || 'Not set'}</p>
          <p>📅 Joined: {formatDate(user.registrationDate)}</p>
          <p>🕒 Last login: {formatDate(user.lastLogin)}</p>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Edit Profile</h3>
        <form onSubmit={saveProfile} className="space-y-3">
          <Input label="Full Name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          <Input label="Mobile Number" value={profile.mobileNumber} onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
        </form>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-3">
          <Input label="Current Password" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          <Input label="New Password" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          <Button type="submit" variant="secondary">Change Password</Button>
        </form>
      </Card>
    </div>
  );
}
