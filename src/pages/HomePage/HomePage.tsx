import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

import { useCoursesSearch } from 'utils/useCoursesSearch';

import s from './HomePage.module.scss';
import { Card, Filters, Recommendations, SearchBar } from './components';
import { COURSES_CONFIG, CourseConfigItem } from './config/cards';

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);

  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);

    onChange();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }

    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [query]);

  return matches;
}

function applyCoursesFilters(
  courses: CourseConfigItem[],
  filters: React.ComponentProps<typeof Filters>['value']
) {
  const titles = filters.titles ?? [];
  const levels = filters.levels ?? [];
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
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<React.ComponentProps<typeof Filters>['value']>({
    titles: [],
    levels: [],
  });

  React.useEffect(() => {
    if (!isMobile || !isFiltersOpen) {
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
  const isSingleCard = !isEmpty && filteredCourses.length === 1;

  return (
    <div className={s.page}>
      <Recommendations items={COURSES_CONFIG} />
      <SearchBar
        value={search}
        onChange={setSearch}
        isFiltersOpen={isMobile ? isFiltersOpen : undefined}
        onToggleFilters={isMobile ? () => setIsFiltersOpen((v) => !v) : undefined}
      />
      <div className={s.content}>
        <div className={s.main}>
          <div className={cn(s.cards, isSingleCard && s.cardsSingle)}>
            {filteredCourses.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          {isEmpty && <div className={s.empty}>Ничего не найдено</div>}
        </div>
        <aside
          className={cn(s.sidebar, isMobile && (isFiltersOpen ? s.sidebarOpen : s.sidebarClosed))}
          aria-label="Фильтры"
          aria-hidden={isMobile ? !isFiltersOpen : false}
        >
          <Filters
            courses={COURSES_CONFIG}
            value={filters}
            onClose={isMobile ? () => setIsFiltersOpen(false) : undefined}
            onApply={(v: React.ComponentProps<typeof Filters>['value']) => setFilters(v)}
          />
        </aside>
      </div>
    </div>
  );
};

export default observer(HomePage);
