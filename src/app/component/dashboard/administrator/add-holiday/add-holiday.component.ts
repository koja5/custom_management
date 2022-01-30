import { UsersService } from './../../../../service/users.service';
import { DashboardService } from 'src/app/service/dashboard.service';
import { HolidayService } from '../../../../service/holiday.service';
import { HolidayModel } from '../../../../models/holiday-model';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MonthService, ScheduleComponent, EventSettingsModel, View, CellClickEventArgs, PopupOpenEventArgs, EventRenderedArgs } from '@syncfusion/ej2-angular-schedule';
import { Modal } from 'ngx-modal';
import { MessageService } from 'src/app/service/message.service';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { HelpService } from 'src/app/service/help.service';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';
import { UserType } from 'src/app/component/enum/user-type';
import { GroupDescriptor, SortDescriptor, State, process } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { Template } from 'src/app/models/template-model';
import { DynamicSchedulerService } from 'src/app/service/dynamic-scheduler.service';


@Component({
  selector: 'app-add-holiday',
  providers: [MonthService],
  templateUrl: './add-holiday.component.html',
  styleUrls: ['./add-holiday.component.scss']
})
export class AddHolidayComponent implements OnInit {
  @ViewChild('scheduleObj')
  public scheduleObj: ScheduleComponent;
  public eventSettings: EventSettingsModel = {
    dataSource: [],
    fields: {
      id: 'Id',
      subject: { name: 'Subject', title: 'Event Name' },
      startTime: { name: 'StartTime', title: 'Start Duration' },
      endTime: { name: 'EndTime', title: 'End Duration' }
    }
  };

  @ViewChild('endTime')
  public endTimeDatePicker: DatePickerComponent;

  public language: any;
  public selectedCell: any;
  public addNewHoliday: boolean;
  public deleteModal = false;
  public userType = UserType;
  public type: number;
  public holidays: HolidayModel[] = [];
  public newHoliday: HolidayModel;
  public templateList;
  public isOwner: boolean;
  public currentTab = "holidays";
  public operationMode = 'add';

  public gridTemplateData: any;
  public pageSize = 5;

