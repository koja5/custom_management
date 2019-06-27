import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UsersService } from "../../../../service/users.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.scss"]
})
export class UserDetailsComponent implements OnInit {
  public id: string;
  public data: any;
  public imagePath: any;
  public userType = ["Employee", "Manager", "Admin"];
  public selectedValue: string;
  public currentTab = "profile";
  public language: any;
  public workTime: any;
  public noSetWorkTime = false;

  constructor(
    public route: ActivatedRoute,
    public service: UsersService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    console.log(this.route.snapshot.params["id"]);
    this.id = this.route.snapshot.params["id"];
    this.service.getUserWithId(this.id, val => {
      console.log(val);
      this.data = val[0];
      this.modelData();
      if (val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl(
          "data:image/png;base64," + base64String
        );
        console.log(path);
        this.imagePath = path;
      } else {
        if (this.data.type === 1) {
          this.imagePath = "../../../../assets/images/users/admin-user.png";
        } else if (this.data.type === 2) {
          this.imagePath = "../../../../assets/images/users/manager-user.png";
        } else {
          this.imagePath = "../../../../../assets/images/users/defaultUser.png";
        }
        console.log(this.imagePath);
      }
    });

    this.language = JSON.parse(localStorage.getItem("language"))["user"];

    
    this.service.getWorkTimeForUser(this.id).subscribe(
      (data: []) => {
        if(data['length'] === 0) {
          this.noSetWorkTime = true;
          this.service.getWorkTime().subscribe(data => {
            this.workTime = this.convertNumericToDay(data);
          });
        } else {
          console.log(data);
          let dataSort = [];
          dataSort = data.sort((val1, val2) => {return (new Date(val2['dateChange']) as any) - (new  Date(val1['dateChange']) as any)})
          console.log(dataSort[0]);
          this.workTime = this.packWorkTimeFromDatabase(dataSort[0]);
        }
      }
    )
  }

  updateUser(user) {
    console.log(user);
  }

  modelData() {
    this.data.birthday = new Date(this.data.birthday);
    this.data.incompanysince = new Date(this.data.incompanysince);
    if (this.data.type === 1) {
      this.selectedValue = "Admin";
    } else if (this.data.type === 2) {
      this.selectedValue = "Manager";
    } else {
      this.selectedValue = "Employee";
    }
  }

  changeTab(value: string) {
    this.currentTab = value;
  }

  convertNumericToDay(days) {
    for (let i = 0; i < days.length; i++) {
      const data = days[i];
      if (data.day === 1) {
        data.day = this.language.monday;
      } else if (data.day == 2) {
        data.day = this.language.tuesday;
      } else if (data.day === 3) {
        data.day = this.language.wednesday;
      } else if (data.day === 4) {
        data.day = this.language.thursday;
      } else if (data.day === 5) {
        data.day = this.language.friday;
      }
      days[i] = data;
    }
    return days;
  }

  convertDayToNumeric(day) {
    if(day === this.language.monday.toLowerCase()) {
      day = 1;
    } else if(day === this.language.tuesday.toLowerCase()) {
      day = 2;
    } else if(day === this.language.wednesday.toLowerCase()) {
      day = 3;
    } else if(day === this.language.thursday.toLowerCase()) {
      day = 4;
    } else if(day === this.language.friday.toLowerCase()) {
      day = 5;
    }
    return day;
  }

  updateWorkTime(workTime) {
    console.log(workTime);
    // workTime = this.convertDayToNumeric(workTime);
    console.log(this.packWorkTime(workTime));
    workTime = this.packWorkTime(workTime);
    this.service.setWorkTimeForUser(workTime).subscribe(
      date => {
        console.log(date);
      }
    );
  }

  packWorkTime(workTime) {
    const time = {};
    for (let i = 0; i < workTime.length; i++) {
      const day = workTime[i].day;
      time[day.toString().toLowerCase()] = this.convertDayToNumeric(day.toString().toLowerCase()) + '-' + workTime[i].start + '-' + workTime[i].end;
    }
    time['user_id'] = this.id;
    time['dateChange'] = new Date();
    return time;
  }

  packWorkTimeFromDatabase(workTime) {
    const model = [
      {
        "day": this.language.monday,
        "start": workTime.monday.split('-')[1],
        "end": workTime.monday.split('-')[2]
      },
      {
        "day": this.language.tuesday,
        "start": workTime.tuesday.split('-')[1],
        "end": workTime.tuesday.split('-')[2]
      },
      {
        "day": this.language.wednesday,
        "start": workTime.wednesday.split('-')[1],
        "end": workTime.wednesday.split('-')[2]
      },
      {
        "day": this.language.thursday,
        "start": workTime.thursday.split('-')[1],
        "end": workTime.thursday.split('-')[2]
      },
      {
        "day": this.language.friday,
        "start": workTime.friday.split('-')[1],
        "end": workTime.friday.split('-')[2]
      },
    ];
    return model;
  }
}
