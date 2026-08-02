export const ROLE_MAP = {
    admin: '/admin',
    manager: '/manager',
    customer: '/dashboard',
  } as const;
  
  export type UserRole = keyof typeof ROLE_MAP;