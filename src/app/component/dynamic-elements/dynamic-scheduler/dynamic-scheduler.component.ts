import { EventCategoryService } from "./../../../service/event-category.service";
import { UsersService } from "./../../../service/users.service";
import { StoreService } from "./../../../service/store.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {
  Component,
  ViewEncapsulation,
  ViewChild,
  OnInit,
  NgZone,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { ItemModel as ItemModelSplit } from "@syncfusion/ej2-angular-splitbuttons";
import {
  SelectedEventArgs,
  TextBoxComponent,
} from "@syncfusion/ej2-angular-inputs";
import {
  ScheduleComponent,
  GroupModel,
  DayService,
  WeekService,
  WorkWeekService,
  MonthService,
  YearService,
  AgendaService,
  TimelineViewsService,
  TimelineMonthService,
  TimelineYearService,
  View,
  EventSettingsModel,
  Timezone,
  CurrentAction,
  CellClickEventArgs,
  ResourcesModel,
  EJ2Instance,
  ResizeService,
  DragAndDropService,
  EventRenderedArgs,
  ExcelExportService,
  ExportOptions,
  PrintService,
  ActionEventArgs,
  PopupOpenEventArgs,
} from "@syncfusion/ej2-angular-schedule";
import {
  addClass,
  extend,
  removeClass,
  closest,
  remove,
  isNullOrUndefined,
  Internationalization,
} from "@syncfusion/ej2-base";
import { ChangeEventArgs as SwitchEventArgs } from "@syncfusion/ej2-angular-buttons";
import {
  ChangeEventArgs,
  MultiSelectChangeEventArgs,
  DropDownListComponent,
} from "@syncfusion/ej2-angular-dropdowns";
import { DataManager, Predicate, Query } from "@syncfusion/ej2-data";
import {
  ClickEventArgs,
  ContextMenuComponent,
  MenuItemModel,
  BeforeOpenCloseMenuEventArgs,
  MenuEventArgs,
} from "@syncfusion/ej2-angular-navigations";
import { ChangeEventArgs as TimeEventArgs } from "@syncfusion/ej2-calendars";
import { TaskService } from "../../../service/task.service";
import { CustomersService } from "../../../service/customers.service";
import { MessageService } from "../../../service/message.service";
import { MongoService } from "../../../service/mongo.service";
import { ToastrService } from "ngx-toastr";
import { DynamicSchedulerService } from "src/app/service/dynamic-scheduler.service";
import { ComplaintTherapyModel } from "src/app/models/complaint-therapy-model";
import { UserModel } from "src/app/models/user-model";
import { CustomerModel } from "src/app/models/customer-model";
import { CustomersComponent } from "../../dashboard/customers/customers.component";
import {
  SchedulerComponent,
  SchedulerEvent,
} from "@progress/kendo-angular-scheduler";
import { FormGroup } from "@angular/forms";
import { Modal } from "ngx-modal";
import { EventModel } from "src/app/models/event.model";
import { HelpService } from "src/app/service/help.service";
import { StorageService } from "src/app/service/storage.service";
import { loadCldr, L10n } from "@syncfusion/ej2-base";
import * as numberingSystems from "../../../../../node_modules/cldr-data/supplemental/numberingSystems.json";
import * as gregorian from "../../../../../node_modules/cldr-data/main/fr-CH/ca-gregorian.json";
import * as numbers from "../../../../../node_modules/cldr-data/main/fr-CH/numbers.json";
import * as timeZoneNames from "../../../../../node_modules/cldr-data/main/fr-CH/timeZoneNames.json";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { UserType } from "../../enum/user-type";
import { AccountService } from "src/app/service/account.service";
import {
  ComboBoxModule,
  MultiSelectComponent,
} from "@progress/kendo-angular-dropdowns";
import { TypeOfEventAction } from "../../enum/typeOfEventAction";
import { ActivatedRoute, Router, UrlSerializer } from "@angular/router";
import { HolidayService } from "src/app/service/holiday.service";
import { PDFService } from "src/app/service/pdf.service";
import { ParameterItemService } from "src/app/service/parameter-item.service";
import { DateService } from "src/app/service/date.service";
import { InvoiceService } from "src/app/service/invoice.service";
import {
  checkIfInputValid,
  checkIfInputValueValid,
} from "../../../shared/utils";
import {
  SCHEDULER_TRANSLATIONS,
  TIMESLOT_DURATION,
  TIMEZONE_DATA,
  WEEK_DAYS,
} from "./dynamic-scheduler-data";
import { Subject, Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { DynamicService } from "src/app/service/dynamic.service";
import * as CryptoJS from "crypto-js";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
declare var moment: any;

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames);
L10n.load(SCHEDULER_TRANSLATIONS);

