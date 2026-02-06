import * as React from 'react';

import { useDebouncedValue } from './useDebouncedValue';
import { COURSES_CONFIG } from 'pages/HomePage/config/cards';

function normalizeSearchValue(v: string) {
  return v.trim().toLowerCase();
}

function courseMatchesSearch(
  course: (typeof COURSES_CONFIG)[number],
  searchValue: string
) {
  if (!searchValue) return true;

  const haystack = [course.title, course.teacher, course.level]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase());

  return haystack.some((x) => x.includes(searchValue));
}

/**
 * Хук поиска по курсам с debounce
 */
export function useCoursesSearch(
  courses = COURSES_CONFIG,
  debounceMs = 300
) {
  const [search, setSearch] = React.useState('');

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const filteredCourses = React.useMemo(() => {
    const searchValue = normalizeSearchValue(debouncedSearch);
    return courses.filter((course) =>
      courseMatchesSearch(course, searchValue)
    );
  }, [courses, debouncedSearch]);

  return {
    search,
    setSearch,
    filteredCourses,
    isEmpty: filteredCourses.length === 0,
  };
}
