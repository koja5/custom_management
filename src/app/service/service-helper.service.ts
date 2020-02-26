import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceHelperService {

  constructor(private http: HttpClient) { }

  getTranslate(language: any, title: string) {
    /*if (title === "profile") {
      return language[title];
    } else if (title === "base_one") {
      return language.baseDataOne;
    } else if (title === "base_two") {
      return this.language.baseDataTwo;
    } else if (title === "physical_illness") {
      return this.language.physicalIllness;
    } else if (title === "add") {
      return this.language.addComplaint;
    } else if (title === "edit") {
      return this.language.updateComplaint;
    } else if (title === "addTherapy") {
      return this.language.addTherapy;
    } else if (title === "editTherapy") {
      return this.language.updateTherapy;
    }*/
    return language[title];
  }
}
