import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessageService {

  private theme = new Subject<any>();
  private language = new Subject<null>();
  private imageProfile = new Subject<null>();
  private deleteCustomer = new Subject<null>();
  private backToCustomerGrid = new Subject<null>();

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
}
