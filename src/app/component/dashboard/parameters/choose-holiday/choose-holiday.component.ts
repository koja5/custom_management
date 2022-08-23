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
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';

@Component({
  selector: 'app-choose-holiday',
  templateUrl: './choose-holiday.component.html',
  styleUrls: ['./choose-holiday.component.scss']
})
export class ChooseHolidayComponent implements OnInit {
  @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent;
  @ViewChild("addVacationModal") addVacationModal: Modal;

  @ViewChild('endTime')
  public endTimeDatePicker: DatePickerComponent;

  public newHoliday: HolidayModel;
  public addNewHoliday: boolean;
  public deleteModal = false;
  showDialog: boolean = false;
  isFormDirty: boolean = false;

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
  public templateHolidays: HolidayModel[] = [];
  public clinicHolidays: HolidayModel[] = [];
  public holidays: HolidayModel[] = [];
  public templateList;
  public gridTemplateData: any;

  private storeId: number;

  public selectedTemplates = null;

  public user;
  height: string;
  id: number;
  private overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };
  public storeTemplates: number[] = [];
  holidayList: HolidayModel[];

  constructor(
    public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private dashboardService: DashboardService,
    private usersService: UsersService,
    private toastrService: ToastrService,
    private storageService: StorageService,
    private dynamicService: DynamicSchedulerService) { }

  ngOnInit() {
    this.initializationConfig();
    this.id = this.helpService.getMe();
    this.storeId = this.storageService.getSelectedStore(this.id);
    this.newHoliday = new HolidayModel();

    this.usersService.getUserWithIdPromise(this.id).then(data => {
      this.user = data;
    });

    this.loadTemplates();
    this.loadHolidaysForClinic();

    this.height = this.dynamicService.getDefineHolidayHeight();
  }

  receiveConfirm(event: boolean): void {
    if(event) {
      this.addVacationModal.close();
      this.isFormDirty = false;
    }
      this.showDialog = false;
  }

  confirmClose(): void {
    this.addVacationModal.modalRoot.nativeElement.focus();
    if(this.isFormDirty) {
      this.showDialog = true;
    }else {
      this.addVacationModal.close()
      this.showDialog = false;
      this.isFormDirty = false
    }
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicService.getDefineHolidayHeight();
  }

  public loadHolidaysForClinic(): void {
    this.holidays = [];
    this.holidayService.getHolidaysForClinic(this.storeId).then(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          // console.log('R: ', r);
          const holidayModel = <HolidayModel>{
            id: r.id,
            Subject: r.Subject,
            StartTime: new Date(r.StartTime),
            EndTime: new Date(r.EndTime),
          };

          this.clinicHolidays.push(holidayModel);
          this.holidays.push(holidayModel);
        });
      }
    });

    // load holidays defined by clinic and holidays defined by selected clinic template (if there is some)

    this.holidayService.getStoreTemplateConnection(this.storeId).then((ids) => {
      this.storeTemplates = ids.map(elem => elem.templateId);
      this.selectedTemplates = this.templateList ? this.templateList.filter(x => this.storeTemplates.includes(x.id)) : [];

      if (ids.length) {
        this.holidayService.getHolidaysByTemplates(this.storeTemplates).then((result) => {
          if (result && result.length > 0) {
            result.forEach((r) => {
              const holidayModel = <HolidayModel>{
                id: r.id,
                Subject: r.Subject,
                StartTime: new Date(r.StartTime),
                EndTime: new Date(r.EndTime),
              };

              this.templateHolidays.push(holidayModel);
              this.holidays.push(holidayModel);
            });

            this.scheduleObj.eventSettings.dataSource = this.holidays;
            this.scheduleObj.refreshEvents();
          } else {
            console.log("no holidayss");
          }
        });
      }
    });
  }

  get isSaveDisabled(): boolean {
    if (!this.storeTemplates || !this.selectedTemplates) {
      return false;
    }
    return this.areEqual(this.storeTemplates, this.selectedTemplates.map(elem => elem.id));
  }

  public areEqual(array1, array2) {
    if (array1.length === array2.length) {
      return array1.every(element => {
        if (array2.includes(element)) {
          return true;
        }
        return false;
      });
    }
    return false;
  }

  public loadHolidaysByTemplate(): void {
    //reset
    this.templateHolidays = [];

    const ids = this.selectedTemplates.map(elem => elem.id);
    const newIds = ids.filter(x => !this.storeTemplates.includes(x));

    console.log('newIds', newIds);

    if (!newIds.length) {
      this.holidays = [];
      this.holidays.concat(this.clinicHolidays);

      this.scheduleObj.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refreshEvents();
      return;
    }

    this.holidayService.getHolidaysByTemplates(newIds).then(result => {
      console.log(result);
      if (result && result.length > 0) {

        this.holidayList = result;

        result.forEach(r => {
          // console.log('R: ', r);
          this.templateHolidays.push(
            <HolidayModel>{
              id: r.id,
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
            }
          )
        });
      }
      this.holidays = [].concat(this.templateHolidays);
      this.holidays.concat(this.clinicHolidays);

      this.scheduleObj.eventSettings.dataSource = this.holidays;
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
    const holiday = this.clinicHolidays.find(x => args.startTime >= x.StartTime && args.startTime <= x.EndTime);

    // must use startTime from args
    if (holiday) {
      this.newHoliday = holiday;
      this.addNewHoliday = false;
    } else {
      this.addNewHoliday = true;
      this.newHoliday = new HolidayModel();
      this.newHoliday.Subject = '';
      this.newHoliday.StartTime = args.startTime;
      this.newHoliday.EndTime = args.endTime;
    }
    this.addVacationModal.hideCloseButton = true;
    this.addVacationModal.open();
  }

  onRenderCell(event) {
    this.holidays.forEach(holiday => {
      debugger
      if (event.elementType == "monthCells" && event.date >= holiday.StartTime.getTime() && event.date <= holiday.EndTime.getTime()) {
        event.element.style.backgroundColor = "#e9ecef";
      }
    });
  }

  onTemplateChange(): void {
    this.scheduleObj.refreshEvents();

    if (this.selectedTemplates && this.selectedTemplates.length > 0) {
      this.loadHolidaysByTemplate();
    } else {
      //reset
      this.templateHolidays = [];
      this.eventSettings.dataSource = [];
      this.scheduleObj.eventSettings.dataSource = [];
      this.scheduleObj.refresh();
      this.scheduleObj.refreshEvents();
    }
  }

  // connect clinic with holiday template
  // if those templates are already connected save button is disabled
  // ako selectedTemplates sadrzi idjeve koji nisu u storeTemplates to su novi idjevi, njih dodajemo
  // ako selectedTemplates ne sadrzi neki ili sve idjeve koji su u storeTemplates njih brisemo
  addHolidaysForClinic(): void {
    const ids = this.selectedTemplates.map(elem => elem.id);
    const idsForAdding = ids.filter(x => !this.storeTemplates.includes(x));

    if (idsForAdding.length) {
      this.holidayService.createStoreTemplateConnection(idsForAdding, this.storeId, (result) => {
        console.log(result);
        if (result) {
          this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);
        } else {
          this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
        }
      });

    }

    // for removing
    const idsForRemoving = this.storeTemplates.filter(x => !ids.includes(x));
    if (idsForRemoving.length) {
      this.holidayService.deleteStoreTemplateConnection(idsForRemoving, this.storeId, (result) => {
        console.log(result);
        if (result) {
          this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);
        } else {
          this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
        }
      });
    }
  }

  addClinicHoliday(): void {
    this.newHoliday.clinicId = this.storeId;

    console.log('NEW HOLIDAY ', this.newHoliday);

    this.holidayService.createHoliday(this.newHoliday, (insertedId) => {
      if (insertedId) {

        this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

        this.clinicHolidays.push(this.newHoliday);
        this.holidays.push(this.newHoliday);

        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();
        this.scheduleObj.refresh();
        this.scheduleObj.refreshEvents();

      }
      else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateClinicHoliday(): void {
    this.holidayService.updateHoliday(this.newHoliday, (val) => {
      if (val) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();
        this.scheduleObj.refresh();
        this.scheduleObj.refreshEvents();
      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteClinicHoliday(): void {
    this.holidayService.deleteHoliday(this.newHoliday.id, (val) => {
      if (val) {

        this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);

        //DELETE FROM ARRAY
        this.templateHolidays = this.templateHolidays.filter(h => h.id !== this.newHoliday.id);
        this.holidays = this.holidays.filter(h => h.id !== this.newHoliday.id);


        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();

        this.scheduleObj.refreshEvents();
      } else {
        this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
      }
    });
  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, this.overrideMessage);
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }

  closeAddVacationModal(): void {
    this.addVacationModal.close();

    //to remove cell focus
    this.selectedCell.classList.remove("e-selected-cell");
  }


  get holidayModalTitle(): string {
    return this.addNewHoliday ? this.language.addHoliday : this.language.editHoliday;
  }

  setMinEndTime(event): void {
    this.endTimeDatePicker.min = event;
  }

}
