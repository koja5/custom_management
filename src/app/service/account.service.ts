import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }
  
  getClinicEmployees(id: number) {
    return this.http.get(`api/getClinicEmployees/${id}`);
  }

  getClinicCustomers(id: number) {
    return this.http.get(`api/getClinicCustomers/${id}`);
  }

  updateRegisteredClinic(body) {
    return this.http.post("api/updateRegisteredClinic", body);
  }

  deleteRegisteredClinic(data) {
    return this.http.post("api/deleteRegisteredClinic", data);
  }

  getSuperadmin(id) {
    return this.http.get('/api/getSuperadmin/' + id);
  }

  getUser(id) {
    return this.http.get('/api/getUserWithId/' + id);
  }

  updateProfileImage(img, user) {
    if(user.type == undefined) {
      user.type = 4;
    }
    return this.http.post(`api/uploadProfileImage/${user.id}/${user.type}`, img);
  }

  updateEmployeeProfileImage(img, user) {
    return this.http.post(`api/uploadeEmployeeProfileImage/${user.id}`, img);
  }

  getImage(body: any) {
    if (!body.path) {
      body = {
        path: body,
      };
    }
    return this.http.post('api/getImage', body, {
      responseType: 'blob',
    });
  }

  getCustomerWithId(id)  {
    return this.http.get('/api/getCustomerWithId/' + id);
  }

  updateSuperadmin(data) {
    return this.http.post('/api/updateSuperadmin', data);
  }

  updatePasswordForSuperadmin(data) {
    return this.http.post('/api/updatePasswordForSuperadmin', data);
  }

  updateUser(data) {
    return this.http.post('/api/updateUserFromSettings', data);
  }

  updatePasswordForUser(data) {
    return this.http.post('/api/updatePasswordForUser', data);
  }

  updatePatient(data) {
    return this.http.post('/api/updateCustomer', data);
  }

  updatePasswordForPatient(data) {
    return this.http.post('/api/updatePasswordForCustomer', data);
  }
}
