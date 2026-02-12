import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

import { FiltersStore } from 'store/FiltersStore';
import { useLocalStore } from 'store/hooks/useLocalStore';
import { useCoursesSearch } from 'utils/useCoursesSearch';

import s from './HomePage.module.scss';
import { Card, Filters, Recommendations, SearchBar } from './components';
import { COURSES_CONFIG } from './config/cards';

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

const HomePage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const handleClose = React.useCallback(() => setIsFiltersOpen(false), []);

  const filtersStore = useLocalStore(
    () =>
      new FiltersStore(
        COURSES_CONFIG,
        { titles: [], levels: [] },
        isMobile ? handleClose : undefined
      ),
    [handleClose]
  );

  const sidebarRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isMobile || !isFiltersOpen) {
      return () => undefined;
    }

    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
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

  const { search, setSearch, filteredCourses, isEmpty } = useCoursesSearch(
    filtersStore.filteredCourses
  );
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
          ref={sidebarRef}
          className={cn(s.sidebar, isMobile && (isFiltersOpen ? s.sidebarOpen : s.sidebarClosed))}
          aria-label="Фильтры"
          aria-hidden={isMobile ? !isFiltersOpen : false}
        >
          <Filters store={filtersStore} onClose={isMobile ? handleClose : undefined} />
        </aside>
      </div>
    </div>
  );
};

export default observer(HomePage);
