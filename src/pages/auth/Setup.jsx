// First-launch Super Admin setup wizard
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { communityService } from '../../services/communityService';
import { userRepository } from '../../repositories/userRepository';
import { ROLES, USER_STATUS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';

export default function Setup() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    communityName: '', communityCode: '', description: '',
    fullName: '', username: '', email: '', password: '',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create community
      const community = await communityService.create({
        communityName: form.communityName,
        communityCode: form.communityCode,
        description: form.description,
        createdBy: 'setup',
        creatorUsername: 'setup',
      });

      // 2. Create auth user
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 3. Create super_admin user profile
      await userRepository.create(cred.user.uid, {
        userId: cred.user.uid,
        fullName: form.fullName,
        username: form.username.toLowerCase(),
        email: form.email.toLowerCase(),
        mobileNumber: '',
        communityId: community.id,
        role: ROLES.SUPER_ADMIN,
        status: USER_STATUS.APPROVED,
        registrationDate: new Date(),
        lastLogin: new Date(),
      });

      toast.success('Setup complete! Please login.');
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🚀</div>
          <h1 className="text-2xl font-bold">Initial Setup</h1>
          <p className="text-text-secondary">Create your first community and Super Admin account</p>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <h3 className="font-semibold text-accent">Community Details</h3>
          <Input label="Community Name" value={form.communityName} onChange={(e) => setForm({ ...form, communityName: e.target.value })} />
          <Input label="Community Code" placeholder="WC2026-OFFICE" value={form.communityCode}
            onChange={(e) => setForm({ ...form, communityCode: e.target.value.toUpperCase() })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <hr className="border-surface" />
          <h3 className="font-semibold text-accent">Super Admin Account</h3>
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Username" placeholder="admin.user" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Setting up...' : 'Complete Setup'}</Button>
        </form>
      </div>
    </div>
  );
}
