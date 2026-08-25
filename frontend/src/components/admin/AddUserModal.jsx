import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';
import { userService } from '../../services/userService';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const AddUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: ROLES.NORMAL_USER,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const isLenValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/.test(formData.password);
  const isNameLenValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = {};
    if (!isNameLenValid) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
    if (!isLenValid) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!hasUppercase) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!hasSpecial) {
      errors.password = 'Password must contain at least one special character';
    }
    if (formData.address && formData.address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await userService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        role: formData.role,
      });

      setLoading(false);
      if (res && res.success) {
        onUserCreated(res.data);
        handleClose();
      }
    } catch (err) {
      setLoading(false);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const mapped = {};
        apiErrors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
        setError('Please resolve the highlighted validation errors.');
      } else {
        setError(err.response?.data?.message || 'Failed to create user record.');
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      address: '',
      role: ROLES.NORMAL_USER,
    });
    setError(null);
    setFieldErrors({});
    onClose();
  };

  const autofillSample = (role) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    if (role === ROLES.SYSTEM_ADMIN) {
      setFormData({
        name: 'Jonathan Sterling Vance',
        email: `admin.${randomSuffix}@storerating.com`,
        password: 'AdminSecurePass1!',
        address: '100 Innovation Way, Suite 600',
        role: ROLES.SYSTEM_ADMIN,
      });
    } else if (role === ROLES.STORE_OWNER) {
      setFormData({
        name: 'Gareth Armstrong Miller',
        email: `owner.${randomSuffix}@artisanmarket.com`,
        password: 'OwnerSecurePass1!',
        address: '88 Marketplace Plaza, Sector 9',
        role: ROLES.STORE_OWNER,
      });
    } else {
      setFormData({
        name: 'Katherine Isabelle Hayes',
        email: `user.${randomSuffix}@example.com`,
        password: 'UserSecurePass1!',
        address: '502 Willow Creek Boulevard',
        role: ROLES.NORMAL_USER,
      });
    }
    setError(null);
    setFieldErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="➕ Add New User" maxWidth="560px">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        {/* Role Selector */}
        <div className="clay-form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="clay-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
            Account Role <span style={{ color: 'var(--clay-danger)' }}>*</span>
          </label>
          <select
            className="clay-select"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value={ROLES.NORMAL_USER}>⭐ {ROLE_LABELS[ROLES.NORMAL_USER]} (Consumer Reviewer)</option>
            <option value={ROLES.STORE_OWNER}>🏪 {ROLE_LABELS[ROLES.STORE_OWNER]} (Store Management)</option>
            <option value={ROLES.SYSTEM_ADMIN}>🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]} (Full Platform Admin)</option>
          </select>
        </div>

        {/* Name */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="clay-label">
              Full Name <span style={{ color: 'var(--clay-danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isNameLenValid ? 'var(--clay-success)' : 'var(--clay-text-dim)' }}>
              {formData.name.length}/60 chars (min 20)
            </span>
          </div>
          <Input
            id="admin-add-name"
            type="text"
            placeholder="e.g. Christopher Robin Sterling"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={fieldErrors.name}
            required
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          id="admin-add-email"
          type="email"
          placeholder="e.g. user@storerating.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={fieldErrors.email}
          required
        />

        {/* Password */}
        <div>
          <Input
            label="Initial Password"
            id="admin-add-password"
            type="password"
            placeholder="8 to 16 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={fieldErrors.password}
            required
          />

          <div
            style={{
              background: '#EFEBF5',
              boxShadow: 'var(--shadow-clay-pressed)',
              borderRadius: 'var(--radius-clay-inner)',
              padding: '0.85rem 1.15rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.45rem',
            }}
          >
            <span style={{ color: isLenValid ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
              {isLenValid ? '✓' : '○'} 8–16 characters
            </span>
            <span style={{ color: hasUppercase ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
              {hasUppercase ? '✓' : '○'} 1 Uppercase letter
            </span>
            <span style={{ color: hasSpecial ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
              {hasSpecial ? '✓' : '○'} 1 Special character
            </span>
            <span style={{ color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              🔒 Bcrypt Hashed
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="clay-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="clay-label">
              Physical Address (Optional)
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: formData.address.length > 400 ? 'var(--clay-danger)' : 'var(--clay-text-dim)' }}>
              {formData.address.length}/400 chars
            </span>
          </div>
          <textarea
            className="clay-textarea"
            placeholder="Physical address (max 400 characters)"
            rows={2}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => autofillSample(ROLES.NORMAL_USER)}
              className="clay-btn clay-btn-secondary clay-btn-sm"
            >
              Autofill User
            </button>
            <button
              type="button"
              onClick={() => autofillSample(ROLES.STORE_OWNER)}
              className="clay-btn clay-btn-secondary clay-btn-sm"
            >
              Autofill Owner
            </button>
            <button
              type="button"
              onClick={() => autofillSample(ROLES.SYSTEM_ADMIN)}
              className="clay-btn clay-btn-secondary clay-btn-sm"
            >
              Autofill Admin
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create User
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
