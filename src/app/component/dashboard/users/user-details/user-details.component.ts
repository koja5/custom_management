import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UsersService } from "../../../../service/users.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Modal } from "ngx-modal";
import { Location } from "@angular/common";
import { StoreService } from "../../../../service/store.service";
import { TaskService } from "../../../../service/task.service";
import Swal from "sweetalert2";
import { MessageService } from "src/app/service/message.service";
import { WorkTimeColorsService } from "src/app/service/work-time-colors.service";
import { DynamicService } from "src/app/service/dynamic.service";
import { UserType } from "src/app/component/enum/user-type";
import { MailService } from "src/app/service/mail.service";
import { LoginService } from "src/app/service/login.service";
import { HelpService } from "src/app/service/help.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { AccountService } from "src/app/service/account.service";
import { checkIsValidDate } from "src/app/shared/utils";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.scss"],
})
export class UserDetailsComponent implements OnInit {
  @ViewChild("user") user: Modal;
  @ViewChild("chooseImage") chooseImage: Modal;
  public id: string;
  public data: any;
  public imagePath: any;
  public userType = ["Employee", "Manager", "Admin", "Read only scheduler"];
  public selectedValue: string;
  public currentTab = "profile";
  public language: any;
  public workTime: any;
  public noSetWorkTime = false;
  public storeLocation: any;
  public selectedStore: any;
  public validDate: Date;
  public selectedColor = null;
  public palette: any[] = [];
  public loading = true;
  public allWorkTime: any;
  public index = 0;
  public previousInd = "";
  public nextInd = "disabled-button";
  public updateSetIndicator = 0;
  public dialogOpened = false;
  public modalDeletedWorkTimeConfirm = false;
  public theme: string;
  public totalSum: any;
  public statisticMonthLast: any;
  public statisticMonthAverage: any;
  public statisticLastWeek: any;
  public configField: any;
  public userTypeEnum = UserType;
  showDialog: boolean = false;
  isFormDirty: boolean = false;
  updateImageInput: any;
  isFileChoosen: boolean = false;
  fileName: string = '';
  currentUser: any;
  checkIsValidDate = checkIsValidDate;

  constructor(
    public route: ActivatedRoute,
    public service: UsersService,
    public sanitizer: DomSanitizer,
    public location: Location,
    public storeService: StoreService,
    public taskService: TaskService,
    public message: MessageService,
    public workTimeColorService: WorkTimeColorsService,
    private dynamicService: DynamicService,
    private mailService: MailService,
    private loginService: LoginService,
    private packLanguage: PackLanguageService,
    private helpService: HelpService,
    private accountService: AccountService,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params["id"];
    this.getCurrentUser();
    this.getUser();

    this.language = JSON.parse(localStorage.getItem("language"));
    
    this.storeService.getStore(localStorage.getItem("idUser"), (val) => {
      this.storeLocation = val;
    });

    /*this.taskService.getTaskColor().subscribe(data => {
      for (let i = 0; i < data['length']; i++) {
        this.palette.push(data[i].color);
      }
    });*/

    this.workTimeColorService
      .getWorkTimeColors(localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        const colors = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
        for (let i = 0; i < colors["length"]; i++) {
          this.palette.push(colors[i]["color"]);
        }
      });

