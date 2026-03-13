import { action, computed, makeObservable, observable } from 'mobx';
import type { View } from 'react-big-calendar';

import { MOCK_ENROLLMENTS, MOCK_TEACHER_ID, type CalendarFilterMode } from 'config/calendar';
import type { CourseConfigItem } from 'config/cards';
import {
  generateCalendarEvents,
  getCourseOptionsForMode,
  getDateToNavigate,
  getFilteredCourses,
} from 'pages/CalendarPage/utils';
import type { CalendarEvent } from 'pages/CalendarPage/utils';
import { MockDb } from 'services/mockDb';
import type { IUserStore } from 'store/globals/user/declaration';
import { ILocalStore } from 'store/interfaces';

export class CalendarPageStore implements ILocalStore {
  filterMode: CalendarFilterMode = 'all';
  selectedCourseId = 'all';
  date = new Date();
  view: View = 'month';
  selectedEvent: CalendarEvent | null = null;

  constructor(private _userStore: IUserStore) {
    makeObservable(this, {
      filterMode: observable,
      selectedCourseId: observable,
      date: observable,
      view: observable,
      selectedEvent: observable,

      enrolledCourses: computed,
      myCourses: computed,
      allCourses: computed,
      effectiveFilterMode: computed,
      courseOptionsForMode: computed,
      filteredCourses: computed,
      events: computed,
      courseIds: computed,

      setFilterMode: action,
      setSelectedCourseId: action,
      setDate: action,
      setView: action,
      setSelectedEvent: action,
      handleFilterModeChange: action,
      navigateToAppropriateDate: action,
    });
  }

  get enrolledCourses(): CourseConfigItem[] {
    const user = this._userStore.user;

    if (!user) {
      return [];
    }

    const userEnrollments = user.enrollments ?? [];
    const dbEnrollments = MockDb.getUserEnrollments();
    const enrollments = userEnrollments.length > 0 ? userEnrollments : dbEnrollments;
    const fallbackEnrollments = enrollments.length > 0 ? enrollments : MOCK_ENROLLMENTS;
    const activeIds = fallbackEnrollments
      .filter((e) => e.status === 'active' || e.status === 'pending')
      .map((e) => e.courseId);

    return MockDb.getCourses().filter((c) => activeIds.includes(c.id));
  }

  get myCourses(): CourseConfigItem[] {
    const user = this._userStore.user;
    const teacherId = user?.role === 'teacher' ? user.id : MOCK_TEACHER_ID;

    return MockDb.getTeacherCourses(teacherId).filter((c) => c.courseStatus === 'active');
  }

  get allCourses(): CourseConfigItem[] {
    const byId = new Map<number, CourseConfigItem>();

    for (const c of this.enrolledCourses) {
      byId.set(c.id, c);
    }

    for (const c of this.myCourses) {
      byId.set(c.id, c);
    }

    return Array.from(byId.values());
  }

  get effectiveFilterMode(): CalendarFilterMode {
    return this.filterMode;
  }

  get courseOptionsForMode() {
    return getCourseOptionsForMode(
      this.effectiveFilterMode,
      this.allCourses,
      this.enrolledCourses,
      this.myCourses
    );
  }

  get filteredCourses(): CourseConfigItem[] {
    return getFilteredCourses(
      this.effectiveFilterMode,
      this.selectedCourseId,
      this.allCourses,
      this.enrolledCourses,
      this.myCourses
    );
  }

  get events(): CalendarEvent[] {
    return generateCalendarEvents(this.filteredCourses);
  }

  get courseIds(): number[] {
    return this.filteredCourses.map((c) => c.id);
  }

  setFilterMode = (mode: CalendarFilterMode): void => {
    this.filterMode = mode;
  };

  setSelectedCourseId = (id: string): void => {
    this.selectedCourseId = id;
  };

  setDate = (date: Date): void => {
    this.date = date;
  };

  setView = (view: View): void => {
    this.view = view;
  };

  setSelectedEvent = (event: CalendarEvent | null): void => {
    this.selectedEvent = event;
  };

  handleFilterModeChange = (mode: CalendarFilterMode): void => {
    this.filterMode = mode;
    this.selectedCourseId = 'all';
  };

  navigateToAppropriateDate = (): void => {
    const newDate = getDateToNavigate(this.selectedCourseId, this.filteredCourses, this.date);

    if (newDate) {
      this.date = newDate;
    }
  };

  destroy = (): void => {};
}
