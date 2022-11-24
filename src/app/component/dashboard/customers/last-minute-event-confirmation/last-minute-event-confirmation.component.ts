import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { TaskService } from 'src/app/service/task.service';
import { UsersService } from 'src/app/service/users.service';
import * as CryptoJS from 'crypto-js';
import { DatePipe } from '@angular/common';
import { checkIfInputValid } from "../../../../shared/utils";
import { CustomersService } from 'src/app/service/customers.service';
import { EventModel } from 'src/app/models/event.model';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-last-minute-event-confirmation',
  templateUrl: './last-minute-event-confirmation.component.html',
  styleUrls: ['./last-minute-event-confirmation.component.scss']
})
export class LastMinuteEventConfirmationComponent implements OnInit {
  public dates:any[];
  public selectedTherapeut;
  public selectedHour;
  public selectedDay;
  public language: any;
  public checkIfInputValid = checkIfInputValid;
  public loading=true;

  private user;
  private startDate:Date;
  private endDate:Date;
  private days;
  private storeId;
  private therapeuts:any[]=[];
  private hours:any[]=[];

  private selectedTherapeuts;
  private static secretKey = "YourSecretKeyForEncryption&Descryption";

  constructor(
    private activatedRoute: ActivatedRoute,
    public usersService: UsersService,
    private taskService: TaskService,
    private datePipe: DatePipe,
    private customersService: CustomersService,
    private helpService: HelpService) { }

  ngOnInit() {    
    this.activatedRoute.queryParams.subscribe(params=>{
      const jString = JSON.stringify(params);
      const jObj=JSON.parse(jString);  
      const urlString = Object.keys(jObj)[0].toString().replace(/ /g,'+');
      const descryptedUrl = this.decryptData(urlString).replace(/=/g,':');
      const arrayOfUrlParams = descryptedUrl.split("&");
      const arrayOfJsonObject=[];

      arrayOfUrlParams.forEach(element => {
        if(element.includes('startDate')||element.includes('endDate')||element.includes('time')){
          if(!element.includes('time'))
            element = element.replace(/%2F/g,'/')
          
          element=element.split(':')[0]+':\"'+element.split(':')[1]+'\"';
        }

        arrayOfJsonObject.push(JSON.parse("{\""+element.replace(/:/,'\":')+"}"));
      });

      const mergedSameObjectsInArray = arrayOfJsonObject.reduce(function (acc, curr) {
        var key = Object.keys(curr)[0];
        var found = acc.find(function (i) {
          return i[key];
        });
      
        if (!found) {
          acc.push(curr);
        } else {
          found[key] = [].concat(found[key], curr[key]);
        }
      
        return acc;
      }, []);

      const lastMinuteOfferObject = mergedSameObjectsInArray.reduce(((r, c) => Object.assign(r, c)), {})

      console.log(lastMinuteOfferObject);
      
      this.user=lastMinuteOfferObject.user;
      this.days=lastMinuteOfferObject.days;
      this.storeId=lastMinuteOfferObject.storeId;
      this.selectedTherapeuts=lastMinuteOfferObject.therapeuts;
      this.startDate=lastMinuteOfferObject.startDate;
      this.endDate=lastMinuteOfferObject.endDate;
      this.dates=this.availableDates(this.startDate,this.endDate);
  
      if(lastMinuteOfferObject.time instanceof Array)
        this.hours=lastMinuteOfferObject.time;
      else
        this.hours.push(lastMinuteOfferObject.time);
    });
    
    this.usersService.getUsersInCompany(this.storeId, (val) => {
      if(this.selectedTherapeuts instanceof Array){
        this.therapeuts = val.filter((item) => this.selectedTherapeuts.includes(item.id));
      }else{
        this.therapeuts = val.filter((item) => item.id===this.selectedTherapeuts);       
      }
    });   
    
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    this.loading=false;
  }

  availableDates(startDate: Date, endDate: Date){
    for(var arr=[],dt=new Date(startDate); dt<=new Date(endDate); dt.setDate(dt.getDate()+1)){
      if(this.days instanceof Array){
        if(this.days.includes(dt.getDay()))
          arr.push({value:new Date(dt), displayValue:this.datePipe.transform(new Date(dt),"fullDate")});
      }else{
        if(this.days === dt.getDay())
          arr.push({value:new Date(dt), displayValue:this.datePipe.transform(new Date(dt),"fullDate")});
      }
    }
    return arr;
  }

  addLastMinuteEvent(){
    let formValue = new EventModel(); 
    let customerUser;
    this.customersService.getCustomerWithId(this.user).subscribe((data) => {
        customerUser = data[0];
        console.log(customerUser);
        formValue.user=customerUser;
        formValue.title = this.language.lastMinuteOffer+" - "
          + customerUser["lastname"] 
          + " " 
          + customerUser["firstname"];   

        let start =  new Date(this.selectedDay.value.getFullYear(), this.selectedDay.value.getMonth(), this.selectedDay.value.getDate(), this.getHours(this.selectedHour), this.getMinutes(this.selectedHour));
        let end = new Date(start);

        console.log(this.selectedTherapeut);
        if(start.getTime()>new Date().getTime())
        {
          end.setMinutes(start.getMinutes()+30);
          formValue.start = this.datePipe.transform(start,"yyyy-MM-ddTHH:mm:ssZ");
          formValue.end =  this.datePipe.transform(end,"yyyy-MM-ddTHH:mm:ssZ");
          formValue.superadmin = this.helpService.getSuperadmin();
          formValue.color = "#63f26f";
          formValue.colorTask="12";
          formValue.creator_id = this.selectedTherapeut;
          formValue.confirm=1;
  
          console.log(formValue);
          
          this.taskService.createTask(formValue, (val) => {
            if (val.success) {     
              this.helpService.successToastr(this.language.successExecutedActionTitle,this.language.successExecutedActionText);
            } else {
              this.helpService.errorToastr(this.language.errorExecutedActionTitle,this.language.errorExecutedActionText);
            }
          });      
        }else{
          this.helpService.errorToastr(this.language.lastMinuteOfferDatePassedTitle,this.language.lastMinuteOfferDatePassedText);
        }
    });
  }

  decryptData(data) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, LastMinuteEventConfirmationComponent.secretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  getHours(selectedHour: any): number {
    return Number(selectedHour.split('.')[0]);
  }
  
  getMinutes(selectedHour: any): number {
    return Number(selectedHour.split('.')[1].substring(0,2));
  }
}

