import { makeSessionHelpers } from './sessionFactory';

export type SchoolAdminSession = {
  sub: string;      // school_admins.id
  email: string;
  school_id: string;
  school_name: string;
};

export const schoolAdminSession = makeSessionHelpers<SchoolAdminSession>(
  'school_admin_session',
  60 * 60 * 12 // 12 hours
);
