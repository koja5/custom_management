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

  constructor(
    public route: ActivatedRoute,
    public service: UsersService,
    public sanitizer: DomSanitizer
  ) {}

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

    this.service.getWorkTime().subscribe(data => {
      console.log(this.convertNumericToDay(data));
      this.workTime = this.convertNumericToDay(data);
    });
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
      if(data.day === 0) {
        data.day = this.language.monday;
      } else if(data.day == 1) {
        data.day = this.language.tuesday;
      } else if(data.day === 2) {
        data.day = this.language.wednesday;
      } else if(data.day === 3) {
        data.day = this.language.thursday;
      } else if(data.day === 4) {
        data.day = this.language.friday;
      }
      /*switch (data) {
        case (data.day === 0): {
          data.day = this.language.monday;
          break;
        }
        case data.day === 1: {
          data.day = this.language.tuesday;
          break;
        }
        case data.day === 2: {
          data.day = this.language.wednesday;
          break;
        }
        case data.day === 3: {
          data.day = this.language.thursday;
          break;
        }
        case data.day === 4: {
          data.day = this.language.friday;
          break;
        }
        default:
          break;
      }*/
      days[i] = data;
    }
    return days;
  }

  updateWorkTime(workTime) {
    console.log(workTime);
  }
}