@Component({
  selector: "app-dynamic-scheduler",
  templateUrl: "./dynamic-scheduler.component.html",
  styleUrls: ["./dynamic-scheduler.component.scss"],
  providers: [
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    YearService,
    AgendaService,
    TimelineViewsService,
    TimelineMonthService,
    TimelineYearService,
    ResizeService,
    DragAndDropService,
    ExcelExportService,
    PrintService,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicSchedulerComponent implements OnInit, OnDestroy {
  @ViewChild("scheduleObj") scheduleObj: ScheduleComponent;
  @ViewChild("eventTypeObj") eventTypeObj: DropDownListComponent;
  @ViewChild("titleObj") titleObj: TextBoxComponent;
  @ViewChild("notesObj") notesObj: TextBoxComponent;
  public showFileList: Boolean = false;
  public multiple: Boolean = false;
  public buttons: Object = { browse: "Import" };
  public intl: Internationalization = new Internationalization();
  public currentView: View = "Week";
  public liveTimeUpdate: String = new Date().toLocaleTimeString("en-US", {
    timeZone: "UTC",
  });
  public group: GroupModel = {
    resources: ["sharedCalendar"],
  };
  public resourceDataSource: Object[] = [
    { CalendarText: "My Calendar", CalendarId: 1, CalendarColor: "#c43081" },
    { CalendarText: "Company", CalendarId: 2, CalendarColor: "#ff7f50" },
    { CalendarText: "Birthday", CalendarId: 3, CalendarColor: "#AF27CD" },
    { CalendarText: "Holiday", CalendarId: 4, CalendarColor: "#808000" },
  ];
  public resourceQuery: Query = new Query().where("CalendarId", "equal", 1);
  public allowMultiple: Boolean = true;
  public isTimelineView: Boolean = false;
  public exportItems: ItemModelSplit[] = [
    { text: "iCalendar", iconCss: "e-icons e-schedule-ical-export" },
    { text: "Excel", iconCss: "e-icons e-schedule-excel-export" },
  ];
  public checkboxMode: String = "CheckBox";
  public firstDayOfWeek: Number = 0;
  public workDays: Number[] = [1, 2, 3, 4, 5];
  public calendarsValue: Number[] = [1];
  public fields: Object = { text: "text", value: "value" };
  public calendarFields: Object = { text: "CalendarText", value: "CalendarId" };
  public dayStartHourValue: Date = new Date(new Date().setHours(0, 0, 0));
  public dayEndHourValue: Date = new Date(new Date().setHours(23, 59, 59));
  public workStartHourValue: Date = new Date(new Date().setHours(9, 0, 0));
  public workEndHourValue: Date = new Date(new Date().setHours(18, 0, 0));
  public weekDays: Object[] = WEEK_DAYS;
  public timezoneData: Object[] = TIMEZONE_DATA;
  public timeSlotDuration: Object[] = TIMESLOT_DURATION;
  public lastMinuteTimeSlot: Object[] = [
    { Value: "00.00h" },
    { Value: "00.30h" },
    { Value: "01.00h" },
    { Value: "01.30h" },
    { Value: "02.00h" },
    { Value: "02.30h" },
    { Value: "03.00h" },
    { Value: "03.30h" },
    { Value: "04.00h" },
    { Value: "04.30h" },
    { Value: "05.00h" },
    { Value: "05.30h" },
    { Value: "06.00h" },
    { Value: "06.30h" },
    { Value: "07.00h" },
    { Value: "07.30h" },
    { Value: "08.00h" },
    { Value: "08.30h" },
    { Value: "09.00h" },
    { Value: "09.30h" },
    { Value: "10.00h" },
    { Value: "10.30h" },
    { Value: "11.00h" },
    { Value: "11.30h" },
    { Value: "12.00h" },
    { Value: "12.30h" },
    { Value: "13.00h" },
    { Value: "13.30h" },
    { Value: "14.00h" },
    { Value: "14.30h" },
    { Value: "15.00h" },
    { Value: "15.30h" },
    { Value: "16.00h" },
    { Value: "16.30h" },
    { Value: "17.00h" },
    { Value: "17.30h" },
    { Value: "18.00h" },
    { Value: "18.30h" },
    { Value: "19.00h" },
    { Value: "19.30h" },
    { Value: "20.00h" },
    { Value: "20.30h" },
    { Value: "21.00h" },
    { Value: "21.30h" },
    { Value: "22.00h" },
    { Value: "22.30h" },
    { Value: "23.00h" },
    { Value: "23.30h" },
  ];
  public timeSlotFields = { text: "Name", value: "Value" };
  public timeSlotCount: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public timeSlotDurationValue: Number = 60;
  public timeSlotCountValue: Number = 1;
  public eventSettings: EventSettingsModel = {
    dataSource: [
      /*{
      'colorTask': 13,
      "StartTime": new Date("2021-01-20T11:30:00.000Z"),
      "EndTime": new Date("2021-01-20T12:30:00.000Z"),
      "Subject": "Doe Test+Kopfschmerzen;"
    }*/
    ],
  };
  @ViewChild("menuObj")
  public menuObj: ContextMenuComponent;
  public selectedTarget: Element;
  public menuItems: MenuItemModel[] = [
    { text: "New Event", iconCss: "e-icons new", id: "Add" },
    {
      text: "New Recurring Event",
      iconCss: "e-icons recurrence",
      id: "AddRecurrence",
    },
    { text: "Today", iconCss: "e-icons today", id: "Today" },
    { text: "Edit Event", iconCss: "e-icons edit", id: "Save" },
    {
      text: "Edit Event",
      id: "EditRecurrenceEvent",
      iconCss: "e-icons edit",
      items: [
        { text: "Edit Occurrence", id: "EditOccurrence" },
        { text: "Edit Series", id: "EditSeries" },
      ],
    },
    { text: "Delete Event", iconCss: "e-icons delete", id: "Delete" },
    {
      text: "Delete Event",
      id: "DeleteRecurrenceEvent",
      iconCss: "e-icons delete",
      items: [
        { text: "Delete Occurrence", id: "DeleteOccurrence" },
        { text: "Delete Series", id: "DeleteSeries" },
      ],
    },
  ];
  public holidays = [];
  expandPdf: boolean;
  expandPdfIcon = "k-icon k-i-arrow-60-right";
  eventChange = false;
  adminUser: any;
  public template: any;
  superadminProfile: any;
  isDateSet: boolean = false;
  invoiceID: any;
  changedInvoiceID: any;
  checkIfInputValid = checkIfInputValid;
  checkIfInputValueValid = checkIfInputValueValid;

  range: any;

  public generateEvents(): Object[] {
    const eventData: Object[] = [];
    const eventSubjects: string[] = [
      "Bering Sea Gold",
      "Technology",
      "Maintenance",
      "Meeting",
      "Travelling",
      "Annual Conference",
      "Birthday Celebration",
      "Farewell Celebration",
      "Wedding Aniversary",
      "Alaska: The Last Frontier",
      "Deadest Catch",
      "Sports Day",
      "MoonShiners",
      "Close Encounters",
      "HighWay Thru Hell",
      "Daily Planet",
      "Cash Cab",
      "Basketball Practice",
      "Rugby Match",
      "Guitar Class",
      "Music Lessons",
      "Doctor checkup",
      "Brazil - Mexico",
      "Opening ceremony",
      "Final presentation",
    ];
    const weekDate: Date = new Date(
      new Date().setDate(new Date().getDate() - new Date().getDay())
    );
    let startDate: Date = new Date(
      weekDate.getFullYear(),
      weekDate.getMonth(),
      weekDate.getDate(),
      10,
      0
    );
    let endDate: Date = new Date(
      weekDate.getFullYear(),
      weekDate.getMonth(),
      weekDate.getDate(),
      11,
      30
    );
    eventData.push({
      Id: 1,
      Subject: eventSubjects[Math.floor(Math.random() * (24 - 0 + 1) + 0)],
      StartTime: startDate,
      EndTime: endDate,
      Location: "",
      Description: "Event Scheduled",
      RecurrenceRule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1;COUNT=10;",
      IsAllDay: false,
      IsReadonly: false,
      CalendarId: 1,
    });
    for (let a = 0, id = 2; a < 500; a++) {
      const month: number = Math.floor(Math.random() * (11 - 0 + 1) + 0);
      const date: number = Math.floor(Math.random() * (28 - 1 + 1) + 1);
      const hour: number = Math.floor(Math.random() * (23 - 0 + 1) + 0);
      const minutes: number = Math.floor(Math.random() * (59 - 0 + 1) + 0);
      const start: Date = new Date(
        new Date().getFullYear(),
        month,
        date,
        hour,
        minutes,
        0
      );
      const end: Date = new Date(start.getTime());
      end.setHours(end.getHours() + 2);
      startDate = new Date(start.getTime());
      endDate = new Date(end.getTime());
      eventData.push({
        Id: id,
        Subject: eventSubjects[Math.floor(Math.random() * (24 - 0 + 1) + 0)],
        StartTime: startDate,
        EndTime: endDate,
        Location: "",
        Description: "Event Scheduled",
        IsAllDay: id % 10 === 0,
        IsReadonly: endDate < new Date(),
        CalendarId: (a % 4) + 1,
      });

      id++;
    }
    if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
      Timezone.prototype.offset = (date: Date, zone: string): number =>
        moment.tz.zone(zone).utcOffset(date.getTime());
    }
    const overviewEvents: { [key: string]: Date }[] = extend(
      [],
      eventData,
      null,
      true
    ) as { [key: string]: Date }[];
    const timezone: Timezone = new Timezone();
    const utcTimezone: never = "UTC" as never;
    const currentTimezone: never = timezone.getLocalTimezoneName() as never;
    for (const event of overviewEvents) {
      event.StartTime = timezone.convert(
        event.StartTime,
        utcTimezone,
        currentTimezone
      );
      event.EndTime = timezone.convert(
        event.EndTime,
        utcTimezone,
        currentTimezone
      );
    }
    return overviewEvents;
  }

  public onToolbarCreated(): void {
    setInterval(() => {
      this.updateLiveTime(this.scheduleObj ? this.scheduleObj.timezone : "UTC");
    }, 1000);
  }

  public onToolbarItemClicked(args: ClickEventArgs): void {
    let currentViewLocal: View;
    switch (args.item.text) {
      case "Day":
        currentViewLocal = this.isTimelineView ? "TimelineDay" : "Day";
        break;
      case "Week":
        currentViewLocal = this.isTimelineView ? "TimelineWeek" : "Week";
        break;
      case "WorkWeek":
        currentViewLocal = this.isTimelineView
          ? "TimelineWorkWeek"
          : "WorkWeek";
        break;
      case "Month":
        currentViewLocal = this.isTimelineView ? "TimelineMonth" : "Month";
        break;
      case "Year":
        currentViewLocal = this.isTimelineView ? "TimelineYear" : "Year";
        break;
      case "Agenda":
        currentViewLocal = "Agenda";
        break;
      case "New Event":
        const eventData: Object = this.getEventData();
        this.scheduleObj.openEditor(eventData, "Add", true);
        break;
      case "New Recurring Event":
        const recEventData: Object = this.getEventData();
        this.scheduleObj.openEditor(recEventData, "Add", true, 1);
        break;
    }

    if (currentViewLocal) {
      this.currentView = currentViewLocal;
      this.dateHeaderCounter = 0;
      // localStorage.setItem("currentView", this.currentView);
      this.setCalendarSettingsToDatabase("currentView", this.currentView);
      // this.scheduleObj.refresh();
    }
  }

  private getEventData(): Object {
    const date: Date = this.scheduleObj.selectedDate;
    return {
      Id: this.scheduleObj.getEventMaxID(),
      Subject: "",
      StartTime: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        new Date().getHours(),
        0,
        0
      ),
      EndTime: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        new Date().getHours() + 1,
        0,
        0
      ),
      Location: "",
      Description: "",
      IsAllDay: false,
      CalendarId: 1,
    };
  }

  public updateLiveTime(timezone: string = "UTC"): void {
    this.liveTimeUpdate = new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
    });
  }

  public onTimelineViewChange(args: SwitchEventArgs): void {
    this.isTimelineView = args.checked;
    switch (this.scheduleObj.currentView) {
      case "Day":
      case "TimelineDay":
        this.currentView = this.isTimelineView ? "TimelineDay" : "Day";
        break;
      case "Week":
      case "TimelineWeek":
        this.currentView = this.isTimelineView ? "TimelineWeek" : "Week";
        break;
      case "WorkWeek":
      case "TimelineWorkWeek":
        this.currentView = this.isTimelineView
          ? "TimelineWorkWeek"
          : "WorkWeek";
        break;
      case "Month":
      case "TimelineMonth":
        this.currentView = this.isTimelineView ? "TimelineMonth" : "Month";
        break;
      case "Year":
      case "TimelineYear":
        this.currentView = this.isTimelineView ? "TimelineYear" : "Year";
        break;
      case "Agenda":
        this.currentView = "Agenda";
        break;
    }

    // localStorage.setItem("currentView", this.currentView);
    this.setCalendarSettingsToDatabase("currentView", this.currentView);
    this.scheduleObj.refresh();
  }

  public onWeekNumberChange(args: SwitchEventArgs): void {
    this.scheduleObj.showWeekNumber = args.checked;
    this.scheduleObj.refresh();
  }

  public onGroupingChange(args: SwitchEventArgs): void {
    this.scheduleObj.group.resources = args.checked ? ["sharedCalendar"] : [];
    this.scheduleObj.refresh();
  }

  public onGridlinesChange(args: SwitchEventArgs): void {
    this.scheduleObj.timeScale.enable = args.checked;
    this.scheduleObj.refresh();
  }

  public onRowAutoHeightChange(args: SwitchEventArgs): void {
    this.scheduleObj.rowAutoHeight = args.checked;
    this.scheduleObj.refresh();
  }

  public onTooltipChange(args: SwitchEventArgs): void {
    this.scheduleObj.eventSettings.enableTooltip = args.checked;
    this.scheduleObj.refresh();
  }

  public onSelected(args: SelectedEventArgs): void {
    this.scheduleObj.importICalendar(
      (<HTMLInputElement>args.event.target).files[0]
    );
    this.scheduleObj.refresh();
  }

  public onLastMinuteClick(): void {
    const settingsPanel: Element = document.querySelector(
      ".overview-content .settings-panel"
    );

    const lastMinutePanel: Element = document.querySelector(
      ".overview-content .last-minute-panel"
    );

    if (lastMinutePanel.classList.contains("hide")) {
      if (!settingsPanel.classList.contains("hide"))
        addClass([settingsPanel], "hide");

      removeClass([lastMinutePanel], "hide");
    } else {
      addClass([lastMinutePanel], "hide");
    }
  }

  public onSettingsClick(): void {
    const settingsPanel: Element = document.querySelector(
      ".overview-content .settings-panel"
    );

    const lastMinutePanel: Element = document.querySelector(
      ".overview-content .last-minute-panel"
    );

    if (settingsPanel.classList.contains("hide")) {
      if (!lastMinutePanel.classList.contains("hide"))
        addClass([lastMinutePanel], "hide");

      removeClass([settingsPanel], "hide");
    } else {
      addClass([settingsPanel], "hide");
    }
  }

  public showFilterPanel(): void {
    const settingsPanel: Element = document.querySelector(
      ".overview-content .filter-panel"
    );
    if (settingsPanel.classList.contains("hide")) {
      removeClass([settingsPanel], "hide");
    } else {
      addClass([settingsPanel], "hide");
    }
  }

  public getDateHeaderText(date): string {
    return this.intl.formatDate(date, { skeleton: "Ed" });
  }

  public onWeekDayChange(args: ChangeEventArgs): void {
    this.scheduleObj.firstDayOfWeek = args.value as number;
    this.setCalendarSettingsToDatabase(
      "weekDayChange",
      this.scheduleObj.firstDayOfWeek
    );
    this.scheduleObj.refresh();
  }

  public onWorkWeekDayChange(args: MultiSelectChangeEventArgs): void {
    this.scheduleObj.workDays = args.value as number[];
    this.scheduleObj.refresh();
  }

  public onResourceChange(args: MultiSelectChangeEventArgs): void {
    let resourcePredicate: Predicate;
    for (const value of args.value) {
      if (resourcePredicate) {
        resourcePredicate = resourcePredicate.or(
          new Predicate("CalendarId", "equal", value)
        );
      } else {
        resourcePredicate = new Predicate("CalendarId", "equal", value);
      }
    }
    this.scheduleObj.refresh();
  }

  public onTimezoneChange(args: ChangeEventArgs): void {
    this.scheduleObj.timezone = args.value as string;
    this.updateLiveTime(this.scheduleObj.timezone);
    document.querySelector(".schedule-overview #timezoneBtn").innerHTML =
      '<span class="e-btn-icon e-icons e-schedule-timezone e-icon-left"></span>' +
      args.itemData.text;
    this.scheduleObj.refresh();
  }

  public onDayStartHourChange(args: TimeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.startHour = this.intl.formatDate(args.value, {
        skeleton: "Hm",
      });
      this.setCalendarSettingsToDatabase(
        "dayStart",
        this.scheduleObj.startHour
      );

      this.scheduleObj.refresh();
      this.dayStartHourValue = args.value;
    }
  }

  public onDayEndHourChange(args: TimeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.endHour = this.intl.formatDate(args.value, {
        skeleton: "Hm",
      });
      this.setCalendarSettingsToDatabase("dayEnd", this.scheduleObj.endHour);
      this.scheduleObj.refresh();
    }
  }

  public onWorkStartHourChange(args: TimeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.workHours.start = this.intl.formatDate(args.value, {
        skeleton: "Hm",
      });
      this.setCalendarSettingsToDatabase(
        "dayWorkStart",
        this.scheduleObj.workHours.start
      );
      this.scheduleObj.refresh();
    }
  }

  public onWorkEndHourChange(args: TimeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.workHours.end = this.intl.formatDate(args.value, {
        skeleton: "Hm",
      });
      this.setCalendarSettingsToDatabase(
        "dayWorkEnd",
        this.scheduleObj.workHours.end
      );
      this.scheduleObj.refresh();
    }
  }

  public onTimescaleDurationChange(args: ChangeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.timeScale.interval = args.value as number;
      this.setCalendarSettingsToDatabase(
        "timeDuration",
        this.scheduleObj.timeScale.interval
      );
      this.scheduleObj.refresh();
    }
  }

  public onTimescaleIntervalChange(args: ChangeEventArgs): void {
    if (this.scheduleObj) {
      this.scheduleObj.timeScale.slotCount = args.value as number;
      this.setCalendarSettingsToDatabase(
        "timeSlot",
        this.scheduleObj.timeScale.slotCount
      );
      this.scheduleObj.refresh();
    }
  }

  public onFirstDayOfWeekChange(args: ChangeEventArgs): void {
    if (this.scheduleObj) {
      this.firstDayOfWeek = args.value as number;
      this.setCalendarSettingsToDatabase("firstDayOfWeek", this.firstDayOfWeek);
      this.scheduleObj.refresh();
    }
  }

  setCalendarSettingsValue(key, value) {
    this.calendarSettings["id"] = this.selectedStoreId;
    this.calendarSettings[key] = value;
  }

  setCalendarSettingsToDatabase(key, value) {
    this.setCalendarSettingsValue(key, value);
    const item = {
      user_id: this.helpService.getMe(),
      storeSettings: this.calendarSettings,
    };

    this.mongo.setSettingsForStore(item).subscribe((data) => {
      console.log(data);
      if (data) {
        this.setNewCalendarSettingsInStore(this.calendarSettings);
      }
    });
  }

  setNewCalendarSettingsInStore(newSettings) {
    const currentCalendarSettings = this.storageService.getStoreSettings();
    let change = false;

    for (let i = 0; i < currentCalendarSettings.length; i++) {
      if (currentCalendarSettings[i].id === newSettings.id) {
        currentCalendarSettings[i] = newSettings;
        change = true;
        break;
      }
    }
    if (!change) {
      currentCalendarSettings.push(newSettings);
    }
    this.storageService.setStoreSettings(currentCalendarSettings);
  }

  public getResourceData(data: { [key: string]: Object }): {
    [key: string]: Object;
  } {
    // tslint:disable-next-line: deprecation
    const resources: ResourcesModel =
      this.scheduleObj.getResourceCollections()[0];
    const resourceData: {
      [key: string]: Object;
    } = (resources.dataSource as Object[]).filter(
      (resource: { [key: string]: Object }) => resource.id === data.colorTask
    )[0] as { [key: string]: Object };
    return resourceData;
  }

  renderTimeInSchedule() {
    setTimeout(() => {
      if (this.scheduleObj) {
        this.scheduleObj.startHour = this.intl.formatDate(
          this.dayStartHourValue,
          {
            skeleton: "Hm",
          }
        );
        this.scheduleObj.endHour = this.intl.formatDate(this.dayEndHourValue, {
          skeleton: "Hm",
        });
        this.scheduleObj.workHours.start = this.intl.formatDate(
          this.workStartHourValue,
          {
            skeleton: "Hm",
          }
        );
        this.scheduleObj.workHours.end = this.intl.formatDate(
          this.workEndHourValue,
          {
            skeleton: "Hm",
          }
        );
        this.scheduleObj.timeScale.interval = this
          .timeSlotDurationValue as number;
        this.scheduleObj.timeScale.slotCount = this
          .timeSlotCountValue as number;
        this.scheduleObj.firstDayOfWeek = this.firstDayOfWeek as number;
        this.scheduleObj.refresh();
      }
    }, 100);
  }

  public getHeaderStyles(data: { [key: string]: Object }): Object {
    if (data.elementType === "cell") {
      return { "align-items": "center", color: "#919191" };
    } else {
      const resourceData: { [key: string]: Object } =
        this.getResourceData(data);
      // return { 'background': resourceData.color, 'color': '#FFFFFF' };
      return { background: "#007bff", color: "#FFFFFF" };
    }
  }

  public getHeaderTitle(data: { [key: string]: Object }): string {
    return data.elementType === "cell"
      ? "Add Appointment"
      : "Appointment Details";
  }

  public getHeaderDetails(data: { [key: string]: Date }): string {
    return (
      this.intl.formatDate(data.StartTime, { type: "date", skeleton: "full" }) +
      " (" +
      this.intl.formatDate(data.StartTime, { skeleton: "hm" }) +
      " - " +
      this.intl.formatDate(data.EndTime, { skeleton: "hm" }) +
      ")"
    );
  }

  public getEventType(data: { [key: string]: string }): string {
    const resourceData: { [key: string]: Object } = this.getResourceData(data);
    return resourceData.CalendarText as string;
  }

  public buttonClickActions(e: Event) {
    const quickPopup: HTMLElement = this.scheduleObj.element.querySelector(
      ".e-quick-popup-wrapper"
    ) as HTMLElement;
    const getSlotData: Function = (): { [key: string]: Object } => {
      const cellDetails: CellClickEventArgs = this.scheduleObj.getCellDetails(
        this.scheduleObj.getSelectedElements()
      );
      const addObj: { [key: string]: Object } = {};
      addObj.Id = this.scheduleObj.getEventMaxID();
      addObj.Subject = (
        (quickPopup.querySelector("#title") as EJ2Instance)
          .ej2_instances[0] as TextBoxComponent
      ).value;
      addObj.StartTime = new Date(cellDetails.startTime);
      addObj.EndTime = new Date(cellDetails.endTime);
      addObj.Description = (
        (quickPopup.querySelector("#notes") as EJ2Instance)
          .ej2_instances[0] as TextBoxComponent
      ).value;
      addObj.CalendarId = (
        (quickPopup.querySelector("#eventType") as EJ2Instance)
          .ej2_instances[0] as DropDownListComponent
      ).value;
      return addObj;
    };
    if (e["addedRecords"].length) {
      const addObj: { [key: string]: Object } = getSlotData();
      this.scheduleObj.addEvent(addObj);
    } else if ((e.target as HTMLElement).id === "delete") {
      const eventDetails: { [key: string]: Object } = this.scheduleObj
        .activeEventData.event as { [key: string]: Object };
      let currentAction: CurrentAction;
      if (eventDetails.RecurrenceRule) {
        currentAction = "DeleteOccurrence";
      }
      this.deleteTask(eventDetails);
      this.scheduleObj.deleteEvent(eventDetails, currentAction);
    } else {
      const isCellPopup: boolean =
        quickPopup.firstElementChild.classList.contains("e-cell-popup");
      let eventDetails: { [key: string]: Object } = isCellPopup
        ? getSlotData()
        : (this.scheduleObj.activeEventData.event as { [key: string]: Object });
      let currentAction: CurrentAction = isCellPopup ? "Add" : "Save";
      if (eventDetails.RecurrenceRule) {
        currentAction = "EditOccurrence";
      }

      this.createFormGroup(eventDetails);
      eventDetails.start = this.convertToDate(eventDetails.start.toString());
      eventDetails.end = this.convertToDate(eventDetails.end.toString());

      this.scheduleObj.openEditor(eventDetails, currentAction, true);
    }
    this.scheduleObj.closeQuickInfoPopup();
  }

  createNewTask() {
    let formValue = new EventModel();
    if (this.type === this.userType.patient) {
      formValue.online = 1;
    }
    formValue.colorTask = this.selected;
    formValue.telephone = this.telephoneValue;
    formValue.mobile = this.mobileValue;
    if (this.customerUser && !this.customerUser.id) {
      this.customerUser.id = this.helpService.getMe().toString();
    }
    formValue.user = Object.assign({}, this.customerUser);
    formValue.mobile = this.mobileValue;
    formValue.title =
      this.customerUser["lastname"] +
      " " +
      this.customerUser["firstname"] +
      "+" +
      this.complaintData.complaint_title +
      "+" +
      this.complaintData.comment;
    formValue.start = this.eventTime.start;
    formValue.end = this.eventTime.end;
    formValue.superadmin = this.helpService.getSuperadmin();
    formValue.color = this.getColorForEvent(this.selected);
    if (this.type !== 3 && this.creatorEvent !== undefined) {
      formValue.creator_id = this.creatorEvent;
    } else {
      formValue.creator_id = this.helpService.getMe();
    }
    formValue = this.colorMapToId(formValue);
    this.addTherapy(this.customerUser["id"]);
    formValue.title =
      this.customerUser["lastname"] +
      " " +
      this.customerUser["firstname"] +
      "+" +
      this.complaintData.complaint_title +
      "+" +
      this.complaintData.comment;
    this.formatDate(this.eventTime.start, this.eventTime.end);
    if (this.isConfirm) {
      formValue.confirm = 0;
    } else {
      formValue.confirm = -1;
    }
    this.customer.addTherapy(this.complaintData).subscribe((data) => {
      if (data["success"]) {
        formValue.therapy_id = data["id"];
        if (
          this.type === this.userType.owner ||
          this.type === this.userType.patient
        ) {
          formValue["storeId"] = this.selectedStoreId;
        }
        this.service.createTask(formValue, (val) => {
          console.log(val);
          if (val.success) {
            const eventForScheduler = {
              title: formValue.title,
              StartTime: new Date(formValue.start),
              EndTime: new Date(formValue.end),
            };

            formValue["StartTime"] = new Date(formValue.start);
            formValue["EndTime"] = new Date(formValue.end);

            formValue.id = val.id;
            formValue.customer_id = Number(this.customerUser.id);
            // this.customerUser = null;

            this.allEvents.push(formValue);
            this.scheduleObj.eventSettings.dataSource = this.allEvents;
            this.scheduleObj.refreshEvents();

            this.toastr.success(
              this.language.successUpdateTitle,
              this.language.successUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          } else {
            this.toastr.error(
              this.language.unsuccessUpdateTitle,
              this.language.unsuccessUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          }
        });

        console.log(this.data);
        const customerAttentionAndPhysical = {
          id: this.customerUser["id"],
          attention: this.customerUser["attention"],
          physicalComplaint: this.customerUser["physicalComplaint"],
        };
        console.log(customerAttentionAndPhysical);
        this.customer
          .updateAttentionAndPhysical(customerAttentionAndPhysical)
          .subscribe((data) => {
            console.log(data);
          });
      } else {
        this.toastr.error(
          this.language.unsuccessUpdateTitle,
          this.language.unsuccessUpdateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }

  getColorForEvent(id) {
    for (let i = 0; i < this.eventCategory.length; i++) {
      if (this.eventCategory[i].id == id) {
        return this.eventCategory[i].color;
      }
    }
  }

  updateTask(args) {
    console.log(args);
    console.log("updateTask");
    let formValue = new EventModel();
    if (this.type === this.userType.patient) {
      formValue.online = 1;
    }
    formValue.Id = args.data.Id;
    formValue.id = args.data.id;
    formValue.colorTask = this.selected ? this.selected : args.data.colorTask;
    formValue;
    formValue.telephone = this.telephoneValue;
    const checkCustomerId = this.customerUser.id
      ? this.customerUser
      : {
          id: args.data.customer_id
            ? args.data.customer_id
            : args.data.user.id
            ? args.data.user.id
            : null,
        };
    formValue.user = checkCustomerId;
    formValue.customer_id = checkCustomerId.id;
    formValue.therapy_id = args.data.therapy_id;
    formValue.mobile = this.mobileValue;
    formValue.start = this.eventTime.start
      ? this.eventTime.start
      : args.data.StartTime;
    formValue.end = this.eventTime.end ? this.eventTime.end : args.data.EndTime;
    formValue.color = this.getColorForEvent(
      this.selected ? this.selected : args.data.colorTask
    );
    formValue.superadmin = this.helpService.getSuperadmin();
    formValue.creator_id = args.data.creator_id;
    formValue = this.colorMapToId(formValue);
    this.addTherapy(formValue.customer_id);
    if (this.customerUser.id) {
      formValue.title =
        this.customerUser["lastname"] +
        " " +
        this.customerUser["firstname"] +
        "+" +
        this.complaintData.complaint_title +
        "+" +
        this.complaintData.comment;
    } else {
      formValue.title = args.data.title;
    }
    this.formatDate(
      this.eventTime.start ? this.eventTime.start : args.data.StartTime,
      this.eventTime.end ? this.eventTime.end : args.data.EndTime
    );
    formValue["StartTime"] = new Date(formValue.start);
    formValue["EndTime"] = new Date(formValue.end);
    if (this.isConfirm) {
      formValue.confirm = 0;
    } else {
      formValue.confirm = -1;
    }
    formValue.user.isConfirm = this.isConfirm;
    formValue.user.reminderViaEmail = this.reminderViaEmail;
    formValue.user.reminderViaSMS = this.reminderViaSMS;
    this.customer.updateTherapy(this.complaintData).subscribe((data) => {
      if (data) {
        this.service.updateTask(formValue, (val) => {
          console.log(val);
          if (val.success) {
            this.toastr.success(
              this.language.successUpdateTitle,
              this.language.successUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
            // this.initializeTasks();
            this.updateTaskInScheduler("update", formValue);
          } else {
            this.toastr.error(
              this.language.unsuccessUpdateTitle,
              this.language.unsuccessUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          }
        });
        const customerAttentionAndPhysical = {
          id: this.customerUser["id"],
          attention: this.customerUser["attention"],
          physicalComplaint: this.customerUser["physicalComplaint"],
        };
        console.log(customerAttentionAndPhysical);
        this.customer
          .updateAttentionAndPhysical(customerAttentionAndPhysical)
          .subscribe((data) => {
            console.log(data);
          });
        this.customer
          .updateCustomerSendReminderOption(formValue.user)
          .subscribe((data) => {
            console.log(data);
          });
      } else {
        this.toastr.success(
          this.language.unsuccessUpdateTitle,
          this.language.unsuccessUpdateText,
          { timeOut: 7000, positionClass: "toast-bottom-right" }
        );
      }
    });
  }

  updateTaskInScheduler(typeOfAction, data) {
    if (typeOfAction === "create") {
      this.events.push(data);
    } else {
      this.updateScheduler(data);
    }
  }

  updateScheduler(data) {
    for (let i = 0; i < this.allEvents.length; i++) {
      if (this.allEvents[i].id === data.id) {
        // this.allEvents.splice(i, 1);
        this.allEvents[i] = data;
        this.scheduleObj.eventSettings.dataSource = this.allEvents;
        this.scheduleObj.refreshEvents();
        return;
        /*this.eventSettings = {};
        setTimeout(() => {
          this.allEvents.push(data);
          this.scheduleObj.eventSettings.dataSource = this.allEvents;
          this.scheduleObj.refreshEvents();
        }, 20);*/
      }
    }
  }

  //required high version of angular. In angular 7.2 has a problem with static params. Without static doesn't work.
  //@ViewChild("fieldName1", {static: true}) public fieldName1: ElementRef;
  // @ViewChild("fieldName1") public fieldName1: ElementRef;

  validateRequiredFields() {
    if (this.eventTime.start && this.eventTime.end && this.customerUser.id) {
      return false;
    }
    return true;
  }

  onPopupOpen(args): void {
    console.log(args);
    if (
      args.data.StartTime < new Date() &&
      this.type === this.userType.patient
    ) {
      args.cancel = true;
    }
    this.updateEventModalLanguage();
    if (
      (!this.checkConditionForEvent(args) &&
        this.type === this.userType.patient) ||
      this.type === this.userType.readOnlyScheduler
    ) {
      this.patientReadOnly = true;
    } else {
      this.patientReadOnly = false;
    }

    args.element.scrollTop = 0;
    this.setTimeForEditor(args);
    if (args.type === "QuickInfo") {
      args.cancel = true;
    } else if (args.type === "Editor") {
      this.creatorEvent = args.data["creator_id"];
      if (!args.data["id"]) {
        this.clearAllSelectedData();
        if (this.type === this.userType.patient) {
          this.telephoneValue = this.customerUser.telephone;
          this.mobileValue = this.customerUser.mobile;
        }
      } else if (args.data["id"]) {
        if (
          (this.type === this.userType.patient &&
            args.data["customer_id"] !== this.id) ||
          this.type === this.userType.readOnlyScheduler
        ) {
          args.cancel = true;
        } else {
          this.selected = null;
          console.log(args.data);
          this.getSelectEventData(args.data);
        }
      }
    }

    if (args.data.Id) {
      this.eventChange = true;
    } else {
      this.eventChange = false;
    }
  }

  /*onPopupOpen(args: PopupOpenEventArgs): void {
    let data: { [key: string]: Object } = <{ [key: string]: Object }>args.data;
    if (
      args.type === "QuickInfo" ||
      args.type === "Editor" ||
      args.type === "RecurrenceAlert" ||
      args.type === "DeleteAlert"
    ) {
      let target: HTMLElement =
        args.type === "RecurrenceAlert" || args.type === "DeleteAlert"
          ? args.element[0]
          : args.target;
      if (
        !isNullOrUndefined(target) &&
        target.classList.contains("e-work-cells")
      ) {
        if (
          target.classList.contains("e-read-only-cells") ||
          !this.scheduleObj.isSlotAvailable(data)
        ) {
          args.cancel = true;
        }
      }
    }
  }*/

  setTimeForEditor(args) {
    let timeDurationInd = 0;
    let timeDuration = 0;
    if (!isNaN(this.selectedStoreId)) {
      if (args.data.id === undefined || args.data.id === null) {
        const informationAboutStore = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        );
        timeDurationInd =
          Number(informationAboutStore.time_therapy) !==
          Number(this.timeDuration)
            ? 1
            : 0;
        timeDuration = Number(informationAboutStore.time_therapy);
      } else {
        const informationAboutStore = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        );
        if (
          args.data.EndTime.getTime() - args.data.StartTime.getTime() !==
          Number(informationAboutStore.time_duration) * 60000
        ) {
          timeDuration =
            args.data.EndTime.getTime() - args.data.StartTime.getTime() / 60000;
        } else {
          timeDurationInd =
            Number(informationAboutStore.time_therapy) !==
            Number(this.timeDuration)
              ? 1
              : 0;
          timeDuration = Number(informationAboutStore.time_therapy);
        }
      }
    }

    console.log(typeof args.data.StartTime);
    this.eventTime = {
      start: args.data.StartTime,
      end: new Date(
        timeDurationInd && args.data.id === undefined
          ? args.data.StartTime.getTime() + timeDuration * 60000
          : args.data.EndTime.getTime()
      ),
    };
  }

  buttonActions(event) {
    console.log(event);
    if (event.requestType === "eventChanged") {
      if (event["changedRecords"].length) {
      }
    } else if (event.requestType === "eventRemoved") {
      if (event["deletedRecords"].length) {
        if (event["deletedRecords"][0]) {
          this.deleteTask(event["deletedRecords"][0]);
        }
      }
    }
  }

  getSelectEventData(eventDetails) {
    const quickPopup: HTMLElement = this.scheduleObj.element.querySelector(
      ".e-quick-popup-wrapper"
    ) as HTMLElement;
    this.createFormGroup(eventDetails);
    eventDetails.start = this.convertToDate(eventDetails.start.toString());
    eventDetails.end = this.convertToDate(eventDetails.end.toString());
  }

  public onContextMenuBeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
    const newEventElement: HTMLElement = document.querySelector(
      ".e-new-event"
    ) as HTMLElement;
    if (newEventElement) {
      remove(newEventElement);
      removeClass(
        [document.querySelector(".e-selected-cell")],
        "e-selected-cell"
      );
    }
    const targetElement: HTMLElement = <HTMLElement>args.event.target;
    if (closest(targetElement, ".e-contextmenu")) {
      return;
    }
    this.selectedTarget = closest(
      targetElement,
      ".e-appointment,.e-work-cells," +
        ".e-vertical-view .e-date-header-wrap .e-all-day-cells,.e-vertical-view .e-date-header-wrap .e-header-cells"
    );
    if (isNullOrUndefined(this.selectedTarget)) {
      args.cancel = true;
      return;
    }
    if (this.selectedTarget.classList.contains("e-appointment")) {
      const eventObj: {
        [key: string]: Object;
      } = this.scheduleObj.getEventDetails(this.selectedTarget) as {
        [key: string]: Object;
      };
      if (eventObj.RecurrenceRule) {
        /*this.menuObj.showItems(
          ["EditRecurrenceEvent", "DeleteRecurrenceEvent"],
          true
        );
        this.menuObj.hideItems(
          ["Add", "AddRecurrence", "Today", "Save", "Delete"],
          true
        );*/
      } else {
        /*this.menuObj.showItems(["Save", "Delete"], true);
        this.menuObj.hideItems(
          [
            "Add",
            "AddRecurrence",
            "Today",
            "EditRecurrenceEvent",
            "DeleteRecurrenceEvent",
          ],
          true
        );*/
      }
      return;
    }
    /*this.menuObj.hideItems(
      ["Save", "Delete", "EditRecurrenceEvent", "DeleteRecurrenceEvent"],
      true
    );
    this.menuObj.showItems(["Add", "AddRecurrence", "Today"], true);*/
  }

  public onMenuItemSelect(args: MenuEventArgs): void {
    const selectedMenuItem: string = args.item.id;
    let eventObj: { [key: string]: number };
    if (this.selectedTarget.classList.contains("e-appointment")) {
      eventObj = this.scheduleObj.getEventDetails(this.selectedTarget) as {
        [key: string]: number;
      };
    }
    switch (selectedMenuItem) {
      case "Today":
        this.scheduleObj.selectedDate = new Date();
        break;
      case "Add":
      case "AddRecurrence":
        const selectedCells: Element[] = this.scheduleObj.getSelectedElements();
        const activeCellsData: CellClickEventArgs =
          this.scheduleObj.getCellDetails(
            selectedCells.length > 0 ? selectedCells : this.selectedTarget
          );
        if (selectedMenuItem === "Add") {
          this.scheduleObj.openEditor(activeCellsData, "Add");
        } else {
          this.scheduleObj.openEditor(activeCellsData, "Add", null, 1);
        }
        break;
      case "Save":
      case "EditOccurrence":
      case "EditSeries":
        if (selectedMenuItem === "EditSeries") {
          const query: Query = new Query().where(
            this.scheduleObj.eventFields.id,
            "equal",
            eventObj.RecurrenceID
          );
          eventObj = new DataManager(this.scheduleObj.eventsData).executeLocal(
            query
          )[0] as { [key: string]: number };
        }
        this.scheduleObj.openEditor(eventObj, selectedMenuItem);
        break;
      case "Delete":
        this.scheduleObj.deleteEvent(eventObj);
        break;
      case "DeleteOccurrence":
      case "DeleteSeries":
        this.scheduleObj.deleteEvent(eventObj, selectedMenuItem);
        break;
    }
  }

  /* MY CODE */

  @ViewChild("customerUserModal") customerUserModal: Modal;
  @ViewChild("customerModal") customerModal: Modal;
  @ViewChild("customerUserModal2") customerUserModal2: Modal;
  @ViewChild("quickPreview") quickPreview: Modal;
  @ViewChild("scheduler") public scheduler: SchedulerComponent;
  @ViewChild("usersInCompany") public customerElement: ComboBoxModule;
  public selectedDate: Date = new Date();
  public formGroup: FormGroup;
  public events: SchedulerEvent[] = [];
  public customerUsers = [];
  public telephoneValue = "";
  public type: any;
  public customerComponent: CustomersComponent;
  public usersInCompany: any = [];
  public colorTask: any;
  public zIndex: string;
  public theme: string;
  public selected = "#cac6c3";
  public palette: any[] = [];
  public colorPalette: any;
  public selectedColorId: any;
  public language: any;
  public languageUser: any;
  public resources: any[] = [];
  public customerUser = new CustomerModel();
  public mobileValue = "";
  public dataForReminder: any;
  public data = new UserModel();
  public value: any = [];
  public store: any;
  public calendars: any = [];
  public loading = true;
  public createFormLoading: boolean;
  public orientation = "horizontal";
  public workTime: any[] = [];
  public selectedStoreId: number = null;
  public selectedStoreIdSubject = new Subject();
  public selectedStoreIdSub: Subscription;
  public isValidStoreSelected = false;
  public splitterSizeFull = 100;
  public splitterSize: number;
  public dateEvent: string;
  public selectedViewIndex = 0;
  public currentDate = new Date();
  public startWork = "08:00";
  public endWork = "22:00";
  public timeDuration = "60";
  public therapyDuration = 1;
  public loopIndex = 0;
  public valueLoop: any;
  public size = [];
  public selectedButtonIndex = [false, false, false, false, false, false];
  public selectedButtonIndexStyle = ["", "", "", "", "", ""];
  public imagePath = "defaultUser";
  public therapyValue: any;
  public treatmentValue: any;
  public complaintValue: any;
  public CSValue: any;
  public stateValue: any;
  public complaintData = new ComplaintTherapyModel();
  public selectedComplaint: any;
  public selectedTherapies: any;
  public selectedTreatments: any;
  public baseDataIndicator = false;
  public allUsers: any;
  public selectedUser: any;
  public userWidth = "22%";
  public id: number;
  public customerLoading = false;
  public height: any;
  public calendarHeight: any;
  public eventCategory: any;
  public currentTopPosition: any = [];
  private eventOptions: boolean | { capture?: boolean; passive?: boolean };
  public step = 0;
  public pixel = 100;
  public delay = 1000;
  public calendarWidth = 80;
  public requestForConfirmArrival = false;
  public confirmArrivalData: any;
  public isConfirm: any;
  public reminderViaSMS: any;
  public reminderViaEmail: any;
  public allEvents = [];
  private instance: Internationalization = new Internationalization();
  public sharedCalendarResources: any;
  public eventTime = {
    start: null,
    end: null,
  };
  public creatorEvent: number;
  public displayToolbar = true;
  public storeName: string;
  public dateHeaderCounter = 0;
  public calendarSettings = {};
  public configurationFromMongoDb: any;
  public dateFormatScheduler = "dd.MM.yyyy";
  public userType = UserType;
  public patientReadOnly = false;
  public currentEventAction: any;
  public expandAddional = false;
  public expandAdditionalIcon = "k-icon k-i-arrow-60-right";
  public filterToolbarInd = true;
  public calendarRights = true;
  public eventStatisticConfiguration: any;
  public vatTaxList;
  public eventMoveConfirm = false;
  public modalConfirmEventMove = false;
  public mobileEventChange: any;

  public lastMinuteWeekDays: Object[] = WEEK_DAYS;
  public patients: any = [];
  public isUserSelected = false;
  public therapeuts: any = [];
  public selectedLastMinuteWeekDays: any = [];
  public lastMinuteStartDate: Date = new Date();
  public lastMinuteEndDate: Date = new Date();
  public days = new Date().getDay();
  public lastMinute: any;
  public lastMinuteHoursValue: any = [];
  public lastMinuteOfferSubmitted = false;

  private static secretKey = "YourSecretKeyForEncryption&Descryption";

  @ViewChild("msPatients") public msPatients: MultiSelectComponent;
  @ViewChild("msTherapeuts") public msTherapeuts: MultiSelectComponent;
  @ViewChild("msDays") public msDays: MultiSelectComponent;
  @ViewChild("msLastMinuteTime") public msLastMinuteTime: MultiSelectComponent;

  constructor(
    public service: TaskService,
    public customer: CustomersService,
    public message: MessageService,
    public storeService: StoreService,
    public usersService: UsersService,
    public mongo: MongoService,
    public eventCategoryService: EventCategoryService,
    public ngZone: NgZone,
    private toastr: ToastrService,
    private dynamicSchedulerService: DynamicSchedulerService,
    private helpService: HelpService,
    private storageService: StorageService,
    private packLanguage: PackLanguageService,
    private accountService: AccountService,
    private activatedRouter: ActivatedRoute,
    private holidayService: HolidayService,
    private pdfService: PDFService,
    private parameterItemService: ParameterItemService,
    private dateService: DateService,
    private invoiceService: InvoiceService,
    private router: Router,
    private dynamicService: DynamicService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.selectedStoreIdSub = this.selectedStoreIdSubject
      .asObservable()
      .subscribe(this.checkIsStoreSelected);
    this.initializationConfig();
    this.helpService.setDefaultBrowserTabTitle();
    this.loadUser();
    this.loadHolidays();
    this.initData();
    this.loadCustomers();

    this.lastMinuteWeekDays = this.weekDays.filter((item: any) => {
      return item.value == new Date().getDay();
    });

    console.log(this.lastMinuteWeekDays);
  }

  checkAvailableDate(startDate, endDate) {
    for (
      var arr = new Set(), dt = new Date(startDate);
      dt <= new Date(endDate);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.add(dt.getDay());
    }

    const daysArray = Array.from(arr);

    this.lastMinuteWeekDays = this.weekDays.filter((item: any) => {
      return daysArray.includes(item.value);
    });
  }

  ngOnDestroy(): void {
    this.toastr.clear();
    if (this.selectedStoreIdSub) {
      this.selectedStoreIdSub.unsubscribe();
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicSchedulerService.getSchedulerHeight() + "px";
  }

  get user() {
    return this.customerUser;
  }

  private checkIsStoreSelected = () => {
    let storeExists = false;
    if (this.store) {
      storeExists = this.store.some((s) => s.id === this.selectedStoreId);
    }
    this.isValidStoreSelected =
      !isNaN(this.selectedStoreId) &&
      this.selectedStoreId !== null &&
      this.selectedStoreId !== undefined &&
      storeExists;
  };

  private initData() {
    this.initializationData();
  }

  public loadUser(): void {
    this.usersService.getMe(this.helpService.getMe(), (val) => {
      if (val && val.length > 0) {
        this.adminUser = val[0];

        console.log(this.adminUser);
      }
    });
  }

  private updateEventModalLanguage() {
    let editorHeaderTitleElement = document.querySelector(
      "#_dialog_wrapper > #_dialog_wrapper_dialog-header > #_dialog_wrapper_title > .e-title-text"
    );
    if (editorHeaderTitleElement) {
      if (editorHeaderTitleElement.innerHTML === "New Event") {
        editorHeaderTitleElement.innerHTML = this.language.newEventTitle;
      } else if (editorHeaderTitleElement.innerHTML === "Edit Event") {
        editorHeaderTitleElement.innerHTML = this.language.editEventTitle;
      }
    }
    let editorFooter = document.querySelector(
      "#_dialog_wrapper > .e-footer-content"
    );
    if (editorFooter) {
      let deleteBtn = editorFooter.querySelector("button.e-event-delete");
      let cancelBtn = editorFooter.querySelector("button.e-event-cancel");
      let saveBtn = editorFooter.querySelector("button.e-event-save");
      if (deleteBtn) {
        deleteBtn.innerHTML = this.language.delete;
      }
      if (cancelBtn) {
        cancelBtn.innerHTML = this.language.cancel;
      }
      if (saveBtn) {
        saveBtn.innerHTML = this.language.save;
      }
    }
  }

  // load holidays defined by clinic and holidays defined by selected clinic template (if there is some)
  public loadHolidays() {
    const superAdminId = this.helpService.getSuperadmin();

    this.holidayService.getHolidaysForClinic(superAdminId).then((result) => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach((r) => {
          // console.log('R: ', r);
          this.allEvents.push({
            Subject: r.Subject,
            StartTime: new Date(r.StartTime).setHours(Number(this.startWork)),
            EndTime: new Date(r.EndTime).setHours(Number(this.startWork + 1)),
            IsAllDay: false,
          });

          this.holidays.push({
            Subject: r.Subject,
            StartTime: new Date(r.StartTime),
            EndTime: new Date(r.EndTime),
            IsAllDay: true,
          });
        });
      }
    });

    // load holidays defined by clinic and holidays defined by selected clinic template (if there is some)

    this.holidayService.getStoreTemplateConnection(superAdminId).then((ids) => {
      const templateIds = ids.map((elem) => elem.templateId);

      if (ids.length) {
        this.holidayService
          .getHolidaysByTemplates(templateIds)
          .then((result) => {
            if (result && result.length > 0) {
              result.forEach((r) => {
                this.allEvents.push({
                  Subject: r.Subject,
                  StartTime: new Date(r.StartTime).setHours(
                    Number(this.startWork)
                  ),
                  EndTime: new Date(r.EndTime).setHours(
                    Number(this.startWork + 1)
                  ),
                  IsAllDay: false,
                });

                this.holidays.push({
                  Subject: r.Subject,
                  StartTime: new Date(r.StartTime),
                  EndTime: new Date(r.EndTime),
                  IsAllDay: true,
                });
              });
              if (this.scheduleObj) {
                this.scheduleObj.eventSettings.dataSource = this.allEvents;
                this.scheduleObj.refresh();
                this.scheduleObj.refreshEvents();
              }
            } else {
              console.log("no holidayss");
            }
          });
      }
    });
  }

  checkPreselectedStore() {
    if (this.activatedRouter.snapshot.params.storeId) {
      this.setSelectedStoreFromUrl();
      this.filterToolbarInd = false;
      return true;
    }
    return false;
  }

  setSelectedStoreFromUrl() {
    this.selectedStoreId = Number(this.activatedRouter.snapshot.params.storeId);
    this.selectedStoreIdSubject.next();
  }

  initializationConfig() {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
      this.languageUser = JSON.parse(localStorage.getItem("language"));
      // this.stateValue = JSON.parse(localStorage.getItem("language"))["state"];
    } else {
      this.message.getLanguage().subscribe((mess) => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
          console.log(this.language);
        }, 10);
      });
    }

    if (localStorage.getItem("calendarView") !== null) {
      this.selectedViewIndex = Number(localStorage.getItem("calendarView"));
      this.selectedButtonIndex[this.selectedViewIndex] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[this.selectedViewIndex] =
          "activeButton" + this.theme;
      }, 50);
    } else {
      this.selectedButtonIndex[0] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[0] = "activeButton" + this.theme;
      }, 50);
    }

    if (localStorage.getItem("displayToolbar")) {
      this.displayToolbar =
        localStorage.getItem("displayToolbar") === "true" ? true : false;
    }

    if (this.displayToolbar) {
      this.height = this.dynamicSchedulerService.getSchedulerHeight();
    } else {
      this.height =
        this.dynamicSchedulerService.getSchedulerHeightWithoutToolbar();
    }

    /*if (localStorage.getItem("currentView")) {
      this.currentView = localStorage.getItem("currentView") as View;
    }*/
  }

  initializationData() {
    this.loading = true;
    this.type = this.helpService.getType();
    this.id = this.helpService.getMe();
    this.calendars = [];
    const superadmin = this.helpService.getSuperadmin();

    this.initializeEventCategory();

    if (!this.checkPreselectedStore()) {
      if (this.type === 3) {
        this.selectedStoreId = this.storageService.getSelectedStore(this.id);
        this.selectedStoreIdSubject.next();
      }
    }

    this.initializeStore();
    this.initializeTasks();
    this.checkIfPatientUser();
    this.getParameters(superadmin);
  }

  checkIfPatientUser() {
    if (this.type === this.userType.patient) {
      this.accountService.getCustomerWithId(this.id).subscribe((data) => {
        if (data["length"]) {
          this.customerUser = data[0];
        }
      });
    }
  }

  initializeEventCategory() {
    this.eventCategoryService
      .getEventCategory(this.helpService.getSuperadmin())
      .subscribe((data: []) => {
        console.log(data);
        this.eventCategory = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
        const resourcesObject = {
          name: "tasks",
          data: data,
          field: "colorTask",
          valueField: "id",
          textField: "text",
          colorField: "color",
        };
        if (this.eventCategory && this.eventCategory.length > 0) {
          this.selected = this.eventCategory[0].id;
        }
        this.resources = data;
        this.colorPalette = data;
        for (let i = 0; i < data["length"]; i++) {
          this.palette.push(data[i]["color"]);
        }
        console.log(this.resources);
      });
    this.service
      .getEventCategoryStatistic(this.helpService.getSuperadmin())
      .subscribe((data) => {
        this.eventStatisticConfiguration = data;
      });
  }

  initializeStore() {
    if (this.helpService.getType() === this.userType.patient) {
      this.storeService.getStoreAllowedOnline(
        this.helpService.getSuperadmin(),
        (val) => {
          this.store = val;
          this.selectedStoreIdSubject.next();
          this.checkPreselectedForAllowedOnlineStore();
          this.setTimesForStore();
        }
      );
    } else {
      this.storeService.getStore(this.helpService.getSuperadmin(), (val) => {
        this.store = val;
        this.selectedStoreIdSubject.next();
        this.setTimesForStore();
      });
    }
  }

  setEmployeeStore() {
    this.sharedCalendarResources = [];
    this.value = [];
    this.storeService.getStore(this.helpService.getSuperadmin(), (data) => {
      this.store = data;
      this.selectedStoreIdSubject.next();
      for (let i = 0; i < data.length; i++) {
        this.usersService.getUsersInCompany(data[i].id, (users: []) => {
          this.usersInCompany = users;
          for (let j = 0; j < users.length; j++) {
            if (users[j]["id"] === this.helpService.getMe()) {
              this.selectedStoreId = data[i].id;
              this.selectedStoreIdSubject.next();
              this.value.push(users[j]);
              this.sharedCalendarResources = this.value;
              this.handleValue(this.value);
              this.setTimesForStore();
            }
          }
        });
      }
    });
  }

  checkPreselectedForAllowedOnlineStore() {
    let notAllowedOnlinePreselected = true;
    for (let i = 0; i < this.store.length; i++) {
      if (this.store[i].id === this.selectedStoreId) {
        notAllowedOnlinePreselected = false;
        break;
      }
    }
    if (notAllowedOnlinePreselected) {
      if (
        this.store.length &&
        this.activatedRouter.snapshot.params.storeId === undefined
      ) {
        this.selectedStoreId = this.store[0].id;
        this.storageService.setSelectedStore(this.id, this.selected.toString());
        this.getUserInCompany(this.selectedStoreId);
      } else {
        this.selectedStoreId = null;
        this.value = null;
      }
    }
  }

  setTimesForStore() {
    if (this.store.length !== 0) {
      this.language.selectStore += this.store[0].storename + ")";
    }
    if (!isNaN(this.selectedStoreId) && this.selectedStoreId !== undefined) {
      const informationAboutStore = this.getStartEndTimeForStore(
        this.store,
        this.selectedStoreId
      );
      if (informationAboutStore) {
        this.startWork = informationAboutStore
          ? informationAboutStore.start_work
          : null;
        this.endWork = informationAboutStore
          ? informationAboutStore.end_work
          : null;
        this.timeDuration = informationAboutStore
          ? informationAboutStore.time_duration
          : null;
        if (
          informationAboutStore.time_therapy &&
          Number(this.timeDuration) > Number(informationAboutStore.time_therapy)
        ) {
          this.therapyDuration =
            Number(this.timeDuration) /
            Number(informationAboutStore.time_therapy);
        } else {
          this.therapyDuration =
            Number(informationAboutStore.time_therapy) /
            Number(this.timeDuration);
        }
      }
      this.storeName = this.getStoreName(this.selectedStoreId);
      this.helpService.setTitleForBrowserTab(this.storeName);
    } else {
      this.isValidStoreSelected = false;
      this.loading = false;
    }
  }

  checkPersonalSettingsForUser(storeId, defaultStoreSettings) {
    const personalStoreSettings = this.getPersonalSettingsForStore(
      this.storageService.getStoreSettings(),
      storeId
    );

    this.setPersonalOrDefaultSettingsForStore(
      personalStoreSettings,
      defaultStoreSettings
    );

    /*if (this.configurationFromMongoDb) {
      const personalStoreSettings = this.getPersonalSettingsForStore(
        this.configurationFromMongoDb,
        storeId
      );
      this.setPersonalOrDefaultSettingsForStore(
        personalStoreSettings,
        defaultStoreSettings
      );
    } else {
      this.mongo
        .getConfiguration(this.helpService.getMe())
        .subscribe((data) => {
          this.configurationFromMongoDb = data;
          const personalStoreSettings = this.getPersonalSettingsForStore(
            this.configurationFromMongoDb,
            storeId
          );
          this.setPersonalOrDefaultSettingsForStore(
            personalStoreSettings,
            defaultStoreSettings
          );
        });
    }*/
  }

  setPersonalOrDefaultSettingsForStore(
    personalStoreSettings,
    defaultStoreSettings
  ) {
    this.setStartDay(personalStoreSettings, defaultStoreSettings);
    this.setEndDay(personalStoreSettings, defaultStoreSettings);
    this.setStartWorkHour(personalStoreSettings, defaultStoreSettings);
    this.setEndWorkHour(personalStoreSettings, defaultStoreSettings);
    this.setSlotDuration(personalStoreSettings, defaultStoreSettings);
    this.setSlotInterval(personalStoreSettings);
    this.setCalendarView(personalStoreSettings);
    this.setWeekDayChange(personalStoreSettings);

    /*if (Number(this.timeDuration) > Number(defaultStoreSettings.time_therapy)) {
      this.therapyDuration =
        Number(this.timeDuration) / Number(defaultStoreSettings.time_therapy);
    } else {
      this.therapyDuration =
        Number(defaultStoreSettings.time_therapy) / Number(this.timeDuration);
    }*/
  }

  setStartDay(personalStoreSettings, defaultStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.dayStart) {
      this.dayStartHourValue = new Date(
        new Date().setHours(
          Number(personalStoreSettings.dayStart.split(":")[0]),
          Number(personalStoreSettings.dayStart.split(":")[1]),
          0
        )
      );
      this.setCalendarSettingsValue("dayStart", personalStoreSettings.dayStart);
    } else {
      if (defaultStoreSettings) {
        this.dayStartHourValue = new Date(
          new Date().setHours(
            Number(defaultStoreSettings.start_work.split(":")[0]),
            Number(defaultStoreSettings.start_work.toString().split(":")[1]),
            0
          )
        );
      }
    }
  }

  setEndDay(personalStoreSettings, defaultStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.dayEnd) {
      this.dayEndHourValue = new Date(
        new Date().setHours(
          Number(personalStoreSettings.dayEnd.split(":")[0]),
          Number(personalStoreSettings.dayEnd.split(":")[1]),
          0
        )
      );
      this.setCalendarSettingsValue("dayEnd", personalStoreSettings.dayEnd);
    } else {
      if (defaultStoreSettings) {
        this.dayEndHourValue = new Date(
          new Date().setHours(
            Number(defaultStoreSettings.end_work.split(":")[0]),
            Number(defaultStoreSettings.end_work.split(":")[1]),
            0
          )
        );
      }
    }
  }

  setStartWorkHour(personalStoreSettings, defaultStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.dayWorkStart) {
      this.workStartHourValue = new Date(
        new Date().setHours(
          Number(personalStoreSettings.dayWorkStart.split(":")[0]),
          Number(personalStoreSettings.dayWorkStart.split(":")[1]),
          0
        )
      );
      this.setCalendarSettingsValue(
        "dayWorkStart",
        personalStoreSettings.dayWorkStart
      );
    } else {
      if (defaultStoreSettings) {
        this.workStartHourValue = new Date(
          new Date().setHours(
            Number(defaultStoreSettings.start_work.split(":")[0]),
            Number(defaultStoreSettings.start_work.toString().split(":")[1]),
            0
          )
        );
      }
    }
  }

  setEndWorkHour(personalStoreSettings, defaultStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.dayWorkEnd) {
      this.workEndHourValue = new Date(
        new Date().setHours(
          Number(personalStoreSettings.dayWorkEnd.split(":")[0]),
          Number(personalStoreSettings.dayWorkEnd.split(":")[1]),
          0
        )
      );
      this.setCalendarSettingsValue(
        "dayWorkEnd",
        personalStoreSettings.dayWorkEnd
      );
    } else {
      if (defaultStoreSettings) {
        this.workEndHourValue = new Date(
          new Date().setHours(
            Number(defaultStoreSettings.end_work.split(":")[0]),
            Number(defaultStoreSettings.end_work.split(":")[1]),
            0
          )
        );
      }
    }
  }

  setSlotDuration(personalStoreSettings, defaultStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.timeDuration) {
      this.timeSlotDurationValue = Number(personalStoreSettings.timeDuration);
      this.setCalendarSettingsValue(
        "timeDuration",
        personalStoreSettings.timeDuration
      );
    } else {
      if (defaultStoreSettings) {
        this.timeSlotDurationValue = Number(defaultStoreSettings.time_duration);
      }
    }
  }

  setSlotInterval(personalStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.timeSlot) {
      this.timeSlotCountValue = personalStoreSettings.timeSlot;
      this.setCalendarSettingsValue("timeSlot", personalStoreSettings.timeSlot);
    } else {
      this.timeSlotCountValue = 1;
    }
  }

  setWeekDayChange(personalStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.weekDayChange) {
      this.firstDayOfWeek = personalStoreSettings.weekDayChange;
      this.setCalendarSettingsValue(
        "weekDayChange",
        personalStoreSettings.weekDayChange
      );
    }
  }

  setCalendarView(personalStoreSettings) {
    if (personalStoreSettings && personalStoreSettings.currentView) {
      this.currentView = personalStoreSettings.currentView as View;
    } else {
      this.currentView = "WorkWeek" as View;
    }
  }

  getPersonalSettingsForStore(data, storeId) {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === storeId) {
          return data[i];
        }
      }
    }
    return null;
  }

  initializeTasks() {
    this.selectedStoreId = this.storageService.getSelectedStore(this.id);
    this.selectedStoreIdSubject.next();
    if (this.helpService.getType() === this.userType.patient) {
      this.storeService.getStoreAllowedOnline(
        this.helpService.getSuperadmin(),
        (val) => {
          this.store = val;
          this.selectedStoreIdSubject.next();
          if (this.store.length !== 0) {
            this.language.selectStore += this.store[0].storename + ")";
          }
          if (
            !isNaN(this.selectedStoreId) &&
            this.selectedStoreId !== undefined
          ) {
            this.setStoreWork();
          }
        }
      );
    } else if (this.helpService.getType() === this.userType.employee) {
      this.setEmployeeStore();
      this.filterToolbarInd = false;
    } else {
      this.storeService.getStore(this.helpService.getSuperadmin(), (val) => {
        this.store = val;
        this.selectedStoreIdSubject.next();
        if (this.store.length !== 0) {
          this.language.selectStore += this.store[0].storename + ")";
        }
        if (
          !isNaN(this.selectedStoreId) &&
          this.selectedStoreId !== undefined
        ) {
          this.setStoreWork();
        }
      });
    }

    if (
      this.storageService.getSelectedStore(this.id) !== null &&
      this.storageService.getSelectedUser(this.id) !== null &&
      JSON.parse(this.storageService.getSelectedUser(this.id)).length !== 0 &&
      this.type !== 3
    ) {
      this.calendars = [];
      if (!this.checkPreselectedStore()) {
        this.selectedStoreId = this.storageService.getSelectedStore(this.id);
        this.selectedStoreIdSubject.next();
      }
      if (this.activatedRouter.snapshot.params.storeId === undefined) {
        this.value = JSON.parse(
          localStorage.getItem(
            "usersFor-" + this.selectedStoreId + "-" + this.id
          )
        );
      }
      // this.selectedStore(this.selectedStoreId);
      if (this.value && this.value.length !== 0) {
        this.getTaskForSelectedUsers(this.value);
        this.sharedCalendarResources = this.value;
      } else {
        this.packEventsForShow([]);
        this.value = null;
        this.sharedCalendarResources = [];
        this.loading = false;
      }
      this.getUserInCompany(this.selectedStoreId);
    } else if (
      this.storageService.getSelectedStore(this.id) &&
      this.type !== 3
    ) {
      this.calendars = [];
      if (!this.checkPreselectedStore()) {
        this.selectedStoreId = Number(
          this.storageService.getSelectedStore(this.id)
        );
        this.selectedStoreIdSubject.next();
      }
      this.selectedStore(this.selectedStoreId);
    } else if (localStorage.getItem("type") === "3") {
      this.service
        .getWorkandTasksForUser(this.helpService.getMe())
        .subscribe((data) => {
          console.log(data);
          this.events = [];
          if (this.type !== this.userType.patient) {
            this.packEventStatistic(
              data["eventStatistic"],
              this.helpService.getMe()
            );
          }
          // this.workTime = this.packWorkTimeToTask(data["workTime"]);
          this.packEventsForShow(data["events"]);
          const objectCalendar = {
            name: null,
            events: this.events,
            workTime: this.workTime,
          };

          /*this.eventSettings.dataSource =
            this.calendars.push(objectCalendar);*/
          this.loading = false;
          this.sharedCalendarResources = [];
          // this.setStoreWork();
          /// this.setWidthForCalendarHeader();
          ///this.setSplitterBarEvent();
        });
      this.size = [];
      this.size.push("100%");
    } else {
      this.service
        .getTasks(this.helpService.getSuperadmin())
        .subscribe((data) => {
          console.log(data);
          if (data.length !== 0) {
            this.packEventsForShow(data);
            const objectCalendar = {
              name: null,
              events: this.events,
            };
            this.calendars.push(objectCalendar);
            this.loading = false;
            this.sharedCalendarResources = [];
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          } else {
            this.calendars.push({ name: null, events: [] });
          }
          this.size = [];
          this.size.push("100%");
        });
    }
  }

  clearAllSelectedData() {
    if (this.type !== this.userType.patient) {
      this.customerUser = new CustomerModel();
    }
    this.baseDataIndicator = false;
    this.selectedComplaint = null;
    this.selectedTherapies = null;
    this.selectedTreatments = null;
    this.telephoneValue = "";
    this.mobileValue = "";
    this.isConfirm = false;
    this.reminderViaSMS = false;
    this.reminderViaEmail = false;
    this.customerUser.attention = "";
    this.customerUser.physicalComplaint = "";
    this.complaintData = new ComplaintTherapyModel();
    if (this.eventCategory && this.eventCategory.length > 0) {
      this.selected = this.eventCategory[0].id;
    }
    this.createFormLoading = true;
    // setTimeout(() => {
    //   this.fieldName1.toggle(true);
    //   this.fieldName1.focus();
    // }, 100);
  }

  public getNextId(): number {
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  formatDate(start, end) {
    /*const dd = String(start.getDate()).padStart(2, "0");
    const mm = String(start.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = start.getFullYear();
    const hhStart = start.getHours();
    const minStart = start.getMinutes();
    const hhEnd = end.getHours();
    const minEnd = end.getMinutes();
    return (
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hhStart === 0 ? "00" : hhStart) +
      ":" +
      (minStart < 10 ? "0" + minStart : minStart) +
      "-" +
      (hhEnd === 0 ? "00" : hhEnd) +
      ":" +
      (minEnd < 10 ? "0" + minEnd : minEnd)
    );*/
    this.complaintData.date = start;
    const hhStart = start.getHours();
    const minStart = start.getMinutes();
    const hhEnd = end.getHours();
    const minEnd = end.getMinutes();
    this.complaintData.time =
      (hhStart === 0 ? "00" : hhStart) +
      ":" +
      (minStart < 10 ? "0" + minStart : minStart) +
      "-" +
      (hhEnd === 0 ? "00" : hhEnd) +
      ":" +
      (minEnd < 10 ? "0" + minEnd : minEnd);
  }

  addTherapy(customerId) {
    if (customerId) {
      this.complaintData.customer_id = customerId;
    } else {
      this.complaintData.customer_id = this.helpService.getMe();
    }

    this.complaintData.complaint = this.pickToModel(
      this.selectedComplaint,
      this.complaintValue
    ).value;
    this.complaintData.complaint_title = this.pickToModel(
      this.selectedComplaint,
      this.complaintValue
    ).title;

    this.complaintData.therapies = this.pickToModel(
      this.selectedTherapies,
      this.therapyValue
    ).value;
    this.complaintData.therapies_title = this.pickToModel(
      this.selectedTherapies,
      this.therapyValue
    ).title;

    this.complaintData.therapies_previous = this.pickToModel(
      this.selectedTreatments,
      this.treatmentValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatments,
      this.treatmentValue
    ).title;
  }

  getComplaintAndTherapyForCustomer(id) {
    console.log(id);
    this.customer.getTherapyForCustomer(id).subscribe((data) => {
      console.log(data);
      if (data["length"] !== 0) {
        const i = data["length"] - 1;
        this.selectedComplaint = this.stringToArray(data[i]["complaint"]);
        this.selectedTherapies = this.stringToArray(data[i]["therapies"]);
      }
    });
  }

  getSendAdditionalOptionForPatient() {
    this.isConfirm = this.data[0].isConfirm;
    this.reminderViaSMS = this.data[0].reminderViaSMS;
    this.reminderViaEmail = this.data[0].reminderViaEmail;
  }

  newCustomer() {
    // this.zIndex = 'zIndex';
    this.customerModal.open();
    this.data = new UserModel();
    this.data.gender = "male";
    this.data.attention = "";
    this.data.physicalComplaint = "";
    this.data.superadmin = this.helpService.getSuperadmin();
  }

  closeNewCustomer() {
    this.zIndex = "";
    this.customerModal.close();
  }

  createCustomer(form) {
    this.createFormLoading = false;
    this.data.storeId = this.helpService.getSuperadmin();
    this.customer.createCustomer(this.data, (val) => {
      if (val) {
        this.data.id = val.id;
        this.customerUser = this.data;
        this.telephoneValue = this.data.telephone;
        this.mobileValue = this.data.mobile;
        this.baseDataIndicator = true;
        this.reloadNewCustomer();
        this.customerModal.close();
      }
    });
  }

  reloadNewCustomer() {
    this.customerUsers = null;
    setTimeout(() => {
      this.customer.getCustomers(this.helpService.getSuperadmin(), (val) => {
        this.customerUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
        this.loading = false;
        this.setStoreWork();
        this.createFormLoading = true;
      });
    }, 100);
  }

  colorMapToId(task) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].color === task.colorTask) {
        task.colorTask = Number(this.colorPalette[i].id);
      }
    }
    return task;
  }

  IdMapToColor(id) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].id === id) {
        return this.colorPalette[i].color;
      }
    }
    return null;
  }

  baseDataForUser() {
    this.customerUserModal2.open();
  }

  closebaseDataForUser() {
    this.customerUserModal2.close();
  }

  sendLastMinuteOffer() {
    this.lastMinuteOfferSubmitted = true;

    if (
      this.patients.length == 0 ||
      this.selectedStoreId == undefined ||
      this.therapeuts.length == 0 ||
      this.selectedLastMinuteWeekDays.length == 0 ||
      this.lastMinuteHoursValue == 0
    ) {
      this.helpService.errorToastr(
        this.language.errorExecutedActionTitle,
        this.language.errorExecutedActionText
      );
    } else {
      this.patients.forEach((patient) => {
        const url = this.router.createUrlTree(
          [
            location.origin +
              "/" +
              "dashboard/home/customers/last-minute-event",
          ],
          {
            queryParams: {
              user: patient.id,
              therapeuts: this.therapeuts.map(({ id }) => id),
              startDate: this.datePipe.transform(
                this.lastMinuteStartDate,
                "MM/dd/yyyy"
              ),
              endDate: this.datePipe.transform(
                this.lastMinuteEndDate,
                "MM/dd/yyyy"
              ),
              days: this.selectedLastMinuteWeekDays.map(({ value }) => value),
              time: this.lastMinuteHoursValue.map(({ Value }) => Value),
              storeId: this.selectedStoreId,
            },
          }
        );
        const encryptedUrl = this.encryptData(url.toString().split("?")[1]);
        let sendMail = {
          link: encryptedUrl,
          userId: patient.id,
          initialGreeting: this.language.initialGreeting,
          lastMinuteEMailSubject: this.language.lastMinuteEMailSubject,
          finalGreeting: this.language.finalGreeting,
          lastMinuteEMailMessage: this.language.lastMinuteEMailMessage,
          viewLastMinuteOffer: this.language.viewLastMinuteOffer,
          signature: this.language.signature,
          thanksForUsing: this.language.thanksForUsing,
          websiteLink: this.language.websiteLink,
          ifYouHaveQuestion: this.language.ifYouHaveQuestion,
          emailAddress: this.language.emailAddress,
          notReply: this.language.notReply,
          copyRight: this.language.copyRight,
        };

        this.dynamicService
          .callApiPost("/api/sendLastMinuteOfferMails", sendMail)
          .subscribe((data) => {
            this.helpService.successToastr(
              this.language.successExecutedActionTitle,
              this.language.successExecutedActionText
            );
          });
      });

      //clear data
      this.clearLastMinuteForm();
    }
  }

  private clearLastMinuteForm() {
    this.patients = [];
    this.therapeuts = [];
    this.lastMinuteStartDate = new Date();
    this.lastMinuteEndDate = new Date();
    this.selectedLastMinuteWeekDays = [];
    this.lastMinuteHoursValue = [];

    this.msPatients.reset();
    this.msTherapeuts.reset();
    this.msDays.reset();
    this.msLastMinuteTime.reset();
    this.lastMinuteOfferSubmitted = false;
  }

  encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        DynamicSchedulerComponent.secretKey
      ).toString();
    } catch (e) {
      console.log(e);
    }
  }

  public handleValue(selected) {
    this.resetCalendarData();
    this.value = selected;
    this.sharedCalendarResources = selected;
    localStorage.setItem("selectedUser-" + this.id, JSON.stringify(this.value));
    localStorage.setItem(
      "usersFor-" + this.selectedStoreId + "-" + this.id,
      JSON.stringify(this.value)
    );
    this.getTaskForSelectedUsers(this.value);

    const item = {
      user_id: this.helpService.getMe(),
      key: "usersFor-" + this.selectedStoreId + "-" + this.id,
      value: this.value,
    };

    this.mongo.setUsersFor(item).subscribe((data) => {});
    this.isUserSelected = selected && selected.length > 0;
  }

  getTaskForSelectedUsers(value) {
    this.loading = true;
    this.calendars = [];
    if (value.length === 0) {
      this.service
        .getTasksForStore(this.selectedStoreId, this.id, this.type)
        .subscribe((data) => {
          this.calendars = [];
          this.events = [];
          this.packEventsForShow(data);
          const objectCalendar = {
            name: null,
            events: this.events,
          };
          this.calendars.push(objectCalendar);
          this.size = [];
          this.loading = false;
          this.renderTimeInSchedule();
          // this.setStoreWork();
          /// this.setWidthForCalendarHeader();
          /// this.setSplitterBarEvent();
        });
    } else {
      this.calendars = [];
      this.events = [];
      this.allEvents = [];
      let index = 0;
      this.loopIndex = 0;
      this.valueLoop = value;
      this.myLoop();
    }
  }

  myLoop() {
    setTimeout(() => {
      this.service
        .getWorkandTasksForUser(this.valueLoop[this.loopIndex].id)
        .subscribe((data) => {
          this.events = [];
          if (this.type !== this.userType.patient) {
            this.packEventStatistic(
              data["eventStatistic"],
              this.valueLoop[this.loopIndex].id
            );
          }
          this.workTime[this.loopIndex] = this.packWorkTimeToTask(
            data["workTime"]
          );
          const objectCalendar = {
            userId: this.valueLoop[this.loopIndex].id,
            name: this.valueLoop[this.loopIndex].shortname,
            events: this.packEventsForShow(data["events"]),
            workTime: this.workTime,
          };
          this.calendars.push(objectCalendar);
          this.loopIndex++;
          this.splitterSize = this.splitterSizeFull / this.valueLoop.length;
          this.size = [];
          if (this.valueLoop.length === this.loopIndex) {
            this.eventSettings.dataSource = this.allEvents;
            this.loading = false;
            this.renderTimeInSchedule();
            // this.setStoreWork();
          }
          if (this.loopIndex < this.valueLoop.length) {
            this.myLoop();
          }
        });
    }, 100);
    /*const dataManager: DataManager = new DataManager({
      url: "/api/getWorkandTaskForUser/361",
      adaptor: new ODataV4Adaptor(),
      crossDomain: true,
    });

    console.log(dataManager);*/
  }

  packEventsForShow(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].StartTime = new Date(data[i].start);
      data[i].EndTime = new Date(data[i].end);
      data[i].Subject = data[i].title;
      this.events.push(data[i]);
    }
    if (this.allEvents.length) {
      this.allEvents = this.allEvents.concat(data);
    } else {
      this.allEvents = data;
    }

    this.eventSettings.dataSource = this.allEvents;
  }

  packEventStatistic(eventStatistic, userId) {
    for (let p = 0; p < this.eventStatisticConfiguration.length; p++) {
      if (this.eventStatisticConfiguration[p]["display"]) {
        let listOfCategorie =
          this.eventStatisticConfiguration[p]["categorie"].split(",");
        for (let i = 0; i < this.sharedCalendarResources.length; i++) {
          let sum = 0;
          for (let j = 0; j < eventStatistic.length; j++) {
            if (
              this.sharedCalendarResources[i].id ===
                eventStatistic[j].creator_id &&
              userId === eventStatistic[j].creator_id
            ) {
              for (let k = 0; k < listOfCategorie.length; k++) {
                if (eventStatistic[j].id === Number(listOfCategorie[k])) {
                  sum += eventStatistic[j].statistic;
                }
              }
              if (j === eventStatistic.length - 1) {
                if (p === 0) {
                  this.sharedCalendarResources[i].shortname =
                    this.sharedCalendarResources[i].lastname +
                    " " +
                    this.sharedCalendarResources[i].firstname +
                    " - ";
                  this.sharedCalendarResources[i].alias_name =
                    this.sharedCalendarResources[i].lastname +
                    " " +
                    this.sharedCalendarResources[i].firstname +
                    " - ";
                }
                this.sharedCalendarResources[i].shortname +=
                  this.eventStatisticConfiguration[p].shortname + ": " + sum;
                this.sharedCalendarResources[i].alias_name +=
                  this.eventStatisticConfiguration[p].shortname + ": " + sum;
                if (p < this.eventStatisticConfiguration["length"] - 1) {
                  this.sharedCalendarResources[i].shortname += ", ";
                  this.sharedCalendarResources[i].alias_name += ", ";
                }
              }
            }
          }
        }
      }
    }
  }

  selectedStore(event) {
    this.value = null;
    this.loading = true;
    this.calendars = [];
    this.selectedStoreId = event;
    this.selectedStoreIdSubject.next();
    this.storeName = this.getStoreName(event);
    this.helpService.setTitleForBrowserTab(this.storeName);
    this.setStoreWork();
    if (
      localStorage.getItem(
        "usersFor-" + this.selectedStoreId + "-" + this.id
      ) !== null &&
      JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      ).length !== 0 &&
      event !== undefined
    ) {
      if (this.activatedRouter.snapshot.params.storeId === undefined) {
        this.value = JSON.parse(
          localStorage.getItem(
            "usersFor-" + this.selectedStoreId + "-" + this.id
          )
        );
      }
      this.sharedCalendarResources = this.value;
      this.getTaskForSelectedUsers(this.value);
      this.getUserInCompany(event);
      this.storageService.setSelectedStore(this.id, event);
    } else {
      this.value = null;
      if (event !== undefined) {
        this.service
          .getTasksForStore(event, this.id, this.type)
          .subscribe((data) => {
            this.events = [];
            this.calendars = [];
            this.packEventsForShow(data);
            const objectCalendar = {
              name: null,
              events: this.events,
              workTime: undefined,
            };
            if (!isNaN(event)) {
              // this.setStoreWork();
            } else {
              this.startWork = "08:00";
              this.endWork = "22:00";
              this.timeDuration = "60";
              this.therapyDuration = 1;
            }
            this.calendars.push(objectCalendar);
            this.loading = false;
            this.sharedCalendarResources = [];
            this.renderTimeInSchedule();
            /// this.setWidthForCalendarHeader();
            /// this.setSplitterBarEvent();
          });
        this.getUserInCompany(event);
      } else {
        // this.initData();
        this.resetCalendarData();
        this.loading = false;
      }
    }
    this.isUserSelected = this.value && this.value.length > 0;
    const item = {
      user_id: this.helpService.getMe(),
      selectedStore: event,
    };

    /*this.mongo.setSelectedStore(item).subscribe((data) => {
      console.log(data);
    });*/
  }

  getStoreName(id) {
    if (this.store && id) {
      for (let i = 0; i < this.store.length; i++) {
        if (this.store[i].id === id) {
          return this.store[i].storename;
        }
      }
    } else {
      return "Management System";
    }
  }

  setStoreWork() {
    if (this.store !== undefined) {
      const defaultStoreSettings = this.getStartEndTimeForStore(
        this.store,
        this.selectedStoreId
      );

      this.checkPersonalSettingsForUser(
        this.selectedStoreId,
        defaultStoreSettings
      );

      this.storageService.setSelectedStore(
        this.id,
        this.selectedStoreId ? this.selectedStoreId.toString() : null
      );
    }
  }

  getStartEndTimeForStore(data, id) {
    if (data !== null && data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return {
            start_work:
              new Date(data[i].start_work).getHours() +
              ":" +
              new Date(data[i].start_work).getMinutes(),
            end_work:
              new Date(data[i].end_work).getHours() +
              ":" +
              new Date(data[i].end_work).getMinutes(),
            time_duration: data[i].time_duration,
            time_therapy: data[i].time_therapy,
          };
        }
      }
    }
    return null;
  }

  getUserInCompany(storeId) {
    if (this.type === this.userType.patient) {
      this.usersService.getUsersAllowedOnlineInCompany(storeId, (val) => {
        this.usersInCompany = val;
        if (this.activatedRouter.snapshot.params.storeId) {
          this.value = val;
          this.sharedCalendarResources = this.value;
          this.handleValue(val);
        }
      });
    } else {
      this.usersService.getUsersInCompany(storeId, (val) => {
        this.usersInCompany = val;
        if (this.activatedRouter.snapshot.params.storeId) {
          this.value = val;
          this.sharedCalendarResources = this.value;
          this.handleValue(val);
        }
      });
    }
    this.isUserSelected = this.value && this.value.length > 0;
  }

  onRenderCell(event) {
    this.dateFormat(event);
  }

  onEventRendered(args: EventRenderedArgs): void {
    let data: { [key: string]: Object } = args.data;
    args.element.setAttribute("aria-readonly", "true");
    args.element.classList.add("e-read-only");
  }

  dateFormat(date) {
    /*if (
      new Date(this.calendars[i].workTime[j].change) <= new Date(date) &&
      (j + 1 <= this.calendars[i].workTime.length - 1
        ? new Date(date) < new Date(this.calendars[i].workTime[j + 1].change)
        : true) &&
      new Date(date).getDay() - 1 < 5 &&
      new Date(date).getDay() !== 0
    ) {
      if (
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1].end >
          new Date(date).getHours()) ||
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start2 <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
            .end2 > new Date(date).getHours()) ||
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start3 <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
            .end3 > new Date(date).getHours())
      ) {
        return "workTime";
      } else {
        return "none";
      }
    } else {
      return "noTime";
    }*/

    const holiday = this.holidays.find(
      (holiday) =>
        date.date &&
        date.date.getDate() >= holiday.StartTime.getDate() &&
        date.date.getMonth() == holiday.StartTime.getMonth() &&
        date.date.getYear() == holiday.StartTime.getYear() &&
        date.date.getDate() <= holiday.EndTime.getDate() &&
        date.date.getMonth() == holiday.EndTime.getMonth() &&
        date.date.getYear() == holiday.EndTime.getYear()
    );

    if (holiday && date.elementType === "workCells") {
      date.element.style.backgroundColor = "#e9ecef";

      if (
        date.date.getHours() == this.dayStartHourValue.getHours() &&
        date.date.getMinutes() == this.dayStartHourValue.getMinutes()
      ) {
        date.element.innerHTML = holiday.Subject;
      }

      date.element.style.fontSize = "12px";
      date.element.style.padding = "0px";
    }

    if (date.elementType === "resourceHeader") {
      if (date.groupIndex < this.calendars.length - 1) {
        date.element.style.borderRight = "2px solid #6d6d6d";
        return;
      }
    }
    if (date.elementType === "dateHeader") {
      if (this.currentView === "WorkWeek") {
        this.dateHeaderCounter++;
        if (
          this.dateHeaderCounter === 5 &&
          this.calendars.length - 1 > date.groupIndex
        ) {
          date.element.style.borderRight = "2px solid #6d6d6d";
          this.dateHeaderCounter = 0;
          return;
        }
      } else if (this.currentView === "Week" || this.currentView === "Month") {
        this.dateHeaderCounter++;
        if (
          this.dateHeaderCounter === 7 &&
          this.calendars.length - 1 > date.groupIndex
        ) {
          date.element.style.borderRight = "2px solid #6d6d6d";
          this.dateHeaderCounter = 0;
          return;
        }
      } else if (this.currentView === "Day") {
        if (this.calendars.length - 1 > date.groupIndex) {
          date.element.style.borderRight = "2px solid #6d6d6d";
          this.dateHeaderCounter = 0;
          return;
        }
      }
    }
    if (date.elementType === "workCells") {
      if (
        date.groupIndex !== undefined &&
        this.calendars &&
        this.calendars.length > 0 &&
        this.calendars[0].workTime[date.groupIndex]
      ) {
        const groupIndex = date.groupIndex;
        if (
          this.currentView === "WorkWeek" &&
          date.date.getDay() === this.getWorkWeekEndDay() &&
          this.calendars.length - 1 > groupIndex
        ) {
          date.element.style.borderRight = "2px solid #6d6d6d";
        } else if (
          (this.currentView === "Week" || this.currentView === "Month") &&
          date.date.getDay() === this.getWorkEndDay() &&
          this.calendars.length - 1 > groupIndex
        ) {
          date.element.style.borderRight = "2px solid #6d6d6d";
        } else if (this.currentView === "Day") {
          if (this.calendars.length - 1 > groupIndex) {
            date.element.style.borderRight = "2px solid #6d6d6d";
          }
        }
        if (this.calendars[0].workTime[date.groupIndex].length) {
          for (
            let i = 0;
            i < this.calendars[0].workTime[date.groupIndex].length;
            i++
          ) {
            let workItem = this.calendars[0].workTime[date.groupIndex][i];
            if (
              new Date(workItem.change) <= date.date &&
              (i + 1 <= this.calendars[0].workTime[date.groupIndex].length - 1
                ? date.date <
                  new Date(
                    this.calendars[0].workTime[date.groupIndex][i + 1].change
                  )
                : true) &&
              date.date.getDay() - 1 < 5 &&
              date.date.getDay() !== 0
            ) {
              if (
                (workItem.times[date.date.getDay() - 1].start <=
                  date.date.getHours() &&
                  workItem.times[date.date.getDay() - 1].end >
                    date.date.getHours()) ||
                (workItem.times[date.date.getDay() - 1].start2 <=
                  date.date.getHours() &&
                  workItem.times[date.date.getDay() - 1].end2 >
                    date.date.getHours()) ||
                (workItem.times[date.date.getDay() - 1].start3 <=
                  date.date.getHours() &&
                  workItem.times[date.date.getDay() - 1].end3 >
                    date.date.getHours())
              ) {
                date.element.style.background = workItem.color;
                if (this.type === this.userType.readOnlyScheduler) {
                  date.element.style.pointerEvents = "none";
                } else {
                  date.element.style.pointerEvents = "auto";
                }
              } else {
                if (
                  this.type === this.userType.patient ||
                  this.type === this.userType.readOnlyScheduler
                ) {
                  date.element.style.pointerEvents = "none";
                }
              }
            } else {
              if (
                this.type === this.userType.patient ||
                this.type === this.userType.readOnlyScheduler
              ) {
                date.element.style.pointerEvents = "none";
              }
            }
          }
        } else {
          if (
            this.type === this.userType.patient ||
            this.type === this.userType.readOnlyScheduler
          ) {
            date.element.style.pointerEvents = "none";
          }
        }
      } else {
        if (this.type === this.userType.readOnlyScheduler) {
          date.element.style.pointerEvents = "none";
        }
      }
    }
    if (date.elementType === "monthDay") {
      if (
        date.date.getDay() === this.getWorkEndDay() &&
        this.calendars.length - 1 > date.groupIndex
      ) {
        date.element.style.borderRight = "2px solid #6d6d6d";
      }
      if (this.type === this.userType.readOnlyScheduler) {
        date.element.style.pointerEvents = "none";
      }
    }

    if (date.date < new Date() && this.type === this.userType.patient) {
      date.element.classList.add("e-disable-dates");
    }
  }

  getWorkWeekEndDay() {
    if (
      this.scheduleObj.firstDayOfWeek === 0 ||
      this.scheduleObj.firstDayOfWeek === 1 ||
      this.scheduleObj.firstDayOfWeek === 6
    ) {
      return 5;
    } else {
      return this.scheduleObj.firstDayOfWeek - 1;
    }
  }

  getWorkEndDay() {
    if (this.scheduleObj.firstDayOfWeek === 0) {
      return 6;
    } else {
      return this.scheduleObj.firstDayOfWeek - 1;
    }
  }

  convertNumericToDay(numeric) {
    let day = null;
    if (numeric === 1) {
      day = "monday";
    } else if (numeric === 2) {
      day = "tuesday";
    } else if (numeric === 3) {
      day = "wednesday";
    } else if (numeric === 4) {
      day = "thursday";
    } else if (numeric === 5) {
      day = "friday";
    }
    return day;
  }

  packWorkTimeToTask(workTime) {
    let workTimeArray = [];
    const allWorkTime = [];
    let workTimeObject = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < workTime.length; i++) {
      workTimeArray = [];
      for (let j = 1; j < 6; j++) {
        workTimeObject = {
          day: Number(workTime[i][this.convertNumericToDay(j)].split("-")[0]),
          start: workTime[i][this.convertNumericToDay(j)].split("-")[1],
          end: workTime[i][this.convertNumericToDay(j)].split("-")[2],
          start2: workTime[i][this.convertNumericToDay(j)].split("-")[3],
          end2: workTime[i][this.convertNumericToDay(j)].split("-")[4],
          start3: workTime[i][this.convertNumericToDay(j)].split("-")[5],
          end3: workTime[i][this.convertNumericToDay(j)].split("-")[6],
        };
        workTimeArray.push(workTimeObject);
      }
      allWorkTime.push({
        change: workTime[i].dateChange,
        color: workTime[i].color,
        times: workTimeArray,
      });
    }
    console.log(allWorkTime);
    return allWorkTime;
  }

  getParameters(superadmin) {
    this.customer
      .getParameters("Complaint", superadmin)
      .subscribe((data: []) => {
        console.log(data);
        this.complaintValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.customer.getParameters("Therapy", superadmin).subscribe((data: []) => {
      console.log(data);
      this.therapyValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.customer
      .getParameters("Treatment", superadmin)
      .subscribe((data: []) => {
        console.log(data);
        this.treatmentValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.customer.getParameters("CS", superadmin).subscribe((data: []) => {
      this.CSValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.customer.getParameters("State", superadmin).subscribe((data: []) => {
      console.log(data);
      this.stateValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.usersService.getCompanyUsers(this.helpService.getMe(), (val) => {
      console.log(val);
      if (val.length !== 0) {
        this.allUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
      }
    });

    this.parameterItemService.getVATTex(superadmin).subscribe((data: []) => {
      this.vatTaxList = data;
      // console.log(data);
    });

    this.parameterItemService
      .getSuperadminProfile(superadmin)
      .subscribe((data) => {
        this.superadminProfile = data[0];
        this.invoiceID =
          this.superadminProfile.invoicePrefix +
          "-" +
          this.superadminProfile.invoiceID;

        console.log("invoiceID", this.invoiceID);

        this.changedInvoiceID = this.superadminProfile.invoiceID;
      });
  }

  pickToModel(data: any, titleValue) {
    let value = "";
    if (data === undefined || data === null) {
      data = [];
    }
    for (let i = 0; i < data.length; i++) {
      value += data[i] + ";";
    }
    value = value.substring(0, value.length - 1);

    let stringToArray = [];
    if (value.split(";") !== undefined) {
      stringToArray = value.split(";").map(Number);
    } else {
      stringToArray.push(Number(value));
    }
    const title = this.getTitle(titleValue, stringToArray);
    return { value, title };
  }

  stringToArray(data) {
    let array = [];
    const dataArray = data.split(";");
    if (dataArray.length > 0) {
      for (let i = 0; i < dataArray.length; i++) {
        array.push(Number(dataArray[i]));
      }
    } else {
      array.push(Number(data));
    }
    return array;
  }

  getTitle(data, idArray) {
    let value = "";
    for (let i = 0; i < idArray.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (data[j].id === idArray[i]) {
          value += data[j].title + ";";
        }
      }
    }
    return value;
  }

  splitToValue(complaint, therapies, therapies_previous) {
    if (complaint.split(";") !== undefined) {
      this.selectedComplaint = complaint.split(";").map(Number);
    } else {
      this.selectedComplaint = Number(complaint);
    }

    if (therapies.split(";") !== undefined) {
      this.selectedTherapies = therapies.split(";").map(Number);
    } else {
      this.selectedTherapies = Number(therapies);
    }

    if (therapies_previous.split(";") !== undefined) {
      this.selectedTreatments = therapies_previous.split(";").map(Number);
    } else {
      this.selectedTreatments = Number(therapies_previous);
    }
  }

  getTimeString(value: Date): string {
    return this.instance.formatDate(value, { skeleton: "hm" });
  }

  resetCalendarData() {
    this.eventSettings.dataSource = [];
    this.value = null;
    this.allEvents = [];
    this.sharedCalendarResources = null;
  }

  public createFormGroup(args): FormGroup {
    this.baseDataIndicator = false;
    if (this.eventCategory && this.eventCategory.length > 0) {
      this.selected = this.eventCategory[0].id;
    }
    if (
      (isNaN(this.selectedStoreId) ||
        this.selectedStoreId === null ||
        this.selectedStoreId === undefined) &&
      this.type !== 3
    ) {
      this.toastr.success(
        this.language.selectStoreIndicatorTitle,
        this.language.selectStoreIndicatorText,
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
      return this.createFormGroup.bind(this);
    } else {
      const dataItem = args;
      this.createFormLoading = false;
      if (
        typeof dataItem.customer_id === "number" &&
        dataItem.customer_id !== null
      ) {
        this.customerUsers = [];
        this.customer
          .getCustomerWithId(dataItem.customer_id)
          .subscribe((data) => {
            console.log(data);
            this.customerUser = data[0];
            this.customerUsers.push(data[0]);
            this.telephoneValue = data[0].telephone;
            this.mobileValue = data[0].mobile;
            this.isConfirm = data[0].isConfirm;
            this.reminderViaEmail = data[0].reminderViaEmail;
            this.reminderViaSMS = data[0].reminderViaSMS;
            this.dataForReminder = this.packDataForSendReminder(
              data[0].email,
              dataItem.id
            );
            this.baseDataIndicator = true;
            this.userWidth = "65%";
          });
      }

      if (
        this.customerUser !== undefined &&
        this.customerUser !== null &&
        this.customerUser.id !== undefined
      ) {
        this.baseDataIndicator = true;
        this.userWidth = "65%";
      }

      const eventDate = {
        id: args.isNew ? this.getNextId() : dataItem.id,
        isAllDay: dataItem.isAllDay,
        colorTask: dataItem.colorTitle,
        creator_id: this.helpService.getMe(),
        user: this.customerUser,
        therapy_id: dataItem.therapy_id,
        telephone: dataItem.telephone,
        mobile: dataItem.mobile,
        superadmin: dataItem.superadmin,
        confirm: dataItem.confirm,
        description: dataItem.description,
        recurrenceRule: dataItem.recurrenceRule,
        recurrenceId: dataItem.recurrenceId,
      };

      this.selected = dataItem.colorTask;

      if (dataItem.therapy_id !== undefined) {
        this.customer.getTherapy(dataItem.therapy_id).subscribe((data) => {
          console.log(data);
          if (data["length"] !== 0) {
            this.splitToValue(
              data[0].complaint,
              data[0].therapies,
              data[0].therapies_previous
            );
            /*this.usersService.getUserWithId(data[0].em, val => {
                this.selectedUser = val[0];
              });*/
            this.complaintData = data[0];
            this.complaintData.cs = Number(data[0].cs);
            this.complaintData.state = Number(data[0].state);
          }
          this.createFormLoading = true;
        });
      } else {
        this.createFormLoading = true;
      }

      console.log(dataItem.colorTask);
      if (dataItem.colorTask !== undefined) {
        this.selected = dataItem.colorTask;
        console.log(this.selected);
      }

      if (dataItem.telephone !== undefined) {
        this.telephoneValue = dataItem.telephone;
      }
      if (dataItem.mobile !== undefined) {
        this.mobileValue = dataItem.mobile;
      }

      if (dataItem.confirm !== undefined) {
        if (dataItem.confirm === -1) {
          this.isConfirm = 0;
        } else {
          this.isConfirm = 1;
        }
      }
      if (dataItem.reminderViaSMS !== undefined) {
        if (dataItem.reminderViaSMS === -1) {
          this.reminderViaSMS = 0;
        } else {
          this.reminderViaSMS = 1;
        }
      }
      if (dataItem.reminderViaEmail !== undefined) {
        if (dataItem.reminderViaEmail === -1) {
          this.reminderViaEmail = 0;
        } else {
          this.reminderViaEmail = 1;
        }
      }
    }
  }

  convertToDate(date) {
    return new Date(date);
  }

  public saveHandler(
    { sender, formGroup, isNew, dataItem, mode },
    selectedUser
  ): void {
    if (formGroup.valid) {
      let formValue = new EventModel();
      formValue.colorTask = this.selected;
      formValue.telephone = this.telephoneValue;
      formValue.user = this.customerUser;
      formValue.mobile = this.mobileValue;
      formValue.title =
        this.customerUser["lastname"] +
        " " +
        this.customerUser["firstname"] +
        "+" +
        this.complaintData.complaint_title +
        "+" +
        this.complaintData.comment;
      formValue.superadmin = this.helpService.getSuperadmin();
      if (this.type !== 3 && selectedUser !== undefined) {
        formValue.creator_id = selectedUser;
      } else {
        formValue.creator_id = this.helpService.getMe();
      }

      if (isNew) {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["lastname"] +
          " " +
          this.customerUser["firstname"] +
          "+" +
          this.complaintData.complaint_title +
          "+" +
          this.complaintData.comment;
        this.formatDate(this.eventTime.start, this.eventTime.end);
        if (this.isConfirm) {
          formValue.confirm = 0;
        } else {
          formValue.confirm = -1;
        }
        if (this.reminderViaSMS) {
          formValue.reminderViaSMS = 0;
        } else {
          formValue.reminderViaSMS = -1;
        }
        if (this.reminderViaEmail) {
          formValue.reminderViaEmail = 0;
        } else {
          formValue.reminderViaEmail = -1;
        }
        this.customer.addTherapy(this.complaintData).subscribe((data) => {
          if (data["success"]) {
            console.log(data["id"]);
            formValue.therapy_id = data["id"];
            if (this.type === 0) {
              formValue["storeId"] = this.selectedStoreId;
            }
            this.service.createTask(formValue, (val) => {
              console.log(val);
              if (val.success) {
                // this.service.create(formValue);
                this.toastr.success(
                  this.language.successUpdateTitle,
                  this.language.successUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              } else {
                this.toastr.error(
                  this.language.unsuccessUpdateTitle,
                  this.language.unsuccessUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              }
            });

            console.log(this.data);
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"],
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe((data) => {
                console.log(data);
              });
          } else {
            this.toastr.error(
              this.language.unsuccessUpdateTitle,
              this.language.unsuccessUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          }
        });
      } else {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["lastname"] +
          " " +
          this.customerUser["firstname"] +
          "+" +
          this.complaintData.complaint_title +
          "+" +
          this.complaintData.comment;
        this.formatDate(this.eventTime.start, this.eventTime.end);
        if (this.isConfirm) {
          formValue.confirm = 0;
        } else {
          formValue.confirm = -1;
        }
        if (this.reminderViaSMS) {
          formValue.reminderViaSMS = 0;
        } else {
          formValue.reminderViaSMS = -1;
        }
        if (this.reminderViaEmail) {
          formValue.reminderViaEmail = 0;
        } else {
          formValue.reminderViaEmail = -1;
        }
        this.customer.updateTherapy(this.complaintData).subscribe((data) => {
          if (data) {
            this.service.updateTask(formValue, (val) => {
              console.log(val);
              if (val.success) {
                this.toastr.success(
                  this.language.successUpdateTitle,
                  this.language.successUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              } else {
                this.toastr.error(
                  this.language.unsuccessUpdateTitle,
                  this.language.unsuccessUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              }
            });
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"],
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe((data) => {
                console.log(data);
              });
          } else {
            this.toastr.success(
              this.language.unsuccessUpdateTitle,
              this.language.unsuccessUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          }
        });
      }
    } else {
      this.toastr.success(
        this.language.unsuccessUpdateTitle,
        this.language.unsuccessUpdateText,
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
    }
  }

  deleteTask(dataItem): void {
    this.service.deleteTask(dataItem.id).subscribe((data) => {
      if (data) {
        this.customer
          .deleteTherapy(dataItem.therapy_id)
          .subscribe((data_therapy) => {
            if (data_therapy) {
              this.toastr.success(
                this.language.successDeleteTitle,
                this.language.successDeleteText,
                { timeOut: 7000, positionClass: "toast-bottom-right" }
              );
              // this.initializeTasks();
              this.deleteTaskFromScheduler(dataItem);
            }
          });
      }
    });
  }

  deleteTaskFromScheduler(dataItem) {
    for (let i = 0; i < this.allEvents.length; i++) {
      if (this.allEvents[i].id === dataItem.id) {
        this.allEvents.splice(i, 1);
        this.scheduleObj.eventSettings.dataSource = this.allEvents;
        this.scheduleObj.refreshEvents();
      }
    }
  }

  searchCustomer(event) {
    console.log(event);
    if (event !== "" && event.length > 2) {
      this.customerLoading = true;
      const searchFilter = {
        superadmin: this.helpService.getSuperadmin(),
        filter: event,
      };
      this.customer.searchCustomer(searchFilter).subscribe((val: []) => {
        console.log(val);
        this.customerUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerLoading = false;
      });
    } else {
      this.customerUsers = [];
    }
  }

  loadCustomers() {
    this.customer.getCustomers(localStorage.getItem("superadmin"), (val) => {
      this.customerUsers = val.sort((a, b) =>
        String(a["shortname"]).localeCompare(String(b["shortname"]))
      );
      this.customerLoading = false;
    });
  }

  onValueChange(event) {
    console.log(event);
    if (event !== undefined) {
      this.customerUser = event;
      this.telephoneValue = event.telephone;
      this.mobileValue = event.mobile;
      this.isConfirm = event.isConfirm;
      this.reminderViaEmail = event.reminderViaEmail;
      this.reminderViaSMS = event.reminderViaSMS;
      this.getComplaintAndTherapyForCustomer(event.id);
      this.baseDataIndicator = true;
      this.userWidth = "65%";
    } else {
      this.customerUser = {
        attention: "",
        physicalComplaint: "",
      };
      this.telephoneValue = null;
      this.mobileValue = null;
      this.isConfirm = false;
      this.reminderViaSMS = false;
      this.reminderViaEmail = false;
      this.baseDataIndicator = false;
      this.selectedComplaint = null;
      this.selectedTherapies = null;
      this.selectedTreatments = null;
      this.complaintData = new ComplaintTherapyModel();
      this.userWidth = "22%";
    }
  }

  onPopupClose(args: PopupOpenEventArgs) {
    console.log("onPopupClose args: ", args);
    if (args.type === "Editor") {
      if ((this.scheduleObj.eventWindow as any).isCrudAction) {
        if (this.validateRequiredFields()) {
          args.cancel = true;
          this.helpService.errorToastr(
            this.language.allRequiredFieldsMustBeFilledOut,
            ""
          );
        }
      }
    }
  }

  onActionBegin(args: ActionEventArgs) {
    console.log(args);
    console.log(window.innerWidth);
    if (
      window.innerWidth > 992 ||
      this.eventMoveConfirm ||
      args.requestType !== "eventChange"
    ) {
      if (!args) {
        args = this.mobileEventChange;
      }
      if (
        !this.checkConditionForEvent(args) ||
        args.requestType === "dateNavigate" ||
        args.requestType === "eventCreate" ||
        args.requestType === "eventRemove" ||
        args.requestType === "viewNavigate"
      ) {
        if (args.requestType === "eventCreate") {
          let evts = this.scheduleObj.getEvents(
            this.eventTime.start,
            this.eventTime.end
          );
          if (evts.length > 0 && this.type === this.userType.patient) {
            this.toastr.error(
              this.language.eventAlreadyExistsText,
              this.language.eventAlreadyExistsTitle,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          } else {
            this.createNewTask();
          }

          args.cancel = true;
        } else if (args.requestType === "eventChange") {
          const eventData: any = args.data;
          const startTime = this.eventTime.start
            ? this.eventTime.start
            : eventData.start;
          const endTime = this.eventTime.end
            ? this.eventTime.end
            : eventData.end;
          let evts = this.scheduleObj.getEvents(startTime, endTime);
          if (evts.length > 1 && this.type === this.userType.patient) {
            this.toastr.error(
              this.language.eventAlreadyExistsText,
              this.language.eventAlreadyExistsTitle,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          } else if (
            this.currentEventAction !== TypeOfEventAction.Drag &&
            this.type !== this.userType.patient
          ) {
            this.updateTask(args);
          }
          args.cancel = true;
        } else if (args.requestType === "eventRemove") {
          // this.deleteTask(args.deletedRecords[0]);
          const eventDetails: { [key: string]: Object } = this.scheduleObj
            .activeEventData.event as { [key: string]: Object };
          let currentAction: CurrentAction;
          if (eventDetails.RecurrenceRule) {
            currentAction = "DeleteOccurrence";
          }
          this.deleteTask(eventDetails);
          // this.scheduleObj.deleteEvent(eventDetails, currentAction);
        }
        this.initializeCalendar();
      } else {
        args.cancel = true;
      }
      this.eventMoveConfirm = false;
      this.modalConfirmEventMove = false;
    } else if (args.requestType === "eventChange") {
      this.modalConfirmEventMove = true;
      this.eventMoveConfirm = true;
      this.mobileEventChange = args;
    }
  }

  checkConditionForEvent(args) {
    if (
      (this.type === this.userType.patient &&
        args.data &&
        args.data["customer_id"] &&
        args.data["customer_id"] === this.id) ||
      this.type !== this.userType.patient
    ) {
      return false;
    } else {
      return true;
    }
  }

  initializeCalendar() {
    this.dateHeaderCounter = 0;
  }

  onValueChangeCS(event) {
    this.complaintData.cs_title = this.getTitleForCS(event);
  }

  onValueUserEmChange(event) {
    this.complaintData.em = event.id;
    this.complaintData.em_title = event.lastname + " " + event.firstname;
  }

  getTitleForCS(id) {
    if (this.CSValue) {
      for (let i = 0; i < this.CSValue.length; i++) {
        if (this.CSValue[i].id === id) {
          return this.CSValue[i].title;
        }
      }
    }
    return null;
  }

  public onButtonClick(): void {
    this.scheduleObj.deleteEvent(910);
    // this.deleteButton.element.setAttribute("disabled", "true");
  }

  refreshEvents() {
    this.initializeTasks();
  }

  public onExportClick(): void {
    const exportValues: ExportOptions = {
      fields: ["Id", "Subject", "StartTime", "EndTime", "Location"],
    };
    this.scheduleObj.exportToExcel(exportValues);
  }

  printCalendar() {
    this.scheduleObj.print();
  }

  exportCalendar() {
    const exportValues: ExportOptions = {
      fields: ["id", "Subject", "StartTime", "EndTime"],
    };
    this.scheduleObj.exportToExcel(exportValues);
  }

  onItemDrag(event) {
    if (this.type === this.userType.patient) {
      this.currentEventAction = TypeOfEventAction.Drag;
    } else {
      this.currentEventAction = null;
    }
    this.eventTime.start = event.startTime;
    this.eventTime.end = event.endTime;
    this.selected = null;
    this.customerUser.id = null;
  }

  hideToolbar() {
    if (this.displayToolbar) {
      this.displayToolbar = false;
      this.height =
        this.dynamicSchedulerService.getSchedulerHeightWithoutToolbar();
      this.hideAllPanels();
    } else {
      this.displayToolbar = true;
      this.height = this.dynamicSchedulerService.getSchedulerHeight();
    }
    this.scheduleObj.refresh();
    localStorage.setItem("displayToolbar", this.displayToolbar.toString());
  }

  hideAllPanels() {
    const filterPanel: Element = document.querySelector(
      ".overview-content .filter-panel"
    );
    const settingsPanel: Element = document.querySelector(
      ".overview-content .settings-panel"
    );
    const lastMinutePanel: Element = document.querySelector(
      ".overview-content .last-minute-panel"
    );
    addClass([filterPanel], "hide");
    addClass([settingsPanel], "hide");
    addClass([lastMinutePanel], "hide");
  }

  selectedEventCategory(event) {
    this.selected = event;
  }

  sendAgainConfirmMail(dataItem) {
    this.confirmArrivalData = {
      id: dataItem.id,
      name: dataItem.title.split("+")[0],
      customer_id: dataItem.customer_id,
      language: this.packLanguage.getLanguageForConfirmArrival(),
    };
    this.requestForConfirmArrival = true;
  }

  requestForConfirmArrivalAnswer(answer) {
    console.log(answer);
    if (answer === "yes") {
      this.service
        .sendConfirmArrivalAgain(this.confirmArrivalData)
        .subscribe((data) => {
          console.log(data);
        });

      this.toastr.success(
        this.language.successTitle,
        this.language.successTextConfirmArrival.replace(
          "{{QUOTE}}",
          this.confirmArrivalData.name
        ),
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
    }
    this.requestForConfirmArrival = false;
  }

  packDataForSendReminder(email, taskId) {
    return {
      email: email,
      mobile: this.mobileValue,
      telephone: this.telephoneValue,
      start: this.eventTime.start,
      end: this.eventTime.end,
      shortname: this.customerUser.shortname,
      storename: this.storeName,
      storeId: this.selectedStoreId,
      therapy: this.complaintData.therapies_title,
      id: this.customerUser.id,
      taskId: taskId,
      countryCode: this.helpService.getLocalStorage("countryCode"),
    };
  }

  expandAdditionalOption() {
    this.expandAddional = !this.expandAddional;
    if (this.expandAddional) {
      this.expandAdditionalIcon = "k-icon k-i-arrow-60-down";
    } else {
      this.expandAdditionalIcon = "k-icon k-i-arrow-60-right";
    }
  }

  expandPdfOptions() {
    this.expandPdf = !this.expandPdf;
    if (this.expandPdf) {
      this.expandPdfIcon = "k-icon k-i-arrow-60-down";
    } else {
      this.expandPdfIcon = "k-icon k-i-arrow-60-right";
    }
  }

  closeCustomerModal() {
    this.customerModal.close();
    this.reloadNewCustomer();
  }

  copyLinkToTheClinic() {
    this.helpService.copyToClipboard(
      this.helpService.getFullHostName() +
        "/dashboard/home/task/" +
        this.selectedStoreId
    );
    this.helpService.successToastr(
      this.language.successCopiedLinkForClinicReservation,
      ""
    );
  }

  private updateInvoiceID(): void {
    if (this.invoiceID !== this.changedInvoiceID) {
      const data = {
        superAdminId: this.superadminProfile.id,
        id: this.changedInvoiceID,
      };
      console.log("updateInvoiceID");

      this.invoiceService.updateInvoiceID(data).then(() => {
        this.invoiceID = this.changedInvoiceID;
      });
    }
  }

  public downloadPDF(): void {
    const docDefinition = this.setupPDF();

    // pass file name
    pdfMake
      .createPdf(docDefinition)
      .download(this.customerUser["firstname"] + this.customerUser["lastname"]);

    this.updateInvoiceID();
  }

  public printPDF(): void {
    const docDefinition = this.setupPDF();
    pdfMake.createPdf(docDefinition).print();

    this.updateInvoiceID();
  }

  private setupPDF() {
    const selectedStore = this.store.filter(
      (s) => (s.id = this.selectedStoreId)
    )[0];

    const therapies = [];
    const netPrices = [];
    const brutoPrices = [];
    let bruto = 0;
    for (let i = 0; i < this.selectedTherapies.length; i++) {
      const id = this.selectedTherapies[i];
      const therapy = this.therapyValue.find((therapy) => therapy.id == id);

      if (therapy) {
        const vatDefinition = this.vatTaxList.find(
          (elem) => elem.id === therapy.vat
        );
        // console.log(vatDefinition);

        therapy.date = this.dateService.formatDate(
          new Date(this.eventTime.start).toLocaleDateString("en-CA").toString()
        );

        console.log("temp.date", therapy.date);

        const isNaNPrice = isNaN(parseFloat(therapy.net_price));

        if (isNaNPrice) {
          console.log("Not a number: ", therapy.net_price);
        }

        isNaNPrice
          ? netPrices.push(-1)
          : netPrices.push(parseFloat(therapy.net_price));

        if (!isNaNPrice) {
          if (vatDefinition) {
            bruto =
              parseFloat(therapy.net_price) *
              (1 + Number(vatDefinition.title) / 100);
          } else {
            bruto = parseFloat(therapy.net_price) * (1 + 20 / 100);
          }
          brutoPrices.push(bruto);
        } else {
          brutoPrices.push(-1);
        }

        const shouldSetDate =
          (this.selectedTherapies.length > 1 && i == 0) ||
          this.selectedTherapies.length === 1 ||
          !this.isDateSet;

        // console.log(shouldSetDate + ' should set date');

        therapies.push({
          title:
            therapy.titleOnInvoice && therapy.titleOnInvoice.trim() !== ""
              ? therapy.titleOnInvoice
              : therapy.title,
          date: shouldSetDate ? therapy.date : "",
          net_price: isNaNPrice
            ? this.language.noDataAvailable
            : this.language.euroSign +
              " " +
              parseFloat(therapy.net_price).toFixed(2),
          vat: vatDefinition ? vatDefinition.title : 20,
          gross_price: isNaNPrice
            ? this.language.noDataAvailable
            : this.language.euroSign + " " + bruto.toFixed(2),
        });
      }
    }

    const filteredNetPrices = netPrices.filter(
      (num) => !isNaN(parseFloat(num))
    );
    const filteredBrutoPrices = brutoPrices.filter(
      (num) => !isNaN(parseFloat(num))
    );
    let vatValues = brutoPrices.map(function (item, index) {
      // In this case item correspond to currentValue of array a,
      // using index to get value from array b
      return item - netPrices[index];
    });
    const vat = vatValues.reduce((a, b) => a + b, 0).toFixed(2);
    const subtotal = filteredNetPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = filteredBrutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    let docDefinition = {
      header: {
        columns: [
          {
            text: this.language.invoiceSubTitle + " " + this.invoiceID,
            style: "documentHeaderLeft",
            width: "*",
          },
          {
            text:
              this.language.dateTitle +
              " " +
              this.dateService.currentDateFormatted,
            style: "documentHeaderRight",
            width: "*",
          },
        ],
      },
      content: [
        // Header
        {
          columns: [
            [
              {
                text: "\n" + this.language.invoiceTitle,
                style: "invoiceTitle",
                width: "*",
              },
              {
                columns: [
                  {
                    text: "\n",
                    style: "invoiceSubTitle",
                    width: "*",
                  },
                  {
                    text: "\n",
                    style: "invoiceSubValue",
                    width: "*",
                  },
                ],
              },
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: this.language.invoiceBillingTitleFrom + "\n \n",
              style: "invoiceBillingTitleLeft",
            },
            {
              text: this.language.invoiceBillingTitleTo + "\n \n",
              style: "invoiceBillingTitleRight",
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text:
                selectedStore.storename +
                "\n" +
                this.superadminProfile.shortname,
              style: "invoiceBillingDetailsLeft",
            },
            {
              text:
                this.customerUser.lastname.trim() +
                " " +
                this.customerUser.firstname.trim(),
              style: "invoiceBillingDetailsRight",
            },
          ],
        },
        // Billing Address
        {
          columns: [
            {
              text: selectedStore.vatcode
                ? selectedStore.street +
                  "\n " +
                  selectedStore.zipcode +
                  " " +
                  selectedStore.place +
                  "\n" +
                  this.language.vatIdentificationNumber +
                  " " +
                  selectedStore.vatcode
                : selectedStore.street +
                  "\n " +
                  selectedStore.zipcode +
                  " " +
                  selectedStore.place +
                  "\n" +
                  this.language.vatIdentificationNumber +
                  " " +
                  this.superadminProfile.vatcode,
              style: "invoiceBillingAddressLeft",
            },
            {
              text:
                this.customerUser["street"] +
                "\n" +
                this.customerUser["streetnumber"] +
                " " +
                this.customerUser["city"] +
                "\n",
              style: "invoiceBillingAddressRight",
            },
          ],
        },
        // Line breaks
        "\n\n",
        // Items
        {
          layout: {
            // code from lightHorizontalLines:
            hLineWidth: function (i, node) {
              if (i === 0) {
                return 0;
              }
              return i === node.table.headerRows ? 2 : 1;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i) {
              return "black";
            },
            paddingLeft: function (i) {
              return i === 0 ? 0 : 8;
            },
            paddingRight: function (i, node) {
              return i === node.table.widths.length - 1 ? 0 : 8;
            },
          },
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ["20%", "20%", "20%", "20%", "20%"],
            body: this.pdfService.createItemsTable(therapies),
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // Line break
        "\n",
        // TOTAL
        {
          columns: [
            {
              text: "",
              width: "20%",
            },
            {
              text: "",
              width: "20%",
            },
            {
              text:
                netPrices.length === 0
                  ? this.language.noDataAvailable
                  : this.language.euroSign + " " + subtotal,
              style: "itemsFooterSubValue",
              width: "20%",
            },
            {
              text:
                netPrices.length === 0
                  ? this.language.noDataAvailable
                  : this.language.euroSign + " " + vat,
              style: "itemsFooterVATValue",
              width: "20%",
            },
            {
              text:
                brutoPrices.length === 0
                  ? this.language.noDataAvailable
                  : this.language.euroSign + " " + total,
              style: "itemsFooterTotalValue",
              width: "20%",
            },
          ],
        },
        {
          text: this.language.notesTitle,
          style: "notesTextBold",
        },
        {
          text: this.language.notesText,
          style: "notesText",
        },
      ],
      footer: {
        columns: [
          {
            text:
              selectedStore.storename +
              " " +
              this.superadminProfile.shortname +
              this.dotSign +
              selectedStore.street +
              this.dotSign +
              selectedStore.zipcode +
              " " +
              selectedStore.place +
              "\n" +
              selectedStore.telephone +
              this.dotSign +
              selectedStore.email,
            style: "documentFooter",
          },
        ],
      },
      styles: this.pdfService.getStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };

    return docDefinition;
  }
  private dotSign = " • ";
}
