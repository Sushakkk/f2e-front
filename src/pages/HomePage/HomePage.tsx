import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

import { useCoursesSearch } from 'utils/useCoursesSearch';

import s from './HomePage.module.scss';
import { Card, Filters, Recommendations, SearchBar } from './components';
import { COURSES_CONFIG, CourseConfigItem } from './config/cards';

function applyCoursesFilters(
  courses: CourseConfigItem[],
  filters: React.ComponentProps<typeof Filters>['value']
) {
  const titles = filters.titles ?? [];
  const levels = filters.levels ?? [];
  // Keep compatibility with older filter shape (teacher vs teachers) to avoid dev-server TS cache issues.
  const teachers =
    (filters as unknown as { teachers?: string[]; teacher?: string }).teachers ??
    ((filters as unknown as { teacher?: string }).teacher
      ? [(filters as unknown as { teacher?: string }).teacher as string]
      : []);
  const priceFrom = filters.priceFrom;
  const priceTo = filters.priceTo;

  return courses.filter((course) => {
    if (titles.length > 0 && !titles.includes(course.title)) {
      return false;
    }

    if (levels.length > 0 && !levels.includes(course.level)) {
      return false;
    }

    if (teachers.length > 0 && !teachers.includes(course.teacher)) {
      return false;
    }

    if (priceFrom !== undefined && course.price < priceFrom) {
      return false;
    }

    if (priceTo !== undefined && course.price > priceTo) {
      return false;
    }

    return true;
  });
}

const HomePage: React.FC = () => {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<React.ComponentProps<typeof Filters>['value']>({
    titles: [],
    levels: [],
  });

  React.useEffect(() => {
    // eslint wants consistent return; use no-op cleanup by default
    if (!isFiltersOpen) {
      return () => undefined;
    }

    // lock scroll only on mobile where filters are full-screen overlay
    const mq = window.matchMedia('(max-width: 768px)');

    if (!mq.matches) {
      return () => undefined;
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isFiltersOpen]);

  const coursesWithFilters = React.useMemo(() => {
    return applyCoursesFilters(COURSES_CONFIG, filters);
  }, [filters]);

  const { search, setSearch, filteredCourses, isEmpty } = useCoursesSearch(coursesWithFilters);

  return (
    <div className={s.page}>
      <Recommendations items={COURSES_CONFIG} />
      <SearchBar
        value={search}
        onChange={setSearch}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((v) => !v)}
      />
      <div className={s.content}>
        <div className={s.main}>
          <div className={s.cards}>
            {filteredCourses.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          {isEmpty && <div className={s.empty}>Ничего не найдено</div>}
        </div>
        <aside
          className={cn(s.sidebar, isFiltersOpen ? s.sidebarOpen : s.sidebarClosed)}
          aria-label="Фильтры"
          aria-hidden={!isFiltersOpen}
        >
          <Filters
            courses={COURSES_CONFIG}
            value={filters}
            onClose={() => setIsFiltersOpen(false)}
            onApply={(v: React.ComponentProps<typeof Filters>['value']) => setFilters(v)}
          />
        </aside>
      </div>
    </div>
  );
};

export default observer(HomePage);
