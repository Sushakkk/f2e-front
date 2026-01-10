import { makeAutoObservable } from 'mobx';

export class ValueModel<T> {
  private _value: T;

  constructor(value: T) {
    this._value = value;
    makeAutoObservable<this, '_value'>(this, {
      _value: true,
    });
  }

  get value(): T {
    return this._value;
  }

  setValue(value: T): void {
    this._value = value;
  }
}
