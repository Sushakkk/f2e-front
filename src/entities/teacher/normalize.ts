import type { Review } from 'config/cards';

import type { TeacherClient, TeacherCoursePreview } from './client';
import type { BackendTeacher, BackendTeacherCourse, BackendTeacherListItem } from './server';

function formatShortDate(iso: string): string {
  if (!iso) {
    return '';
  }

  const d = new Date(iso);

  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatReviewDate(iso: string): string {
  if (!iso) {
    return '';
  }

  const d = new Date(iso);

  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function normalizeTeacherCourse(course: BackendTeacherCourse): TeacherCoursePreview {
  return {
    id: course.id,
    name: course.name,
    studio: course.studio,
    danceStyle: course.dance_style,
    level: course.level,
    price: course.price,
    dateFrom: formatShortDate(course.date_from),
    dateTo: formatShortDate(course.date_to),
    status: course.status,
  };
}

function normalizeTeacherReview(review: BackendTeacher['reviews'][number]): Review {
  return {
    author: review.author_name,
    date: formatReviewDate(review.created_at),
    text: review.text,
    rating: review.rating,
  };
}

export const normalizeTeacher = (data: BackendTeacher): TeacherClient => ({
  id: data.id,
  userId: data.user_id,
  name: data.name,
  fullName: data.full_name,
  email: data.email,
  avatar: data.avatar || undefined,
  city: data.city,
  bio: data.bio,
  images: data.images ?? [],
  experience: data.experience ?? 0,
  rating: Number(data.rating ?? 0),
  specializations: data.specializations ?? [],
  achievements: data.achievements ?? [],
  reviews: (data.reviews ?? []).map(normalizeTeacherReview),
  courses: (data.courses ?? []).map(normalizeTeacherCourse),
});

export const findTeacherIdByName = (
  teachers: BackendTeacherListItem[],
  teacherName: string
): number | null => {
  const normalizedName = teacherName.trim().toLowerCase();
  const matchedTeacher =
    teachers.find((teacher) => teacher.full_name.trim().toLowerCase() === normalizedName) ??
    teachers.find((teacher) => teacher.full_name.trim().toLowerCase().includes(normalizedName));

  return matchedTeacher?.id ?? null;
};
