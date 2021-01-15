import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicSchedulerService {

  constructor() { }
  

  getSchedulerHeight() {
    return window.innerHeight - 196 + 'px';
  }
}
