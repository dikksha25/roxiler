import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { UserStoreBrowsePage } from '../components/user/UserStoreBrowsePage';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const DashboardPage = ({ onNavigate }) => {
  const { user, updatePassword } = useAuth();
  const [activeUserTab, setActiveUserTab] = useState('stores'); // 'stores', 'profile'
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

  // SYSTEM_ADMIN: Render dedicated Administration Console
  if (user.role === ROLES.SYSTEM_ADMIN) {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

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

        {user.role === ROLES.NORMAL_USER && (
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
        )}
      </div>

      {/* STORE_OWNER VIEW */}
      {user.role === ROLES.STORE_OWNER && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🏪 My Managed Stores & Ratings</h2>
          <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>FreshMart Supermarket & Organics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                452 Marketplace Blvd, Downtown Plaza
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>4.8 ★</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Average Rating</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>4</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer Reviews</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Apex Electronics & Smart Devices</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                108 Silicon Avenue, Innovation District
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>4.5 ★</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Average Rating</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>3</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer Reviews</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* NORMAL_USER VIEW */}
      {user.role === ROLES.NORMAL_USER && (
        <>
          {activeUserTab === 'stores' && <UserStoreBrowsePage />}

          {activeUserTab === 'profile' && (
            <div className="fade-in">
              <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Profile Details Card */}
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

                {/* Password Change Form */}
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
        </>
      )}

      {/* Password section for STORE_OWNER */}
      {user.role === ROLES.STORE_OWNER && (
        <div style={{ maxWidth: '600px', marginTop: '2rem' }}>
          <Card>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔒 Change Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Update your account password securely (8–16 chars, 1 uppercase, 1 special character).
            </p>

            {passMsg && <Alert type={passMsg.type} message={passMsg.message} onClose={() => setPassMsg(null)} />}

            <form onSubmit={handlePasswordChange}>
              <Input
                label="Current Password"
                id="dash-curr-pass-owner"
                type="password"
                placeholder="Enter current password"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                id="dash-new-pass-owner"
                type="password"
                placeholder="8 to 16 characters with 1 uppercase & special char"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                id="dash-conf-pass-owner"
                type="password"
                placeholder="Re-enter new password"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                required
              />
              <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.5rem' }}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
