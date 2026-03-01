import * as React from 'react';

import { COURSES_CONFIG } from 'config/cards';

import { useDebouncedValue } from './useDebouncedValue';

function normalizeSearchValue(v: string) {
  return v.trim().toLowerCase();
}

function courseMatchesSearch(course: (typeof COURSES_CONFIG)[number], searchValue: string) {
  if (!searchValue) {
    return true;
  }

  const haystack = [course.type, course.name, course.teacher, course.level]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase());

  return haystack.some((x) => x.includes(searchValue));
}

/**
 * Хук поиска по курсам с debounce
 */
export function useCoursesSearch(courses = COURSES_CONFIG, debounceMs = 300, initialSearch = '') {
  const [search, setSearch] = React.useState(initialSearch);

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const filteredCourses = React.useMemo(() => {
    const searchValue = normalizeSearchValue(debouncedSearch);

    return courses.filter((course) => courseMatchesSearch(course, searchValue));
  }, [courses, debouncedSearch]);

  return {
    search,
    setSearch,
    filteredCourses,
    isEmpty: filteredCourses.length === 0,
  };
}
