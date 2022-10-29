import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, UrlSerializer } from '@angular/router';
import { TaskService } from 'src/app/service/task.service';
import { UsersService } from 'src/app/service/users.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-last-minute-event-confirmation',
  templateUrl: './last-minute-event-confirmation.component.html',
  styleUrls: ['./last-minute-event-confirmation.component.scss']
})
export class LastMinuteEventConfirmationComponent implements OnInit {
  private startDate:Date;
  private endDate:Date;
  private days;
  private storeId;
  private therapeuts:any[];
  private hours:any[];
  private selectedTherapeuts;
  private selectedHour;

  public selectedTherapeut;
  private static secretKey = "YourSecretKeyForEncryption&Descryption";

  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private serializer: UrlSerializer, 
    public usersService: UsersService,
    private taskService: TaskService) { }

  ngOnInit() {    
    // http:/localhost:4200/dashboard/home/customers/last-minute-event?therapeuts=363&therapeuts=381&therapeuts=364&weekNumber=42&days=1&days=2&days=3&time=Wed%20Oct%2019%202022%2021:00:00%20GMT%2B0200%20(Central%20European%20Summer%20Time)
    this.activatedRoute.queryParams.subscribe(params=>{
      console.log(params);
      this.days=params.days;
      this.storeId=params.storeId;
      this.selectedTherapeuts=params.therapeuts;
      this.startDate=params.startDate;
      this.endDate=params.endDate;
      this.hours=params.hours
    });
    console.log(this.days);
    
    this.usersService.getUsersInCompany(this.storeId, (val) => {
      this.therapeuts = val.filter(item=>this.selectedTherapeuts.includes(item.id.toString()));     
    });    
  }

  parseUrl(route: ActivatedRouteSnapshot): Map<string,string> {
    const result = this.reduceRouterChildrenParams(route.root.firstChild, new Map<string, string>());
    console.log(result);
    return result;
  }
  
  reduceRouterChildrenParams(routerChild: ActivatedRouteSnapshot | null, data: Map<string, string>): any {
    if (!routerChild) {
        return data;
    }
    for (const paramMapKey of routerChild.paramMap.keys) {
      data.set(paramMapKey, routerChild.paramMap.get(paramMapKey)!);
    }
    return routerChild.children.reduce((previousValue, currentValue) => {
      return this.reduceRouterChildrenParams(currentValue, previousValue);
    }, data);
  } 

  onSubmit(){
    // let formValue ={
    //   creator_id: this.userId,
    //   customer_id: this.userId,
    //   title: "FREE EVENT",
    //   colorTask: req.body.colorTask,
    //   start: req.body.start,
    //   end: req.body.end,
    //   therapy_id: req.body.therapy_id,
    //   superadmin: req.body.superadmin,
    //   confirm: req.body.confirm
    // };
    // this.taskService.createTask(formValue, (val) => {
    //       if (val.success) {          
    //         this.toastr.success(
    //           this.language.successUpdateTitle,
    //           this.language.successUpdateText,
    //           { timeOut: 7000, positionClass: "toast-bottom-right" }
    //         );
    //       } else {
    //         this.toastr.error(
    //           this.language.unsuccessUpdateTitle,
    //           this.language.unsuccessUpdateText,
    //           { timeOut: 7000, positionClass: "toast-bottom-right" }
    //         );
    //       }
    //     }); 
    //   }
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

}