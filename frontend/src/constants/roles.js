export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  NORMAL_USER: 'NORMAL_USER',
  STORE_OWNER: 'STORE_OWNER',
};

export const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [ROLES.NORMAL_USER]: 'Normal User',
  [ROLES.STORE_OWNER]: 'Store Owner',
};

export const ROLE_BADGE_VARIANTS = {
  [ROLES.SYSTEM_ADMIN]: 'admin',
  [ROLES.NORMAL_USER]: 'user',
  [ROLES.STORE_OWNER]: 'owner',
};
