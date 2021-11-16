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

  public currentView: View = 'Month';
  public language: any;

  public holidays: HolidayModel[] = [];
  public newHoliday;


  private superAdminId: string;

  @ViewChild("addVacationModal") addVacationModal: Modal;

  constructor(public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private toastrService: ToastrService) { }


  ngOnInit() {
    this.initializationConfig();

    this.superAdminId = this.helpService.getSuperadmin();
    this.newHoliday = new HolidayModel(this.superAdminId);

    this.loadHolidays();
  }

  public loadHolidays(): void {
    this.holidayService.getHolidays(this.superAdminId).subscribe(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(r => {
          this.holidays.push(
            <HolidayModel>{
              Subject: r.Subject,
              StartTime: new Date(r.StartTime),
              EndTime: new Date(r.EndTime),
              category: r.category,
              superAdminId: r.superAdminId
            }
          )
        });
        console.log(result);

        this.eventSettings.dataSource = this.holidays;
        this.scheduleObj.refresh();
      }
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
      if (event.date >= holiday.StartTime.getTime() && event.date <= holiday.EndTime.getTime()) {
        event.element.style.backgroundColor = "#e9ecef";
      }
    });
  }

  onEventRendered(args: EventRenderedArgs): void {
    let data: { [key: string]: Object } = args.data;
    args.element.setAttribute("aria-readonly", "true");
    args.element.classList.add("e-read-only");
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type === 'Editor' || args.type === 'QuickInfo') {
      args.cancel = true;
    }
  }

  onCellClick(args: CellClickEventArgs): void {

    // must use startTime from args
    if (this.holidays.some(x => args.startTime >= x.StartTime && args.startTime <= x.EndTime)) {
      return;
    }

    this.endTimeDatePicker.min = args.startTime;

    this.addVacationModal.open();

    this.newHoliday = new HolidayModel(this.superAdminId);
    this.newHoliday.Subject = '';
    this.newHoliday.StartTime = args.startTime;
    this.newHoliday.EndTime = args.endTime;
  }

  closeAddVacationModal(): void {
    this.addVacationModal.close();
  }

  addHoliday(): void {

    this.holidayService.createHoliday(this.newHoliday, (val) => {
      console.log(val);
      if (val) {

        this.toastrService.success(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );

        this.holidays.push(this.newHoliday);
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

}
