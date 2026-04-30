import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import type { View } from 'react-big-calendar';

import { ENDPOINTS } from 'config/api';
import type { CalendarFilterMode } from 'config/calendar';
import { normalizeCalendarEvent, type CalendarEventsResponseServer } from 'entities/calendar';
import {
  getCourseOptionsFromEvents,
  getDateToNavigateByEvents,
  getFilteredEvents,
} from 'pages/CalendarPage/utils';
import type { CalendarEvent } from 'pages/CalendarPage/utils';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';

const MODE_TO_API: Record<CalendarFilterMode, string> = {
  all: 'all',
  enrolled: 'enrolled',
  my: 'teaching',
};

type PrivateFields = '_events' | '_isLoading' | '_loadError';

export class CalendarPageStore implements ILocalStore {
  filterMode: CalendarFilterMode = 'all';
  selectedCourseId = 'all';
  date = new Date();
  view: View = 'month';
  selectedEvent: CalendarEvent | null = null;

  private _events: CalendarEvent[] = [];
  private _isLoading = false;
  private _loadError = false;
  private _loadRequestId = 0;

  constructor(private _rootStore: IRootStore) {
    makeObservable<this, PrivateFields>(this, {
      filterMode: observable,
      selectedCourseId: observable,
      date: observable,
      view: observable,
      selectedEvent: observable,
      _events: observable.ref,
      _isLoading: observable,
      _loadError: observable,

      isLoading: computed,
      loadError: computed,
      effectiveFilterMode: computed,
      courseOptionsForMode: computed,
      events: computed,
      courseIds: computed,

      setFilterMode: action,
      setSelectedCourseId: action,
      setDate: action,
      setView: action,
      setSelectedEvent: action,
      handleFilterModeChange: action,
      navigateToAppropriateDate: action,
      loadEvents: action.bound,
      destroy: action.bound,
    });
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  get effectiveFilterMode(): CalendarFilterMode {
    return this.filterMode;
  }

  get courseOptionsForMode() {
    return getCourseOptionsFromEvents(this.effectiveFilterMode, this._events);
  }

  get events(): CalendarEvent[] {
    return getFilteredEvents(this.selectedCourseId, this._events);
  }

  get courseIds(): number[] {
    return [...new Set(this.events.map((event) => event.courseId))];
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
    this.selectedEvent = null;
  };

  navigateToAppropriateDate = (): void => {
    const newDate = getDateToNavigateByEvents(this.selectedCourseId, this.events, this.date);

    if (newDate) {
      this.date = newDate;
    }
  };

  loadEvents = async (): Promise<void> => {
    const requestId = this._loadRequestId + 1;

    this._loadRequestId = requestId;
    this._isLoading = true;
    this._loadError = false;

    const request = this._rootStore.apiStore.createExtendedRequest<
      CalendarEventsResponseServer,
      ErrorResponse
    >({
      ...ENDPOINTS.calendar,
      showExpectedError: false,
      showUnexpectedError: true,
    });

    const response = await request.call({
      params: {
        mode: MODE_TO_API[this.filterMode],
      },
    });

    runInAction(() => {
      if (requestId !== this._loadRequestId) {
        return;
      }

      this._isLoading = false;

      if (response.isError) {
        if (!response.isCancelled) {
          this._loadError = true;
          this._events = [];
        }

        return;
      }

      this._events = response.data.map(normalizeCalendarEvent);
    });
  };

  destroy = (): void => {
    this._events = [];
    this.selectedEvent = null;
  };
}
