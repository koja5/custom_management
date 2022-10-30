import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { callbackify } from "util";

@Injectable({
  providedIn: "root",
})
export class CustomersService {
  constructor(public http: HttpClient) { }

  createCustomer(data, callback) {
    console.log("Pozivam funkciju signup!");
    console.log(data);
    this.http
      .post("/api/createCustomer", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  createCustomerFromPatientForm(data) {
    return this.http
      .post("/api/createCustomerFromPatientForm", data)
      .map((res) => res);
  }

  getCustomers(id, callback) {
    return this.http
      .get("/api/getCustomers/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  getInfoCustomer(id) {
    return this.http.get("/api/getInfoForCustomer/" + id).map((res) => res);
  }

  deleteCustomer(id, callback) {
    return this.http
      .get("/api/deleteCustomer/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  searchCustomer(search) {
    return this.http.post("/api/searchCustomer", search).map((res) => res);
  }

  updateCustomer(data, callback) {
    this.http
      .post("/api/updateCustomer", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  uploadImage(data, callback) {
    // const uploadSaveUrl = 'http://localhost:3000/api/uploadImage';
    const uploadSaveUrl = "http://116.203.85.82:8080/uploadImage";
    return this.http
      .post(uploadSaveUrl, data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  insertMultiData(data) {
    return this.http.post("/api/insertFromExcel", data).map((res) => res);
  }

  downloadFile(file: string) {
    console.log(file);
    const body = { filename: file };

    return this.http.post("/api/download", body, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "application/json"),
    });
  }

  getPdfFile(file: string) {
    console.log(file);
    const body = { filename: file };

    return this.http.post("/api/getPdfFile", body, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "application/json"),
    });
  }

  getDocuments(id, callback) {
    return this.http
      .get("/api/getDocuments/" + id)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  deleteDocument(path) {
    return this.http.post("api/deleteDocument", path).map((res) => res);
  }

  deleteDocumentFromDatabase(id) {
    return this.http
      .get("/api/deleteDocumentFromDatabase/" + id)
      .map((res) => res);
  }

  getCustomerWithId(id) {
    return this.http.get("/api/getCustomerWithId/" + id).map((res) => res);
  }

  addComplaint(data) {
    return this.http.post("/api/addComplaint", data).map((res) => res);
  }

  updateComplaint(data) {
    return this.http.post("/api/updateComplaint", data).map((res) => res);
  }

  deleteComplaint(id) {
    return this.http.get("/api/deleteComplaint/" + id).map((res) => res);
  }

  getComplaintForCustomer(id) {
    return this.http
      .get("/api/getComplaintForCustomer/" + id)
      .map((res) => res);
  }

  addTherapy(data) {
    return this.http.post("/api/addTherapy", data).map((res) => res);
  }

  updateTherapy(data) {
    return this.http.post("/api/updateTherapy", data).map((res) => res);
  }

  updateAttentionAndPhysical(data) {
    return this.http
      .post("/api/updateAttentionAndPhysical", data)
      .map((res) => res);
  }

  getTherapy(id) {
    return this.http.get("/api/getTherapy/" + id).map((res) => res);
  }

  deleteTherapy(id) {
    return this.http.get("/api/deleteTherapy/" + id).map((res) => res);
  }

  getTherapyForCustomer(id) {
    return this.http.get("/api/getTherapyForCustomer/" + id).map((res) => res);
  }

  getCustomerList(type, superadmin) {
    return this.http
      .get("/api/get" + type + "List/" + superadmin)
      .map((res) => res);
  }

  addBaseDataOne(data) {
    return this.http.post("/api/addBaseDataOne", data).map((res) => res);
  }

  getBaseDataOne(id: number) {
    return this.http.get("/api/getBaseDataOne/" + id).map((res) => res);
  }

  updateBaseDataOne(data) {
    return this.http.post("/api/updateBaseDataOne", data).map((res) => res);
  }

  addBaseDataTwo(data) {
    return this.http.post("/api/addBaseDataTwo", data).map((res) => res);
  }

  getBaseDataTwo(id: number) {
    return this.http.get("/api/getBaseDataTwo/" + id).map((res) => res);
  }

  updateBaseDataTwo(data) {
    return this.http.post("/api/updateBaseDataTwo", data).map((res) => res);
  }

  addPhysicalIllness(data) {
    return this.http.post("/api/addPhysicalIllness", data).map((res) => res);
  }

  getPhysicallIllness(id: number) {
    return this.http.get("/api/getPhysicalIllness/" + id).map((res) => res);
  }

  updatePhysicalIllness(data) {
    return this.http.post("/api/updatePhysicalIllness", data).map((res) => res);
  }

  getParameters(type, superadmin) {
    return this.http
      .get("/api/get" + type + "List/" + superadmin)
      .map((res) => res);
  }

  updateDocument(data) {
    return this.http.post("/api/updateDocument", data).map((res) => res);
  }

  updateCustomerSendReminderOption(data) {
    return this.http
      .post("/api/updateCustomerSendReminderOption", data)
      .map((res) => res);
  }

  unsubscribeUserFromMassiveEmail(data) {
    return this.http.post("/api/updateMassiveEmailForUser", data).map((res) => res);
  }

  unsubscribeUserFromMassiveSMS(data) {
    return this.http.post("/api/updateMassiveSMSForUser", data).map((res) => res);
  }
}
