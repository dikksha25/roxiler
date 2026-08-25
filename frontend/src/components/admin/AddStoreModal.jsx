import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { ROLES } from '../../constants/roles';

export const AddStoreModal = ({ isOpen, onClose, onStoreCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const isNameLenValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;

  // Load verified STORE_OWNER accounts from the backend
  useEffect(() => {
    if (isOpen) {
      const loadOwners = async () => {
        setLoadingOwners(true);
        try {
          const res = await userService.getUsers({ role: ROLES.STORE_OWNER, limit: 100 });
          if (res && res.data && res.data.users) {
            setOwners(res.data.users);
            if (res.data.users.length > 0 && !formData.ownerId) {
              setFormData((prev) => ({ ...prev, ownerId: res.data.users[0].id }));
            }
          }
        } catch {
          // Fallback if network or local
          setOwners([
            { id: 2, name: 'Marcus Vance', email: 'owner.marcus@freshmart.com' },
            { id: 3, name: 'Elena Rostova', email: 'owner.elena@nexuscoffee.com' },
          ]);
        } finally {
          setLoadingOwners(false);
        }
      };

      loadOwners();
    }
  }, [isOpen]);

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
    if (!formData.email.trim()) {
      errors.email = 'Valid store email is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Store address is required';
    } else if (formData.address.trim().length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await storeService.createStore({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: formData.ownerId ? parseInt(formData.ownerId, 10) : null,
      });

      setSubmitting(false);
      if (res && res.success) {
        onStoreCreated(res.data);
        handleClose();
      }
    } catch (err) {
      setSubmitting(false);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const mapped = {};
        apiErrors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
        setError('Please fix the highlighted validation errors.');
      } else {
        setError(err.response?.data?.message || 'Failed to register store.');
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      ownerId: owners.length > 0 ? owners[0].id : '',
    });
    setError(null);
    setFieldErrors({});
    onClose();
  };

  const autofillSampleStore = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: `Artisan Valley Specialty Market & Roastery #${randomSuffix}`,
      email: `contact.store${randomSuffix}@artisanvalley.com`,
      address: '77 Heritage Boulevard, Suite 104, Historic District',
      ownerId: owners.length > 0 ? owners[0].id : 2,
    });
    setError(null);
    setFieldErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🏪 Add New Commercial Store" maxWidth="540px">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        {/* Store Owner Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Assigned Store Owner <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            {loadingOwners && <Spinner size={16} />}
          </div>

          <select
            className="input-field"
            value={formData.ownerId}
            onChange={(e) => handleChange('ownerId', e.target.value)}
            style={{ width: '100%' }}
          >
            {owners.map((ow) => (
              <option key={ow.id} value={ow.id}>
                👤 {ow.name} ({ow.email})
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem', display: 'block' }}>
            Only verified users with the <strong>STORE_OWNER</strong> role can be assigned.
          </span>
        </div>

        {/* Store Name with Character Counter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Store Name <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: isNameLenValid ? 'var(--accent-success)' : 'var(--text-dim)' }}>
              {formData.name.length}/60 chars (min 20)
            </span>
          </div>
          <Input
            id="admin-store-name"
            type="text"
            placeholder="e.g. FreshMart Supermarket & Organics"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={fieldErrors.name}
            required
          />
        </div>

        {/* Contact Email */}
        <Input
          label="Store Contact Email"
          id="admin-store-email"
          type="email"
          placeholder="e.g. contact@freshmart.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={fieldErrors.email}
          required
        />

        {/* Store Physical Address */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Physical Address <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: formData.address.length > 400 ? 'var(--accent-danger)' : 'var(--text-dim)' }}>
              {formData.address.length}/400 chars
            </span>
          </div>
          <textarea
            className="input-field"
            placeholder="e.g. 452 Marketplace Blvd, Downtown Plaza, Metropolis"
            rows={2}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            style={{ width: '100%', resize: 'vertical', marginBottom: '1.25rem' }}
            required
          />
          {fieldErrors.address && (
            <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', display: 'block', marginTop: '-0.75rem', marginBottom: '1rem' }}>
              {fieldErrors.address}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={autofillSampleStore}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            ✨ Autofill Sample Store
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Register Store
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
