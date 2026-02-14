import cn from 'classnames';
import * as React from 'react';

import s from './Pagination.module.scss';

type Props = {
  currentPage: number;
  totalPages: number;
  visiblePages: (number | '...')[];
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<Props> = ({ currentPage, totalPages, visiblePages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={s.pagination} aria-label="Пагинация">
      <button
        className={cn(s.button, s.arrow)}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Предыдущая страница"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
          <path
            d="M6 1L1 6L6 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {visiblePages.map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className={s.dots}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={cn(s.button, s.page, currentPage === page && s.active)}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={`Страница ${page}`}
          >
            {page}
          </button>
        )
      )}
      <button
        className={cn(s.button, s.arrow)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Следующая страница"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
          <path
            d="M1 1L6 6L1 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
};

export default React.memo(Pagination);
