import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";

const CREATE_ACTION = "add";
const UPDATE_ACTION = "update";
const REMOVE_ACTION = "delete";

@Injectable({
  providedIn: "root",
})
export class ParameterItemService extends BehaviorSubject<any[]> {
  private data: any[] = [];

  constructor(private http: HttpClient) {
    super([]);
  }

  getData(type, superadmin) {
    /*return this.http.get('/api/get' + type)
      .map(res => res);*/
    console.log(type);
    this.fetch("read", null, type, superadmin)
      .pipe(
        tap((data) => {
          this.data = data;
        })
      )
      .subscribe((data) => {
        console.log(data);
        super.next(data);
      });
  }

  getDoctorType(superadmin) {
    return this.http.get("/api/getDoctorList/" + superadmin).map((res) => res);
  }

  getTherapy(superadmin) {
    return this.http.get("/api/getTherapyList/" + superadmin).map((res) => res);
  }

  getVATTex(superadmin) {
    return this.http.get("/api/getVATTaxList/" + superadmin).map((res) => res);
  }

  public addData(data: any, isNew?: boolean, type?: string, superadmin?: any) {
    const action = isNew ? CREATE_ACTION : UPDATE_ACTION;

    this.reset();

    this.fetch(action, data, type, superadmin).subscribe(
      () => this.getData(type, superadmin),
      () => this.getData(type, superadmin)
    );
  }

  public deleteData(data: any, type?: string, superadmin?: any) {
    this.reset();

    this.fetch(REMOVE_ACTION, data, type, superadmin).subscribe(
      () => this.getData(type, superadmin),
      () => this.getData(type, superadmin)
    );
  }

  private fetch(action, data, type, superadmin): Observable<any[]> {
    if (action === "read") {
      console.log(superadmin);
      return this.http
        .get("/api/get" + type + "List/" + superadmin)
        .pipe(map((res) => res as any[]));
    } else if (action === "add") {
      return this.http
        .post("/api/add" + type + "List", data)
        .pipe(map((res) => res as any[]));
    } else if (action === "delete") {
      return this.http
        .get("/api/delete" + type + "List/" + data)
        .pipe(map((res) => res as any[]));
    } else {
      return this.http
        .post("/api/update" + type + "List", data)
        .pipe(map((res) => res as any[]));
    }
  }

  private reset() {
    this.data = [];
  }

  getMailReminderMessage(id: number) {
    return this.http.get("/api/getMailReminderMessage/" + id);
  }

  createMailReminderMessage(data) {
    return this.http.post("/api/createMailReminderMessage", data);
  }

  updateMailReminderMessage(data) {
    return this.http.post("/api/updateMailReminderMessage", data);
  }

  getMailApproveReservation(id: number) {
    return this.http.get("/api/getMailApproveReservation/" + id);
  }

  createMailApproveReservation(data) {
    return this.http.post("/api/createMailApproveReservation", data);
  }

  updateMailApproveReservation(data) {
    return this.http.post("/api/updateMailApproveReservation", data);
  }

  getMailConfirmArrival(id: number) {
    return this.http.get("/api/getMailConfirmArrival/" + id);
  }

  createMailConfirmArrival(data) {
    return this.http.post("/api/createMailConfirmArrival", data);
  }

  updateMailConfirmArrival(data) {
    return this.http.post("/api/updateMailConfirmArrival", data);
  }

  getMailMultipleRecepient(id: number) {
    return this.http.get("/api/getMailMultipleRecepient/" + id);
  }

  createMailMultipleRecepient(data) {
    return this.http.post("/api/createMailMultipleRecepient", data);
  }

  updateMailMultipleRecepient(data) {
    return this.http.post("/api/updateMailMultipleRecepient", data);
  }

  getMailDenyReservation(id: number) {
    return this.http.get("/api/getMailDenyReservation/" + id);
  }

  createMailDenyReservation(data) {
    return this.http.post("/api/createMailDenyReservation", data);
  }

