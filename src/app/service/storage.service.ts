import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient) { }

  getStoreSettings() {
    return JSON.parse(localStorage.getItem('storeSettings'));
  }

  setStoreSettings(data) {
    localStorage.setItem('storeSettings', JSON.stringify(data));
  }

  getSelectedStore(id) {
    return Number(sessionStorage.getItem("selectedStore-" + id));
  }

  setSelectedStore(id, value) {
    sessionStorage.setItem("selectedStore-" + id, value);
  }

  removeSelectedStore(id) {
    localStorage.removeItem("selectedStore-" + id);
  }

  getSelectedUser(id) {
    return localStorage.getItem("selectedUser-" + id);
  }

  setSelectedUser(id, value) {
    localStorage.setItem("selectedUser-" + id, value);
  }
}
