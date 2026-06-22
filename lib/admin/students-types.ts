export type StudentEnrollment = {
  courseId: string;
  createdAt: string;
  expiresAt: string | null;
};

export type StudentRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  createdAt: string;
  enrollments: StudentEnrollment[];
};

export type CourseOption = {
  id: string;
  title: string;
  defaultAccessDays: number | null;
};
