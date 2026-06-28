import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateCommunityCode } from '../../utils/validators';

export default function ForgotPassword() {
  const toast = useToast();
  const [form, setForm] = useState({ communityCode: '', loginToken: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const codeErr = validateCommunityCode(form.communityCode);
    if (codeErr) return toast.error(codeErr);
    if (!form.loginToken) return toast.error('Login token is required');
    if (!form.newPassword) return toast.error('New password is required');
    setLoading(true);
    try {
      await authService.resetWithToken(form.communityCode, form.loginToken, form.newPassword);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-text-secondary text-sm">Enter the token provided by your community admin</p>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <Input label="Community Code" value={form.communityCode} onChange={(e) => setForm({ ...form, communityCode: e.target.value.toUpperCase() })} />
          <Input label="Login Token" placeholder="tok_..." value={form.loginToken} onChange={(e) => setForm({ ...form, loginToken: e.target.value })} />
          <Input label="New Password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Processing...' : 'Reset Password'}</Button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
