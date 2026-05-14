import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Card } from 'components/common';
import { CourseActivityStatus, CourseConfigItem, courseActivityStatusLabelRu } from 'config';
import { FiltersStore } from 'store/FiltersStore';
import { PaginationStore } from 'store/PaginationStore';
import { QueryStore, parseQueryFromURL } from 'store/QueryStore';
import { RecommendationsStore } from 'store/RecommendationsStore';
import { useRootStore } from 'store/globals/root';
import { useLocalStore } from 'store/hooks/useLocalStore';
import { useCoursesSearch } from 'utils/useCoursesSearch';
import { useMediaQuery } from 'utils/useMediaQuery';

import s from './HomePage.module.scss';
import { Filters, Pagination, Recommendations, SearchBar } from './components';

const HomePage: React.FC = () => {
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const homeStore = rootStore.coursesStore;

  const handleClose = React.useCallback(() => setIsFiltersOpen(false), []);

  // Parse URL query params once on mount
  const queryParams = React.useMemo(() => parseQueryFromURL(), [location.search]);
  const recommendationsStore = useLocalStore(() => new RecommendationsStore(rootStore));

  const filtersStore = useLocalStore(
    () => new FiltersStore(rootStore, [], queryParams.filters, isMobile ? handleClose : undefined),
    [handleClose]
  );

  React.useEffect(() => {
    void filtersStore.loadReferenceOptions();
  }, [filtersStore]);

  React.useEffect(() => {
    filtersStore.setCourses(homeStore.courses);
  }, [filtersStore, homeStore.courses]);

  React.useEffect(() => {
    void recommendationsStore.loadRecommendations();
  }, [recommendationsStore, rootStore.userStore.user]);

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
  }, [isFiltersOpen, isMobile]);

  const { search, setSearch, filteredCourses, isEmpty } = useCoursesSearch(
    filtersStore.filteredCourses,
    300,
    queryParams.search
  );

  const paginationStore = useLocalStore(
    () => new PaginationStore<CourseConfigItem>(isMobile ? 6 : 9, queryParams.page)
  );

  const queryStore = useLocalStore(
    () =>
      new QueryStore(filtersStore, paginationStore, queryParams.search, (qs) => {
        navigate(
          {
            pathname: window.location.pathname,
            search: qs,
          },
          { replace: true }
        );
      }),
    [filtersStore, paginationStore, navigate]
  );

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      queryStore.setSearch(value);
    },
    [setSearch, queryStore]
  );

  React.useEffect(() => {
    filtersStore.syncFromValue(queryParams.filters);
    paginationStore.setPage(queryParams.page);
    setSearch(queryParams.search);
  }, [filtersStore, paginationStore, queryParams, setSearch]);

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

  const scrollToAnchor = React.useCallback(() => {
    anchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  React.useEffect(() => {
    if (!userChangedPage.current) {
      return;
    }

    userChangedPage.current = false;
    scrollToAnchor();
  }, [currentPage, scrollToAnchor]);

  const recommendationsItems = homeStore.courses;
  const showInitialLoader = homeStore.isLoading && homeStore.courses.length === 0;

  return (
    <div className={s.page}>
      {showInitialLoader && <div className={s.loading}>Загрузка курсов…</div>}
      <Recommendations items={recommendationsItems} recommendations={recommendationsStore.items} />
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
              <Card
                key={item.id}
                item={item}
                statusLabel={courseActivityStatusLabelRu(
                  item.activityStatus ?? CourseActivityStatus.Active
                )}
              />
            ))}
          </div>
          {isEmpty && !showInitialLoader && <div className={s.empty}>Ничего не найдено</div>}
        </div>
        <aside
          ref={sidebarRef}
          className={cn(s.sidebar, isMobile && (isFiltersOpen ? s.sidebarOpen : s.sidebarClosed))}
          aria-label="Фильтры"
          aria-hidden={isMobile ? !isFiltersOpen : false}
        >
          <Filters
            store={filtersStore}
            onClose={isMobile ? handleClose : undefined}
            onScrollToTop={scrollToAnchor}
          />
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
