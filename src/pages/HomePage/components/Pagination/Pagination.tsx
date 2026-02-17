import cn from 'classnames';
import * as React from 'react';

import ArrowIcon from 'assets/images/arrow.svg?react';

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
        <ArrowIcon className={s.arrowIcon} />
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
        className={cn(s.button, s.arrow, s.arrowRight)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Следующая страница"
      >
        <ArrowIcon className={s.arrowIcon} />
      </button>
    </nav>
  );
};

export default React.memo(Pagination);
