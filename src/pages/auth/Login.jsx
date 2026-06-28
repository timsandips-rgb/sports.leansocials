import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validateCommunityCode } from '../../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', communityCode: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const codeErr = validateCommunityCode(form.communityCode);
    if (codeErr) errs.communityCode = codeErr;
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const result = await login(form.email, form.password, form.communityCode);
      toast.success(`Welcome back, ${result.user.fullName}!`);
      const isAdmin = ['super_admin', 'community_admin'].includes(result.user.role);
      navigate(isAdmin ? '/admin' : '/app');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-3xl font-bold">FIFA World Cup 2026</h1>
          <p className="text-text-secondary">Prediction Platform</p>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <Input label="Community Code" placeholder="WC2026-OFFICE" value={form.communityCode}
            onChange={(e) => setForm({ ...form, communityCode: e.target.value.toUpperCase() })} error={errors.communityCode} />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <Button type="submit" className="w-full" disabled={loading}>🔐 {loading ? 'Signing in...' : 'Login'}</Button>
          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-accent hover:underline">Forgot Password?</Link>
            <Link to="/register" className="text-accent hover:underline">Register New Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