    this.workTimeData();

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }

    setTimeout(() => {
      this.changeTheme(this.theme);
    }, 500);

    this.message.getTheme().subscribe((mess) => {
      this.changeTheme(mess);
      this.theme = mess;
    });

    this.onInitData();
  }

  getCurrentUser() {
    this.service.getMe(localStorage.getItem("idUser"), (val) => {
      this.currentUser = val[0];
    });
  }

  getUser() {
    this.service.getUserWithId(this.id, (val) => {
      this.data = val[0];
      console.log(this.data);
      this.modelData();
      if (
        val[0].img !== null &&
        val[0].img.data !== undefined &&
        val[0].img.data.length !== 0
      ) {
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
  }

  sendRecoveryLink() {
    const thisObject = this;
    thisObject.data["language"] = this.packLanguage.getLanguageForForgotMail();
    if (this.data.email !== "") {
      this.loginService.forgotPassword(this.data, function (exist, notVerified) {
        setTimeout(() => {
          if (exist) {
            thisObject.mailService
              .sendForgetMail(thisObject.data)
              .subscribe(
                (data) => {
                  thisObject.helpService.successToastr(
                    thisObject.language.sendPasswordRecovery,
                    thisObject.language.sendPasswordRecoverySucess
                  );
                },
                (error) => {
                  thisObject.helpService.errorToastr(
                    thisObject.language.sendPasswordRecovery,
                    thisObject.language.sendPasswordRecoveryError
                  );
                }
              );
          }
        }, 100);
      });
    }
  }

  onInitData() {
    this.service.getCountAllTasksForUser(this.id).subscribe((data) => {
      if (data["length"] !== 0) {
        this.totalSum = data[0].total;
      } else {
        this.totalSum = 0;
      }
    });

    this.service.getCountAllTasksForUserPerMonth(this.id).subscribe((data) => {
      console.log(data);
      if (data["length"] !== 0) {
        let sum = 0;
        let i = 0;
        for (i = 0; i < data["length"]; i++) {
          sum += data[i].month;
          if (i === data["length"] - 2) {
            this.statisticMonthLast = data[i].month;
          } else if (i === data["length"] - 1) {
            this.statisticMonthLast = data[i].month;
          }
        }
        this.statisticMonthAverage = parseFloat((sum / i).toString()).toFixed(
          2
        );
      } else {
        this.statisticMonthLast = 0;
        this.statisticMonthAverage = 0;
      }
    });

    this.service.getCountAllTasksForUserPerWeek(this.id).subscribe((data) => {
      console.log(data);
      if (data["length"] !== 0) {
        this.statisticLastWeek = data[data["length"] - 2].week;
      } else {
        this.statisticLastWeek = 0;
      }
    });
  }

  workTimeData() {
    this.workTime = null;
    this.service.getWorkTimeForUser(this.id).subscribe((data: []) => {
      if (data["length"] === 0) {
        this.noSetWorkTime = true;
        this.validDate = new Date();
        this.service.getWorkTime().subscribe((data) => {
          this.workTime = this.convertNumericToDay(data);
        });
      } else {
        console.log(data);
        let dataSort = [];
        dataSort = data.sort((val1, val2) => {
          return (
            (new Date(val2["dateChange"]) as any) -
            (new Date(val1["dateChange"]) as any)
          );
        });
        console.log(dataSort[0]);
        this.selectedColor = dataSort[0].color;
        this.allWorkTime = dataSort;
        this.validDate = new Date(dataSort[0].dateChange);
        this.workTime = this.packWorkTimeFromDatabase(dataSort[0]);
        console.log(this.workTime);
      }
    });
  }

  updateUser() {
    this.service.updateUser(this.data).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: "Successfull!",
          text: "Successful update user!",
          timer: 3000,
          type: "success",
        });
        this.user.close();
        const configFieldCopy = JSON.parse(JSON.stringify(this.configField));
        this.configField = null;
        setTimeout(() => {
          this.configField = this.dynamicService.packValueForData(
            this.data,
            configFieldCopy
          );
        }, 100);
        this.isFormDirty = false;
      }
    });
  }

  modelData() {
    this.data.birthday = new Date(this.data.birthday);
    this.data.incompanysince = new Date(this.data.incompanysince);
    if (this.data.type === 1) {
      this.selectedValue = "Admin";
    } else if (this.data.type === 2) {
      this.selectedValue = "Manager";
    } else if (this.data.type === 6) {
      this.selectedValue = "Read only scheduler";
    } else {
      this.selectedValue = "Employee";
    }
    this.loading = false;
  }

  changeTab(value: string) {
    this.currentTab = value;
  }

  getTabConfiguration(value) {
    this.dynamicService.getConfiguration("user", value).subscribe((conf) => {
      console.log(conf);
      // this.configField = conf;
      this.configField = this.dynamicService.packValueForData(this.data, conf);
    });
  }

  convertNumericToDay(days) {
    for (let i = 0; i < days.length; i++) {
      const data = days[i];
      if (data.day === 1) {
        data.day = this.language.monday;
      } else if (data.day === 2) {
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
    if (day === this.language.monday.toLowerCase()) {
      day = 1;
    } else if (day === this.language.tuesday.toLowerCase()) {
      day = 2;
    } else if (day === this.language.wednesday.toLowerCase()) {
      day = 3;
    } else if (day === this.language.thursday.toLowerCase()) {
      day = 4;
    } else if (day === this.language.friday.toLowerCase()) {
      day = 5;
    }
    return day;
  }

  setWorkTimeForUser(workTime) {
    workTime = this.packWorkTime(workTime);
    this.service.setWorkTimeForUser(workTime).subscribe((data) => {
      console.log(data);
      if (data["success"]) {
        Swal.fire({
          title: "Successfull!",
          text: "Successful create new worktime!",
          timer: 3000,
          type: "success",
        });
        this.user.close();
        this.noSetWorkTime = false;
      }
    });
  }

  packWorkTime(workTime) {
    const time = {};
    for (let i = 0; i < workTime.length; i++) {
      const day = workTime[i].day;
      time[day.toString().toLowerCase()] =
        this.convertDayToNumeric(day.toString().toLowerCase()) +
        "-" +
        workTime[i].start +
        "-" +
        workTime[i].end +
        "-" +
        workTime[i].start2 +
        "-" +
        workTime[i].end2 +
        "-" +
        workTime[i].start3 +
        "-" +
        workTime[i].end3;
    }
    time["user_id"] = this.id;
    time["dateChange"] = this.validDate.toString();
    time["color"] = this.selectedColor;
    return time;
  }

  packWorkTimeFromDatabase(workTime) {
    const model = [
      {
        day: this.language.monday,
        start: workTime.monday.split("-")[1],
        end: workTime.monday.split("-")[2],
        start2: workTime.monday.split("-")[3],
        end2: workTime.monday.split("-")[4],
        start3: workTime.monday.split("-")[5],
        end3: workTime.monday.split("-")[6],
      },
      {
        day: this.language.tuesday,
        start: workTime.tuesday.split("-")[1],
        end: workTime.tuesday.split("-")[2],
        start2: workTime.tuesday.split("-")[3],
        end2: workTime.tuesday.split("-")[4],
        start3: workTime.tuesday.split("-")[5],
        end3: workTime.tuesday.split("-")[6],
      },
      {
        day: this.language.wednesday,
        start: workTime.wednesday.split("-")[1],
        end: workTime.wednesday.split("-")[2],
        start2: workTime.wednesday.split("-")[3],
        end2: workTime.wednesday.split("-")[4],
        start3: workTime.wednesday.split("-")[5],
        end3: workTime.wednesday.split("-")[6],
      },
      {
        day: this.language.thursday,
        start: workTime.thursday.split("-")[1],
        end: workTime.thursday.split("-")[2],
        start2: workTime.thursday.split("-")[3],
        end2: workTime.thursday.split("-")[4],
        start3: workTime.thursday.split("-")[5],
        end3: workTime.thursday.split("-")[6],
      },
      {
        day: this.language.friday,
        start: workTime.friday.split("-")[1],
        end: workTime.friday.split("-")[2],
        start2: workTime.friday.split("-")[3],
        end2: workTime.friday.split("-")[4],
        start3: workTime.friday.split("-")[5],
        end3: workTime.friday.split("-")[6],
      },
    ];
    return model;
  }

  backToGrid() {
    this.location.back();
  }

  receiveConfirm(event: boolean): void {
    if (event) {
      this.user.close();
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }

  confirmClose(): void {
    this.user.modalRoot.nativeElement.focus();
    if (this.isFormDirty) {
      this.showDialog = true;
    } else {
      this.user.close()
      this.showDialog = false;
      this.isFormDirty = false
    }
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  editOptions() {
    this.workTimeData();
    this.user.closeOnEscape = false;
    this.user.closeOnOutsideClick = false;
    this.user.hideCloseButton = true;
    this.user.open();
    this.changeTheme(this.theme);
  }

  convertTypeStringToInt(type) {
    if (type === "Admin") {
      type = 1;
    } else if (type === "Manager") {
      type = 2;
    } else if (type === "Read only scheduler") {
      type = 6;
    } else {
      type = 3;
    }
    return type;
  }

  convertIntToTypeString(type) {
    if (type === 1) {
      type = "Admin";
    } else if (type === 2) {
      type = "Manager";
    } else if (type === 6) {
      type = "Read only scheduler";
    } else {
      type = "Employee";
    }
    return type;
  }

  selectionUserType(event) {
    console.log(event);
    this.data.type = this.convertTypeStringToInt(event);
  }

  selectionChangeStore(event) {
    console.log(event);
    this.data.stateId = event;
  }

  newValidDate() {
    this.updateSetIndicator = 1;
    this.validDate = new Date();
  }

  previousWorkTime() {
    this.updateSetIndicator = 0;
    if (this.index < this.allWorkTime.length - 1) {
      this.index += 1;
    }

    if (this.index === this.allWorkTime.length - 1) {
      this.previousInd = "disabled-button";
    }

    this.nextInd = "";
    this.workTime = this.packWorkTimeFromDatabase(this.allWorkTime[this.index]);
    this.validDate = new Date(this.allWorkTime[this.index].dateChange);
  }
  onOptionSelected(selectedIndex : string){
   console.log("Selected index->", selectedIndex)
   this.index = Number(selectedIndex);
   this.previousInd = "";
    this.workTime = this.packWorkTimeFromDatabase(this.allWorkTime[selectedIndex]);
    this.validDate = new Date(this.allWorkTime[selectedIndex].dateChange);
  }
  nextWorkTime() {
    this.updateSetIndicator = 0;
    if (this.index > 0) {
      this.index -= 1;
    }

    if (this.index === 0) {
      this.nextInd = "disabled-button";
    }
    this.previousInd = "";
    this.workTime = this.packWorkTimeFromDatabase(this.allWorkTime[this.index]);
    this.validDate = new Date(this.allWorkTime[this.index].dateChange);
  }

  updateWorkTimeForUser(workTime) {
    const work = this.packWorkTime(workTime);
    work["id"] = this.allWorkTime[this.index].id;
    this.service.updateWorkTime(work).subscribe((data) => {
      console.log(data);
      if (data["success"]) {
        Swal.fire({
          title: "Successfull!",
          text: "Successful update worktime for user!",
          timer: 3000,
          type: "success",
        });
        this.user.close();
      }
    });
  }

  deleteWorkTime(answer) {
    if (answer === "yes") {
      const id = this.allWorkTime[this.index].id;
      this.service.deleteWorkTime(id).subscribe((data) => {
        if (data) {
          this.allWorkTime.splice(this.index, 1);
          if (this.allWorkTime.length === 0) {
            this.noSetWorkTime = true;
          }
        }
      });
    }
    this.modalDeletedWorkTimeConfirm = false;
  }

  createNewWorkTime() {
    this.updateSetIndicator = 1;
  }

  public close(component) {
    this[component + "Opened"] = false;
  }

  open(component, id) {
    this[component + "Opened"] = true;
  }

  updateImage() {
    this.chooseImage.open();
  }

  submitPhoto() {
    let form = new FormData();

    form.append("updateImageInput", this.updateImageInput);
    this.accountService.updateEmployeeProfileImage(form, this.data).subscribe(
      (data) => {
        this.helpService.successToastr(
          this.language.accountSuccessUpdatedAccountTitle,
          this.language.accountSuccessUpdatedAccountText
        );
      },
      (error) => {
        this.helpService.errorToastr(
          this.language.accountErrorUpdatedAccountTitle,
          this.language.accountErrorUpdatedAccountText
        );
      }
    );
    this.chooseImage.close();
    setTimeout(() => {
      this.getUser();
    }, 0);
  }

  fileChoosen(event: any) {
    this.fileName = event.target.value.substring(event.target.value.indexOf('h') + 2);
    if (event.target.value) {
      this.isFileChoosen = true;
      this.updateImageInput = <File>event.target.files[0];
    } else {
      this.isFileChoosen = false;
    }
  }

  action(event) {
    console.log(event);
    if (event === "yes") {
      this.service.deleteUser(this.id).subscribe((data) => {
        if (data) {
          Swal.fire({
            title: "Successfull!",
            text: "Successful delete user!",
            timer: 3000,
            type: "success",
          });
          this.location.back();
        }
      });
    } else {
      this.dialogOpened = false;
    }
  }

  getTranslate(title) {
    if (title === "profile") {
      return this.language.profile;
    } else if (title === "workTime") {
      return this.language.workTime;
    }
    return null;
  }

  changeTheme(theme: string) {
    setTimeout(() => {
      if (localStorage.getItem("allThemes") !== undefined) {
        const allThemes = JSON.parse(localStorage.getItem("allThemes"));
        console.log(allThemes);
        let items = document.querySelectorAll(".k-dialog-titlebar");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const themeName = allThemes[j]["name"];
            clas.remove("k-dialog-titlebar-" + themeName);
            clas.add("k-dialog-titlebar-" + theme);
          }
        }

        items = document.querySelectorAll(".k-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("gridHeader-" + element);

            clas.add("gridHeader-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-numbers");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-numbers-" + element);
            clas.add("k-pager-numbers-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-select");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-select-" + element);
            clas.add("k-select-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-grid-table");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-table-" + element);
            clas.add("k-grid-table-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-grid-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-header-" + element);
            clas.add("k-grid-header-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-wrap");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-wrap-" + element);
            clas.add("k-pager-wrap-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-button");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("inputTheme-" + element);
            clas.add("inputTheme-" + this.theme);
          }
        }
      }
    }, 50);
  }

  printUser() {
    window.print();
  }

  changeColorPalette(event) {
    this.selectedColor = event;
  }

  /*submitEmitter(event) {
    console.log(event);
    this.data.allowed_online = event.allowed_online;
    this.updateUser();
  }*/
}
