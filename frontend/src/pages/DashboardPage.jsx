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
  const [activeUserTab, setActiveUserTab] = useState('stores');
  const [activeOwnerTab, setActiveOwnerTab] = useState('analytics');

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
      <div className="clay-page">
        <div className="clay-container">
          {/* Header Tab Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '1.5rem',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              className={`clay-btn ${activeOwnerTab === 'analytics' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setActiveOwnerTab('analytics')}
            >
              📊 Store Analytics &amp; Ratings
            </button>
            <button
              type="button"
              className={`clay-btn ${activeOwnerTab === 'profile' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setActiveOwnerTab('profile')}
            >
              👤 Profile &amp; Password
            </button>
          </div>

          {activeOwnerTab === 'analytics' && <StoreOwnerDashboard />}

          {activeOwnerTab === 'profile' && (
            <div className="clay-grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
              <Card>
                <div className="clay-orb clay-orb-pink" style={{ marginBottom: '1.25rem', width: '52px', height: '52px', fontSize: '1.35rem' }}>
                  👤
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '0.35rem' }}>Store Owner Identity</h3>
                <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your verified merchant identity and contact info.
                </p>
                <div style={{ fontSize: '0.95rem', color: 'var(--clay-text-primary)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div><strong>Merchant Name:</strong> {user.name}</div>
                  <div><strong>Account Email:</strong> {user.email}</div>
                  <div><strong>Physical Address:</strong> {user.address || 'Not specified'}</div>
                  <div><strong>Account Role:</strong> <Badge role={user.role} /></div>
                </div>
              </Card>

              <Card>
                <div className="clay-orb clay-orb-purple" style={{ marginBottom: '1.25rem', width: '52px', height: '52px', fontSize: '1.35rem' }}>
                  🔒
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '0.35rem' }}>Change Password</h3>
                <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
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
                  <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.75rem', width: '100%' }}>
                    Update Password
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NORMAL_USER View
  return (
    <div className="clay-page">
      <div className="clay-container">
        {/* Header Banner */}
        <div
          className="clay-card clay-card-hero"
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', margin: 0, fontWeight: 900 }}>
                Welcome, {user.name}
              </h1>
              <Badge role={user.role} />
            </div>
            <p style={{ color: 'var(--clay-text-muted)', margin: 0, fontSize: '0.95rem' }}>
              {user.email} &bull; Role: <strong>{ROLE_LABELS[user.role]}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              className={`clay-btn ${activeUserTab === 'stores' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setActiveUserTab('stores')}
            >
              🏪 Stores Directory
            </button>
            <button
              className={`clay-btn ${activeUserTab === 'profile' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setActiveUserTab('profile')}
            >
              👤 Profile &amp; Security
            </button>
          </div>
        </div>

        {activeUserTab === 'stores' && <UserStoreBrowsePage />}

        {activeUserTab === 'profile' && (
          <div className="clay-grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
            <Card>
              <div className="clay-orb clay-orb-blue" style={{ marginBottom: '1.25rem', width: '52px', height: '52px', fontSize: '1.35rem' }}>
                👤
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '0.35rem' }}>Account Profile</h3>
              <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Your verified user details and credentials.
              </p>
              <div style={{ fontSize: '0.95rem', color: 'var(--clay-text-primary)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div><strong>Full Name:</strong> {user.name}</div>
                <div><strong>Email Address:</strong> {user.email}</div>
                <div><strong>Physical Address:</strong> {user.address || 'Not specified'}</div>
                <div><strong>Account Role:</strong> <Badge role={user.role} /></div>
              </div>
            </Card>

            <Card>
              <div className="clay-orb clay-orb-purple" style={{ marginBottom: '1.25rem', width: '52px', height: '52px', fontSize: '1.35rem' }}>
                🔒
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '0.35rem' }}>Change Password</h3>
              <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
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
                <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.75rem', width: '100%' }}>
                  Update Password
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
