import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../service/users.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Modal } from 'ngx-modal';
import { Location } from '@angular/common';
import { StoreService } from '../../../../service/store.service';
import { TaskService } from '../../../../service/task.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  @ViewChild('user') user: Modal;
  public id: string;
  public data: any;
  public imagePath: any;
  public userType = ['Employee', 'Manager', 'Admin'];
  public selectedValue: string;
  public currentTab = 'profile';
  public language: any;
  public workTime: any;
  public noSetWorkTime = false;
  public storeLocation: any;
  public selectedStore: any;
  public validDate: Date;
  public selectedColor = '#fe413b';
  public palette: any[] = [];
  public loading = true;
  public allWorkTime: any;
  public index = 0;
  public previousInd = '';
  public nextInd = 'disabled-button';
  public updateSetIndicator = 0;

  constructor(
    public route: ActivatedRoute,
    public service: UsersService,
    public sanitizer: DomSanitizer,
    public location: Location,
    public storeService: StoreService,
    public taskService: TaskService
  ) { }

  ngOnInit() {
    console.log(this.route.snapshot.params['id']);
    this.id = this.route.snapshot.params['id'];
    this.service.getUserWithId(this.id, val => {
      console.log(val);
      this.data = val[0];
      this.modelData();
      if (val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl(
          'data:image/png;base64,' + base64String
        );
        console.log(path);
        this.imagePath = path;
      } else {
        if (this.data.type === 1) {
          this.imagePath = '../../../../assets/images/users/admin-user.png';
        } else if (this.data.type === 2) {
          this.imagePath = '../../../../assets/images/users/manager-user.png';
        } else {
          this.imagePath = '../../../../../assets/images/users/defaultUser.png';
        }
        console.log(this.imagePath);
      }
    });

    this.language = JSON.parse(localStorage.getItem('language'))['user'];

    this.storeService.getStore(localStorage.getItem('idUser'), val => {
      this.storeLocation = val;
    });

    this.taskService.getTaskColor().subscribe(data => {
      for (let i = 0; i < data['length']; i++) {
        this.palette.push(data[i].color);
      }
    });

    this.workTimeData();
  }

  workTimeData() {
    this.workTime = null;
    this.service.getWorkTimeForUser(this.id).subscribe((data: []) => {
      if (data['length'] === 0) {
        this.noSetWorkTime = true;
        this.validDate = new Date();
        this.service.getWorkTime().subscribe(data => {
          this.workTime = this.convertNumericToDay(data);
        });
      } else {
        console.log(data);
        let dataSort = [];
        dataSort = data.sort((val1, val2) => {
          return (
            (new Date(val2['dateChange']) as any) -
            (new Date(val1['dateChange']) as any)
          );
        });
        console.log(dataSort[0]);
        this.allWorkTime = dataSort;
        this.validDate = new Date(dataSort[0].dateChange);
        this.workTime = this.packWorkTimeFromDatabase(dataSort[0]);
        console.log(this.workTime);
      }
    });
  }

  updateUser(user) {
    console.log(this.data);
    this.service.updateUser(this.data).subscribe(data => {
      if (data) {
        this.user.close();
      }
    });
  }

  modelData() {
    this.data.birthday = new Date(this.data.birthday);
    this.data.incompanysince = new Date(this.data.incompanysince);
    if (this.data.type === 1) {
      this.selectedValue = 'Admin';
    } else if (this.data.type === 2) {
      this.selectedValue = 'Manager';
    } else {
      this.selectedValue = 'Employee';
    }
    this.loading = false;
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
    this.service.setWorkTimeForUser(workTime).subscribe(data => {
      console.log(data);
      if (data['success']) {
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
        '-' +
        workTime[i].start +
        '-' +
        workTime[i].end +
        '-' +
        workTime[i].start2 +
        '-' +
        workTime[i].end2;
    }
    time['user_id'] = this.id;
    time['dateChange'] = this.validDate;
    time['color'] = this.selectedColor;
    return time;
  }

  packWorkTimeFromDatabase(workTime) {
    const model = [
      {
        day: this.language.monday,
        start: workTime.monday.split('-')[1],
        end: workTime.monday.split('-')[2],
        start2: workTime.monday.split('-')[3],
        end2: workTime.monday.split('-')[4]
      },
      {
        day: this.language.tuesday,
        start: workTime.tuesday.split('-')[1],
        end: workTime.tuesday.split('-')[2],
        start2: workTime.tuesday.split('-')[3],
        end2: workTime.tuesday.split('-')[4]
      },
      {
        day: this.language.wednesday,
        start: workTime.wednesday.split('-')[1],
        end: workTime.wednesday.split('-')[2],
        start2: workTime.wednesday.split('-')[3],
        end2: workTime.wednesday.split('-')[4]
      },
      {
        day: this.language.thursday,
        start: workTime.thursday.split('-')[1],
        end: workTime.thursday.split('-')[2],
        start2: workTime.thursday.split('-')[3],
        end2: workTime.thursday.split('-')[4]
      },
      {
        day: this.language.friday,
        start: workTime.friday.split('-')[1],
        end: workTime.friday.split('-')[2],
        start2: workTime.friday.split('-')[3],
        end2: workTime.friday.split('-')[4]
      }
    ];
    return model;
  }

  backToGrid() {
    this.location.back();
  }

  editOptions() {
    this.workTimeData();
    this.user.open();
  }

  convertTypeStringToInt(type) {
    if (type === 'Admin') {
      type = 1;
    } else if (type === 'Manager') {
      type = 2;
    } else {
      type = 3;
    }
    return type;
  }

  convertIntToTypeString(type) {
    if (type === 1) {
      type = 'Admin';
    } else if (type === 2) {
      type = 'Manager';
    } else {
      type = 'Employee';
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
    this.validDate = new Date();
  }

  previousWorkTime() {
    this.updateSetIndicator = 0;
    if (this.index < this.allWorkTime.length - 1) {
      this.index += 1;
    }

    if (this.index === this.allWorkTime.length - 1) {
      this.previousInd = 'disabled-button';
    }

    this.nextInd = '';
    this.workTime = this.packWorkTimeFromDatabase(this.allWorkTime[this.index]);
    this.validDate = new Date(this.allWorkTime[this.index].dateChange);
  }

  nextWorkTime() {
    this.updateSetIndicator = 0;
    if (this.index > 0) {
      this.index -= 1;
    }

    if (this.index === 0) {
      this.nextInd = 'disabled-button';
    }
    this.previousInd = '';
    this.workTime = this.packWorkTimeFromDatabase(this.allWorkTime[this.index]);
    this.validDate = new Date(this.allWorkTime[this.index].dateChange);
  }

  updateWorkTimeForUser(workTime) {

    const work = this.packWorkTime(workTime);
    work['id'] = this.allWorkTime[this.index].id;
    this.service.updateWorkTime(work).subscribe(
      data => {
        console.log(data);
        if (data['success']) {
          this.user.close();
        }
      }
    )
  }

  deleteWorkTime(workTime) {
    const id = this.allWorkTime[this.index].id;



  }

  createNewWorkTime() {
    this.updateSetIndicator = 1;
  }
}
