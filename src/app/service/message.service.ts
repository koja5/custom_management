import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessageService {

  public theme = new Subject<any>();
  public language = new Subject<null>();
  public imageProfile = new Subject<null>();
  public deleteCustomer = new Subject<null>();
  public backToCustomerGrid = new Subject<null>();
  public weekChange = new Subject<any>();

  sendTheme(message: string) {
    this.theme.next(message);
  }

  getTheme(): Observable<any> {
    return this.theme.asObservable();
  }

  sendLanguage() {
    this.language.next();
  }

  getLanguage() {
    return this.language.asObservable();
  }

  sendImageProfile() {
    this.imageProfile.next();
  }

  getImageProfile(): Observable<null> {
    return this.imageProfile.asObservable();
  }

  sendDeleteCustomer() {
    this.deleteCustomer.next();
  }

  getDeleteCustomer() {
    return this.deleteCustomer.asObservable();
  }

  sendBackToCustomerGrid() {
    this.backToCustomerGrid.next();
  }

  getBackToCustomerGrid() {
    return this.backToCustomerGrid.asObservable();
  }

  sendWeekChange(direction: string) {
    this.weekChange.next(direction);
  }

  getWeekChange() {
    return this.weekChange.asObservable();
  }
}
