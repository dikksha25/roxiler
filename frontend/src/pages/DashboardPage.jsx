import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { StoreOwnerDashboard } from '../components/owner/StoreOwnerDashboard';
import { UserStoreBrowsePage } from '../components/user/UserStoreBrowsePage';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const DashboardPage = ({ onNavigate }) => {
  const { user, updatePassword } = useAuth();
  const [activeUserTab, setActiveUserTab] = useState('stores'); // 'stores', 'profile'
  const [activeOwnerTab, setActiveOwnerTab] = useState('analytics'); // 'analytics', 'profile'

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (passData.newPassword.length < 8 || passData.newPassword.length > 16) {
      setPassMsg({ type: 'error', message: 'New password must be between 8 and 16 characters.' });
      return;
    }
    if (!/[A-Z]/.test(passData.newPassword)) {
      setPassMsg({ type: 'error', message: 'New password must contain at least one uppercase letter.' });
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/.test(passData.newPassword)) {
      setPassMsg({ type: 'error', message: 'New password must contain at least one special character.' });
      return;
    }

    setPassLoading(true);
    const res = await updatePassword(passData.currentPassword, passData.newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ type: 'success', message: 'Password updated successfully!' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPassMsg({ type: 'error', message: res.message || 'Failed to update password.' });
    }
  };

  if (!user) return null;

  // SYSTEM_ADMIN: Dedicated Platform Administration Console
  if (user.role === ROLES.SYSTEM_ADMIN) {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  // STORE_OWNER: Dedicated Store Performance, Ratings & Analytics Dashboard
  if (user.role === ROLES.STORE_OWNER) {
    return (
      <div className="fade-in">
        {/* Header Tab Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1rem',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            className={`btn ${activeOwnerTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveOwnerTab('analytics')}
            style={{ fontSize: '0.85rem' }}
          >
            📊 Store Analytics & Ratings
          </button>
          <button
            type="button"
            className={`btn ${activeOwnerTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveOwnerTab('profile')}
            style={{ fontSize: '0.85rem' }}
          >
            👤 Profile & Password
          </button>
        </div>

        {activeOwnerTab === 'analytics' && <StoreOwnerDashboard />}

        {activeOwnerTab === 'profile' && (
          <div className="fade-in">
            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
              <Card>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>👤 Store Owner Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Your verified merchant identity and contact info.
                </p>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><strong>Merchant Name:</strong> {user.name}</div>
                  <div><strong>Account Email:</strong> {user.email}</div>
                  <div><strong>Physical Address:</strong> {user.address || 'Not specified'}</div>
                  <div><strong>Account Role:</strong> <Badge role={user.role} /></div>
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔒 Change Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Update your merchant password securely (8–16 chars, 1 uppercase, 1 special character).
                </p>

                {passMsg && <Alert type={passMsg.type} message={passMsg.message} onClose={() => setPassMsg(null)} />}

                <form onSubmit={handlePasswordChange}>
                  <Input
                    label="Current Password"
                    id="owner-curr-pass"
                    type="password"
                    placeholder="Enter current password"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="New Password"
                    id="owner-new-pass"
                    type="password"
                    placeholder="8 to 16 chars with 1 uppercase & special"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    id="owner-conf-pass"
                    type="password"
                    placeholder="Re-enter new password"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    required
                  />
                  <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.5rem', width: '100%' }}>
                    Update Password
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  // NORMAL_USER View
  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Welcome, {user.name}</h1>
            <Badge role={user.role} />
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            {user.email} &bull; Account Role: <strong>{ROLE_LABELS[user.role]}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeUserTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveUserTab('stores')}
            style={{ fontSize: '0.85rem' }}
          >
            🏪 Stores Directory
          </button>
          <button
            className={`btn ${activeUserTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveUserTab('profile')}
            style={{ fontSize: '0.85rem' }}
          >
            👤 Profile & Security
          </button>
        </div>
      </div>

      {activeUserTab === 'stores' && <UserStoreBrowsePage />}

      {activeUserTab === 'profile' && (
        <div className="fade-in">
          <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>👤 Account Profile Details</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Your verified user details and platform credentials.
              </p>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><strong>Full Name:</strong> {user.name}</div>
                <div><strong>Email Address:</strong> {user.email}</div>
                <div><strong>Physical Address:</strong> {user.address || 'Not specified'}</div>
                <div><strong>Account Role:</strong> <Badge role={user.role} /></div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔒 Change Password</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Update your account password securely (8–16 chars, 1 uppercase, 1 special character).
              </p>

              {passMsg && <Alert type={passMsg.type} message={passMsg.message} onClose={() => setPassMsg(null)} />}

              <form onSubmit={handlePasswordChange}>
                <Input
                  label="Current Password"
                  id="dash-curr-pass"
                  type="password"
                  placeholder="Enter current password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="New Password"
                  id="dash-new-pass"
                  type="password"
                  placeholder="8 to 16 chars with 1 uppercase & special"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  id="dash-conf-pass"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  required
                />
                <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.5rem', width: '100%' }}>
                  Update Password
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
