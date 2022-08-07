import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() { }

  getLocalStorage(key) {
    const valueToJSON = JSON.parse(localStorage.getItem(key));
    return valueToJSON;
  }

  setLocalStorage(key, value) {
    const valueToString = JSON.stringify(value);
    localStorage.setItem(key, valueToString);
  }
  
}
