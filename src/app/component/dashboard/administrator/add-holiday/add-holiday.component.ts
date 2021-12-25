import { DashboardService } from 'src/app/service/dashboard.service';
import { HolidayService } from '../../../../service/holiday.service';
import { HolidayModel } from '../../../../models/holiday-model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MonthService, ScheduleComponent, EventSettingsModel, View, CellClickEventArgs, PopupOpenEventArgs, EventRenderedArgs } from '@syncfusion/ej2-angular-schedule';
import { Modal } from 'ngx-modal';
import { MessageService } from 'src/app/service/message.service';
import { ToastrService } from 'ngx-toastr';
import { HelpService } from 'src/app/service/help.service';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';

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

  public holidays: HolidayModel[] = [];
  public newHoliday;
  public templateList;

  private superAdminId: string;

  @ViewChild("addVacationModal") addVacationModal: Modal;
  @ViewChild("selectTemplateModal") selectTemplateModal: Modal;
  selectedTemplate = null;

  constructor(public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private dashboardService: DashboardService,
    private toastrService: ToastrService) { }


  ngOnInit() {
    this.initializationConfig();

    this.superAdminId = this.helpService.getSuperadmin();
    this.newHoliday = new HolidayModel(this.superAdminId);

    this.loadTemplates().then(() => {

      this.loadAllHolidays();

    });
  }

  public loadAllHolidays(): void {
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
              superAdminId: r.superAdminId
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

    this.holidayService.getHolidaysByTemplate(this.superAdminId, this.selectedTemplate.id).subscribe(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          this.holidays.push(
            <HolidayModel>{
              id: r.id,
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
              category: r.category,
              superAdminId: r.superAdminId
            }
          )
        });
        console.log(result);
      }
      this.eventSettings.dataSource = this.holidays;
      this.scheduleObj.refresh();

    });
  }

  public loadTemplates() {
    return this.dashboardService.getTemplateAccountPromise().then((data: []) => {

      this.templateList = data;
      console.log('templates:' + data);
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

    if (this.selectedTemplate == undefined) {
      this.selectedCell = args.element;
      this.displaySelectTemplateMessage();

    } else {

      this.selectedCell = args.element;
      this.endTimeDatePicker.min = args.startTime;

      const holiday = this.holidays.find(x => args.startTime >= x.StartTime && args.startTime <= x.EndTime);
      // must use startTime from args
      if (holiday) {
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
        console.log(insertedId);

        const relation = {
          holidayId: insertedId,
          templateId: this.selectedTemplate.id
        }

        console.log(relation);
        this.holidayService.createHolidayTemplateConnection(relation, (result) => {

          if (result) {
            this.toastrService.success(
              this.language.adminSuccessCreateTitle,
              this.language.adminSuccessCreateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );

            this.holidays.push(this.newHoliday);
            this.eventSettings.dataSource = this.holidays;

            this.closeAddVacationModal();
            this.scheduleObj.refresh();
          }
          else {
            this.displayErrorMessage();
          }
        });
      }
      else {
        this.displayErrorMessage();
      }
    });
  }

  private displayErrorMessage(): void {
    this.toastrService.error(
      this.language.adminErrorCreateTitle,
      this.language.adminErrorCreateText,
      { timeOut: 7000, positionClass: "toast-bottom-right" }
    );
  }

  public displaySelectTemplateMessage(): void {
    this.toastrService.warning(
      this.language.chooseTemplate,
      null,
      { timeOut: 7000, positionClass: "toast-bottom-right" }
    );

    this.selectedCell.classList.remove("e-selected-cell");
  }

  updateHoliday(): void {

    this.holidayService.updateHoliday(this.newHoliday, (val) => {
      console.log(val);
      if (val) {

        this.toastrService.success(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );

        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();
        this.scheduleObj.refresh();
      } else {

        this.toastrService.error(
          this.language.adminErrorCreateTitle,
          this.language.adminErrorCreateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }

  deleteHoliday(): void {

    this.holidayService.deleteHoliday(this.newHoliday.id, (val) => {
      if (val) {

        this.toastrService.success(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );

        //DELETE FROM ARRAY
        this.holidays = this.holidays.filter(h => h.id !== this.newHoliday.id);
        this.eventSettings.dataSource = this.holidays;

        this.closeAddVacationModal();
        this.scheduleObj.refresh();
      } else {

        this.toastrService.error(
          this.language.adminErrorCreateTitle,
          this.language.adminErrorCreateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }


  setMinEndTime(event): void {
    this.endTimeDatePicker.min = event;
  }

  onTemplateChange(event): void {
    console.log('valueChange', this.selectedTemplate);

    if (this.selectedTemplate) {
      this.loadHolidaysByTemplate();
    } else {
      this.loadAllHolidays();
    }

  }
}
