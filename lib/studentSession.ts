import { makeSessionHelpers } from './sessionFactory';

export type StudentSession = {
  sub: string;          // students.id
  email: string;
  name: string;
  student_id: string;
  school_id: string;
  school_name: string;
};

export const studentSession = makeSessionHelpers<StudentSession>(
  'student_session',
  60 * 60 * 24 * 7 // 7 days
);
