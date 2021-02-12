import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DynamicSchedulerService {

  constructor(private http: HttpClient) { }
  

  getSchedulerHeight() {
    return window.innerHeight - 196 + 'px';
  }

  getSchedulerHeightWithoutToolbar() {
    return window.innerHeight - 124 + 'px';
  }
}