  public pageable = {
    pageSizes: true,
    previousNext: true
  };
  public state: State = {
    skip: 0,
    take: 5,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc"
      }
    ]
  };
  private superAdminId: string;

  @ViewChild("addVacationModal") addVacationModal: Modal;
  @ViewChild("selectTemplateModal") selectTemplateModal: Modal;
  @ViewChild("templateModal") templateModal: Modal;
  selectedTemplate = null;
  overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };
  public data = new Template();

  public user;
  deleteTemplateId: any;
  height: string;

  constructor(public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private dashboardService: DashboardService,
    private usersService: UsersService,
    private dynamicService: DynamicSchedulerService,
    private toastrService: ToastrService) { }

  ngOnInit() {
    this.initializationConfig();
    this.type = Number(this.helpService.getLocalStorage("type"));
    this.superAdminId = this.helpService.getSuperadmin();
    this.newHoliday = new HolidayModel(this.superAdminId);
    this.isOwner = this.helpService.getType() === UserType.owner;

    this.loadTemplates();

    this.usersService.getUserWithIdPromise(this.helpService.getMe()).then(data => {
      console.log(data);
      this.user = data;
    });

    this.height = this.dynamicService.getHolidayCalendarHeight();
  }


  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicService.getHolidayCalendarHeight();
  }


  public loadHolidaysForUser(): void {
    //reset
    this.holidays = [];

    this.holidayService.getHolidays(this.superAdminId).subscribe(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          console.log('HOLIDAY', r);
          this.holidays.push(
            <HolidayModel>{
              id: r.id,
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
              category: r.category,
              userId: r.userId
            }
          )
        });
        console.log(result);
      }
      this.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refresh();

    });
  }

  public loadHolidaysByTemplate(): void {
    //reset
    this.holidays = [];

    this.holidayService.getHolidaysByTemplate(this.superAdminId, this.selectedTemplate.id).then(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          console.log('R: ', r);
          this.holidays.push(
            <HolidayModel>{
              id: r.id,
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
              category: r.category,
              userId: r.userId
            }
          )
        });
        console.log(result);
      }
      this.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refresh();

    });
  }

  addNewModal() {
    this.templateModal.open();
    this.data = new Template();
    this.data.account_id = this.helpService.getMe();
    this.data.language = "";
    this.data.description = "";
    this.data.email = this.user.email ? this.user.email : '';
    this.operationMode = 'add';
  }

  openEditTemplateModal(event): void {
    this.data = event;
    this.operationMode = 'edit';
    this.templateModal.open();
  }

  createTemplate(): void {
    this.dashboardService.createTemplate(this.data).then(insertedId => {
      if (insertedId) {
        const relation = {
          userId: this.helpService.getMe(),
          templateId: insertedId
        }

        this.dashboardService.createUserTemplateRelation(relation).then(result => {
          if (result) {
            this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);
            this.loadTemplates();

            this.closeTemplateModal();
          } else {
            this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
          }
        });
      } else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateTemplate(): void {
    console.log('updateTemplate');

    this.dashboardService.updateTemplate(this.data).then(result => {
      console.log(result);
      this.closeTemplateModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteTemplate(event): void {
    this.deleteModal = true;
    this.deleteTemplateId = event;
  }

  action(event) {

    if (event === "yes") {
      const data = this.templateList.find(elem => elem.id === this.deleteTemplateId);

      this.dashboardService.deleteHolidayTemplateByTemplateId(data).then(result => {
        this.dashboardService.deleteUserTemplate(data).then(result => {
          this.dashboardService.deleteTemplate(data).then(result => {

            if (result) {
              this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);
              this.loadTemplates();
            } else {
              this.displaySuccessMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);

            }

            this.deleteModal = false;
          });
        });
      });
    } else {
      this.deleteModal = false;
      this.deleteTemplateId = null;
    }
  }


  closeTemplateModal(): void {
    this.templateModal.close();
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.gridTemplateData = process(this.templateList, this.state);
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridTemplateData = process(this.templateList, this.state);
  }


  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.gridTemplateData = process(this.templateList, this.state);
  }


  public loadTemplates() {
    return this.dashboardService.getTemplateAccountByUserId(this.superAdminId).then((data: []) => {

      this.templateList = data;
      console.log('templates:', data);

      this.gridTemplateData = process(this.templateList, this.state);

    });
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

  changeTab(value: string) {
    this.currentTab = value;
  }

  onRenderCell(event) {
    this.holidays.forEach(holiday => {
      if (event.elementType == "monthCells" && event.date >= holiday.StartTime.getTime() && event.date <= holiday.EndTime.getTime()) {
        event.element.style.backgroundColor = "#e9ecef";

        let eventTitle = document.createElement('div');
        eventTitle.innerHTML = holiday.Subject;
        console.log(holiday.Subject);
        eventTitle.classList.add("h4");
        eventTitle.classList.add("bold");
        eventTitle.classList.add("mt-4");
        eventTitle.classList.add("mb-0");
        eventTitle.style.overflow = 'hidden';
        eventTitle.style.whiteSpace = 'nowrap';
        eventTitle.style.textOverflow = 'ellipsis';

        (event.element).appendChild(eventTitle);
      }
    });
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type === 'Editor' || args.type === 'QuickInfo') {
      args.cancel = true;
    }
  }

  onCellClick(args: CellClickEventArgs): void {

    console.log(args);
    if (this.selectedTemplate == undefined) {
      this.selectedCell = args.element;
      this.displaySelectTemplateMessage();

    } else {

      this.selectedCell = args.element;
      this.endTimeDatePicker.min = args.startTime;

      const holiday = this.holidays.find(x => args.startTime >= x.StartTime && args.startTime <= x.EndTime);
      // must use startTime from args
      if (holiday) {
        console.log('holiday ', holiday);
        this.newHoliday = holiday;


        this.addNewHoliday = false;
      } else {
        this.addNewHoliday = true;
        this.newHoliday = new HolidayModel(this.superAdminId);
        this.newHoliday.Subject = '';
        this.newHoliday.StartTime = args.startTime;
        this.newHoliday.EndTime = args.endTime;
      }
      this.addVacationModal.open();

    }

  }

  closeAddVacationModal(): void {
    this.addVacationModal.close();

    //to remove cell focus
    this.selectedCell.classList.remove("e-selected-cell");
  }

  addHoliday(): void {

    this.holidayService.createHoliday(this.newHoliday, (insertedId) => {
      console.log(insertedId);

      if (insertedId) {

        this.newHoliday.id = insertedId;

        if (this.isOwner) {
          const relation = {
            holidayId: insertedId,
            templateId: this.selectedTemplate.id
          }

          console.log(relation);
          this.holidayService.createHolidayTemplateConnection(relation, (result) => {

            if (result) {
              this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

              this.holidays.push(this.newHoliday);
              this.eventSettings.dataSource = this.holidays;

              this.closeAddVacationModal();
              this.scheduleObj.refresh();
            }
            else {
              this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
            }
          });
        } else {
          this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

          this.holidays.push(this.newHoliday);
          this.eventSettings.dataSource = this.holidays;

          this.closeAddVacationModal();
          this.scheduleObj.refresh();
        }
      }
      else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });

  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, { timeOut: 7000, positionClass: "toast-bottom-right" });
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }

  public displaySelectTemplateMessage(): void {
    this.toastrService.warning(this.language.chooseTemplate, null, this.overrideMessage);
    this.selectedCell.classList.remove("e-selected-cell");
  }

  updateHoliday(): void {

    this.holidayService.updateHoliday(this.newHoliday, (val) => {
      console.log(val);
      if (val) {

        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);

        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();
        this.scheduleObj.refresh();
      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteHoliday(): void {
    if (this.isOwner) {
      this.holidayService.deleteHolidayTemplate(this.newHoliday.id).then(() => {
        this.holidayService.deleteHoliday(this.newHoliday.id, (val) => {
          if (val) {

            this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);

            //DELETE FROM ARRAY
            this.holidays = this.holidays.filter(h => h.id !== this.newHoliday.id);
            this.eventSettings.dataSource = this.holidays;

            this.closeAddVacationModal();
            this.scheduleObj.refresh();
          } else {
            this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
          }
        });
      });
    }
    else {
      this.holidayService.deleteHoliday(this.newHoliday.id, (val) => {
        if (val) {
          this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

          //DELETE FROM ARRAY
          this.holidays = this.holidays.filter(h => h.id !== this.newHoliday.id);
          this.eventSettings.dataSource = this.holidays;

          this.closeAddVacationModal();
          this.scheduleObj.refresh();
        } else {
          this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
        }
      });
    }
  }

  setMinEndTime(event): void {
    this.endTimeDatePicker.min = event;
  }

  onTemplateChange(): void {
    console.log('valueChange', this.selectedTemplate);

    if (this.selectedTemplate) {
      if (this.isOwner) {
        this.loadHolidaysByTemplate();
      } else {
        this.loadHolidaysForUser();
      }
    } else {
      //reset
      this.holidays = [];
      this.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refresh();
    }
  }
}
