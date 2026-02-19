import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

import { COURSES_CONFIG, CourseConfigItem } from 'config';
import { FiltersStore } from 'store/FiltersStore';
import { PaginationStore } from 'store/PaginationStore';
import { QueryStore, parseQueryFromURL } from 'store/QueryStore';
import { useLocalStore } from 'store/hooks/useLocalStore';
import { useCoursesSearch } from 'utils/useCoursesSearch';

import s from './HomePage.module.scss';
import { Card, Filters, Pagination, Recommendations, SearchBar } from './components';

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

  // Parse URL query params once on mount
  const queryParams = React.useRef(parseQueryFromURL()).current;

  const filtersStore = useLocalStore(
    () => new FiltersStore(COURSES_CONFIG, queryParams.filters, isMobile ? handleClose : undefined),
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
    filtersStore.filteredCourses,
    300,
    queryParams.search
  );

  const paginationStore = useLocalStore(
    () => new PaginationStore<CourseConfigItem>(isMobile ? 6 : 9, queryParams.page)
  );

  const queryStore = useLocalStore(
    () => new QueryStore(filtersStore, paginationStore, queryParams.search)
  );

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      queryStore.setSearch(value);
    },
    [setSearch, queryStore]
  );

  React.useEffect(() => {
    paginationStore.setPerPage(isMobile ? 6 : 9);
  }, [isMobile, paginationStore]);

  React.useEffect(() => {
    paginationStore.setItems(filteredCourses);
  }, [filteredCourses, paginationStore]);

  const { paginatedItems, currentPage, totalPages, visiblePages } = paginationStore;
  const isSingleCard = !isEmpty && paginatedItems.length === 1;

  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const userChangedPage = React.useRef(false);

  const handlePageChange = React.useCallback(
    (page: number) => {
      userChangedPage.current = true;
      paginationStore.setPage(page);
    },
    [paginationStore]
  );

  React.useEffect(() => {
    if (!userChangedPage.current) {
      return;
    }

    userChangedPage.current = false;

    anchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [currentPage]);

  return (
    <div className={s.page}>
      <Recommendations items={COURSES_CONFIG} />
      <div className={s.searchBarWrapper}>
        <div ref={anchorRef} className={s.scrollAnchor} />
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          isFiltersOpen={isMobile ? isFiltersOpen : undefined}
          onToggleFilters={isMobile ? () => setIsFiltersOpen((v) => !v) : undefined}
        />
      </div>
      <div className={s.content}>
        <div className={s.main}>
          <div className={cn(s.cards, isSingleCard && s.cardsSingle)}>
            {paginatedItems.map((item) => (
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default observer(HomePage);