  updateMailDenyReservation(data) {
    return this.http.post("/api/updateMailDenyReservation", data);
  }

  getMailPatientCreatedAccount(id: number) {
    return this.http.get("/api/getMailPatientCreatedAccount/" + id);
  }

  createMailPatientCreatedAccount(data) {
    return this.http.post("/api/createMailPatientCreatedAccount", data);
  }

  updateMailPatientCreatedAccount(data) {
    return this.http.post("/api/updateMailPatientCreatedAccount", data);
  }

  getMailPatientCreatedAccountViaForm(id: number) {
    return this.http.get("/api/getMailPatientCreatedAccountViaForm/" + id);
  }

  createMailPatientCreatedAccountViaForm(data) {
    return this.http.post("/api/createMailPatientCreatedAccountViaForm", data);
  }

  updateMailPatientCreatedAccountViaForm(data) {
    return this.http.post("/api/updateMailPatientCreatedAccountViaForm", data);
  }

  getMailPatientFormRegistration(id: number) {
    return this.http.get("/api/getMailPatientFormRegistration/" + id);
  }

  createMailPatientFormRegistration(data) {
    return this.http.post("/api/createMailPatientFormRegistration", data);
  }

  updateMailPatientFormRegistration(data) {
    return this.http.post("/api/updateMailPatientFormRegistration", data);
  }

  getSmsReminderMessage(id: number) {
    return this.http.get("/api/getSmsReminderMessage/" + id);
  }

  createSmsReminderMessage(data) {
    return this.http.post("/api/createSmsReminderMessage", data);
  }

  updateSmsReminderMessage(data) {
    return this.http.post("/api/updateSmsReminderMessage", data);
  }

  getSmsMassiveMessage(id: number) {
    return this.http.get("/api/getSmsMassiveMessage/" + id);
  }

  createSmsMassiveMessage(data) {
    return this.http.post("/api/createSmsMassiveMessage", data);
  }

  updateSmsMassiveMessage(data) {
    return this.http.post("/api/updateSmsMassiveMessage", data);
  }

  getMailMassive(id: number) {
    return this.http.get("/api/getMailMassive/" + id);
  }

  createMailMassive(data) {
    return this.http.post("/api/createMailMassive", data);
  }

  updateMailMassive(data) {
    return this.http.post("/api/updateMailMassive", data);
  }

  getSuperadminProfile(id) {
    return this.http.get("/api/getSuperadmin/" + id);
  }

  updateSuperadminProfile(data) {
    return this.http.post("/api/updateSuperadmin", data);
  }

  getSmsBirthdayCongratulation(id: number) {
    return this.http.get("/api/getSmsBirthdayCongratulation/" + id);
  }

  createSmsBirthdayCongratulation(data) {
    return this.http.post("/api/createSmsBirthdayCongratulation", data);
  }

  updateSmsBirthdayCongratulation(data) {
    return this.http.post("/api/updateSmsBirthdayCongratulation", data);
  }

  getMailBirthdayCongratulation(id: number) {
    return this.http.get("/api/getMailBirthdayCongratulation/" + id);
  }

  createMailBirthdayCongratulation(data) {
    return this.http.post("/api/createMailBirthdayCongratulation", data);
  }

  updateMailBirthdayCongratulation(data) {
    return this.http.post("/api/updateMailBirthdayCongratulation", data);
  }

  getMailResetPassword(id: number) {
    return this.http.get("/api/getMailResetPassword/" + id);
  }

  createMailResetPassword(data) {
    return this.http.post("/api/createMailResetPassword", data);
  }

  updateMailResetPassword(data) {
    return this.http.post("/api/updateMailResetPassword", data);
  }
  
  getMailForgotPassword(id: number) {
    return this.http.get("/api/getMailForgotPassword/" + id);
  }

  createMailForgotPassword(data) {
    return this.http.post("/api/createMailForgotPassword", data);
  }

  updateMailForgotPassword(data) {
    return this.http.post("/api/updateMailForgotPassword", data);
  }
}
