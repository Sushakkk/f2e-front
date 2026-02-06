import { observer } from 'mobx-react';
import * as React from 'react';

import s from './HomePage.module.scss';
import { Card, Recommendations, SearchBar } from './components';
import { useCoursesSearch } from 'utils/useCoursesSearch';
import { COURSES_CONFIG } from './config/cards';


const HomePage: React.FC = () => {
  const { search, setSearch, filteredCourses, isEmpty } =
    useCoursesSearch();

  return (
    <div className={s.page}>
      <Recommendations items={COURSES_CONFIG}/>
      <SearchBar value={search} onChange={setSearch} />

      <div className={s.cards}>
        {filteredCourses.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>

      {isEmpty && <div className={s.empty}>Ничего не найдено</div>}
    </div>
  );
};

export default observer(HomePage);
