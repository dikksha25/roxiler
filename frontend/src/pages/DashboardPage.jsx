import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const DashboardPage = ({ onNavigate }) => {
  const { user, updatePassword } = useAuth();
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

        <div>
          <button className="btn btn-secondary" onClick={() => onNavigate('stores')}>
            Explore All Stores &rarr;
          </button>
        </div>
      </div>

      {/* Role-Specific Content */}
      {user.role === ROLES.SYSTEM_ADMIN && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🛡️ Platform Governance Overview</h2>
          <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
            <Card>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>6</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>Active Accounts</div>
            </Card>
            <Card>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Registered Stores</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>3</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '0.25rem' }}>All Verified</div>
            </Card>
            <Card>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Ratings Submitted</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-warning)' }}>10</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Platform Avg: 4.7★</div>
            </Card>
          </div>
        </div>
      )}

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

      {user.role === ROLES.NORMAL_USER && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⭐ Normal User Review Activities</h2>
          <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Submit & Manage Ratings</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Browse stores directory to discover local businesses, submit 1-to-5 star ratings, and update your previous reviews anytime.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('stores')}>
                Browse Stores & Submit Ratings &rarr;
              </button>
            </Card>

            <Card>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>My Profile Details</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Address:</strong> {user.address || 'Not specified'}</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Security & Password Update Section */}
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
              placeholder="8 to 16 characters with 1 uppercase & special char"
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
            <Button variant="primary" type="submit" loading={passLoading} style={{ marginTop: '0.5rem' }}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
