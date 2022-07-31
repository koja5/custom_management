import { StorageService } from './../../../../service/storage.service';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ScheduleComponent, EventSettingsModel, CellClickEventArgs } from '@syncfusion/ej2-angular-schedule';
import { UserType } from 'src/app/component/enum/user-type';
import { HolidayModel } from 'src/app/models/holiday-model';
import { DashboardService } from 'src/app/service/dashboard.service';
import { DynamicSchedulerService } from 'src/app/service/dynamic-scheduler.service';
import { HelpService } from 'src/app/service/help.service';
import { HolidayService } from 'src/app/service/holiday.service';
import { MessageService } from 'src/app/service/message.service';
import { UsersService } from 'src/app/service/users.service';
import { Modal } from 'ngx-modal';

@Component({
  selector: 'app-choose-holiday',
  templateUrl: './choose-holiday.component.html',
  styleUrls: ['./choose-holiday.component.scss']
})
export class ChooseHolidayComponent implements OnInit {
  @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent;
  @ViewChild("addVacationModal") addVacationModal: Modal;
  public newHoliday: HolidayModel;
  public addNewHoliday: boolean;
  public deleteModal = false;

  public eventSettings: EventSettingsModel = {
    dataSource: [],
    fields: {
      id: 'Id',
      subject: { name: 'Subject', title: 'Event Name' },
      startTime: { name: 'StartTime', title: 'Start Duration' },
      endTime: { name: 'EndTime', title: 'End Duration' },
    }
  };

  public language: any;
  public selectedCell: any;
  public userType = UserType;
  public holidays: HolidayModel[] = [];
  public templateList;
  public gridTemplateData: any;

  private storeId: number;

  public selectedTemplates = null;

  public user;
  height: string;
  id: number;

  constructor(
    public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private dashboardService: DashboardService,
    private usersService: UsersService,
    private storageService: StorageService,
    private dynamicService: DynamicSchedulerService) { }

  ngOnInit() {
    this.initializationConfig();
    this.id = this.helpService.getMe();
    this.storeId = this.storageService.getSelectedStore(this.id);
    this.newHoliday = new HolidayModel();

    this.usersService.getUserWithIdPromise(this.id).then(data => {
      console.log(data);
      this.user = data;
    });

    this.loadTemplates();

    this.height = this.dynamicService.getHolidayCalendarHeight();
  }


  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicService.getHolidayCalendarHeight();
  }

  public loadHolidaysByTemplate(): void {
    //reset
    this.holidays = [];

    const ids = this.selectedTemplates.map(elem => elem.id);

    this.holidayService.getHolidaysByTemplates(ids).then(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          // console.log('R: ', r);
          this.holidays.push(
            <HolidayModel>{
              id: r.id,
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
            }
          )
        });
      }
      this.scheduleObj.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refresh();
      this.scheduleObj.refreshEvents();
    });
  }

  public async loadTemplates() {
    const data = await this.dashboardService.getTemplateAccountPromise();
    this.templateList = data;
  }

  initializationConfig() {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
    } else {
      this.messageService.getLanguage().subscribe((mess) => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
          console.log(this.language);
        }, 10);
      });
    }

  }

  onCellClick(args: CellClickEventArgs): void {
    this.selectedCell = args.element;

    this.addNewHoliday = true;
    this.newHoliday = new HolidayModel();
    this.newHoliday.Subject = '';
    this.newHoliday.StartTime = args.startTime;
    this.newHoliday.EndTime = args.endTime;
    this.addVacationModal.open();
  }

  onRenderCell(event) {
    this.holidays.forEach(holiday => {
      if (event.elementType == "monthCells" && event.date >= holiday.StartTime.getTime() && event.date <= holiday.EndTime.getTime()) {
        event.element.style.backgroundColor = "#e9ecef";
      }
    });
  }

  onTemplateChange(): void {
    console.log('valueChange', this.selectedTemplates);
    this.scheduleObj.refresh();
    this.scheduleObj.refreshEvents();

    if (this.selectedTemplates && this.selectedTemplates.length > 0) {
      this.loadHolidaysByTemplate();
    } else {
      //reset
      this.holidays = [];
      this.eventSettings.dataSource = [];
      this.scheduleObj.eventSettings.dataSource = [];
      this.scheduleObj.refreshEvents();
      this.scheduleObj.refresh();
    }
  }

  addHolidaysForClinic(): void {
    const ids = this.selectedTemplates.map(elem => elem.id);
    this.holidayService.createStoreTemplateConnection(ids, this.storeId, (result) => {
      console.log(result);
    });
  }

  addClinicHoliday(): void {
    console.log('addClinicHoliday')
  }

  updateClinicHoliday(): void {
    console.log('updateClinicHoliday')
  }


  deleteClinicHoliday(): void {
    console.log('deleteClinicHoliday')
  }

  closeAddVacationModal(): void {
    this.addVacationModal.close();

    //to remove cell focus
    this.selectedCell.classList.remove("e-selected-cell");
  }

}
