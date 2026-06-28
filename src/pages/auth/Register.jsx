import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateUsername, validateEmail, validatePassword, validateMobile, validateCommunityCode } from '../../utils/validators';

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', mobileNumber: '', communityCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {
      fullName: form.fullName ? null : 'Full name is required',
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      mobileNumber: validateMobile(form.mobileNumber),
      communityCode: validateCommunityCode(form.communityCode),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Registration submitted! Await admin approval.');
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={errors.fullName} />
          <Input label="Username" placeholder="ram.ti or john_doe" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} error={errors.username} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Password" type="password" placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 special"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <Input label="Mobile Number" placeholder="+1 555 123 4567" value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} error={errors.mobileNumber} />
          <Input label="Community Code" placeholder="WC2026-OFFICE" value={form.communityCode}
            onChange={(e) => setForm({ ...form, communityCode: e.target.value.toUpperCase() })} error={errors.communityCode} />
          <Button type="submit" className="w-full" disabled={loading}>📝 {loading ? 'Registering...' : 'Register'}</Button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">Already have an account? Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
