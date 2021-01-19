import { EventCategoryService } from './../../../service/event-category.service';
import { UsersService } from './../../../service/users.service';
import { StoreService } from './../../../service/store.service';
import { Component, ViewEncapsulation, Inject, ViewChild, OnInit, NgZone, HostListener } from '@angular/core';
import { ItemModel } from '@syncfusion/ej2-angular-splitbuttons';
import { SelectedEventArgs, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import {
  ScheduleComponent, GroupModel, DayService, WeekService, WorkWeekService, MonthService, YearService, AgendaService,
  TimelineViewsService, TimelineMonthService, TimelineYearService, View, EventSettingsModel, Timezone, CurrentAction,
  CellClickEventArgs, ResourcesModel, EJ2Instance
} from '@syncfusion/ej2-angular-schedule';
import { addClass, extend, removeClass, closest, remove, isNullOrUndefined, Internationalization } from '@syncfusion/ej2-base';
import { ChangeEventArgs as SwitchEventArgs } from '@syncfusion/ej2-angular-buttons';
import { ChangeEventArgs, MultiSelectChangeEventArgs, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DataManager, Predicate, Query } from '@syncfusion/ej2-data';
import {
  ClickEventArgs, ContextMenuComponent, MenuItemModel, BeforeOpenCloseMenuEventArgs, MenuEventArgs
} from '@syncfusion/ej2-angular-navigations';
import { ChangeEventArgs as TimeEventArgs } from '@syncfusion/ej2-calendars';
import { TaskService } from '../../../service/task.service';
import { CustomersService } from '../../../service/customers.service';
import { MessageService } from '../../../service/message.service';
import { MongoService } from '../../../service/mongo.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicSchedulerService } from 'src/app/service/dynamic-scheduler.service';
import { ComplaintTherapyModel } from 'src/app/models/complaint-therapy-model';
import { UserModel } from 'src/app/models/user-model';
import { CustomerModel } from 'src/app/models/customer-model';
import { CustomersComponent } from '../../dashboard/customers/customers.component';
import { SchedulerComponent, SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { FormGroup } from '@angular/forms';
import { Modal } from 'ngx-modal';
declare var moment: any;

@Component({
  selector: 'app-dynamic-scheduler',
  templateUrl: './dynamic-scheduler.component.html',
  styleUrls: ['./dynamic-scheduler.component.scss'],
  providers: [DayService, WeekService, WorkWeekService, MonthService, YearService, AgendaService,
    TimelineViewsService, TimelineMonthService, TimelineYearService],
  encapsulation: ViewEncapsulation.None
})
export class DynamicSchedulerComponent implements OnInit {

  @ViewChild('scheduleObj') scheduleObj: ScheduleComponent;
  @ViewChild('eventTypeObj') eventTypeObj: DropDownListComponent;
  @ViewChild('titleObj') titleObj: TextBoxComponent;
  @ViewChild('notesObj') notesObj: TextBoxComponent;
  public showFileList: Boolean = false;
  public multiple: Boolean = false;
  public buttons: Object = { browse: 'Import' };
  public intl: Internationalization = new Internationalization();
  public currentView: View = 'Week';
  public liveTimeUpdate: String = new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' });
  public group: GroupModel = { resources: ['sharedCalendar'] };
  public resourceDataSource: Object[] = [
    { CalendarText: 'My Calendar', CalendarId: 1, CalendarColor: '#c43081' },
    { CalendarText: 'Company', CalendarId: 2, CalendarColor: '#ff7f50' },
    { CalendarText: 'Birthday', CalendarId: 3, CalendarColor: '#AF27CD' },
    { CalendarText: 'Holiday', CalendarId: 4, CalendarColor: '#808000' }
  ];
  public resourceQuery: Query = new Query().where('CalendarId', 'equal', 1);
  public allowMultiple: Boolean = true;
  public isTimelineView: Boolean = false;
  public exportItems: ItemModel[] = [
    { text: 'iCalendar', iconCss: 'e-icons e-schedule-ical-export' },
    { text: 'Excel', iconCss: 'e-icons e-schedule-excel-export' }
  ];
  public checkboxMode: String = 'CheckBox';
  public firstDayOfWeek: Number = 0;
  public workDays: Number[] = [1, 2, 3, 4, 5];
  public calendarsValue: Number[] = [1];
  public fields: Object = { text: 'text', value: 'value' };
  public calendarFields: Object = { text: 'CalendarText', value: 'CalendarId' };
  public dayStartHourValue: Date = new Date(new Date().setHours(0, 0, 0));
  public dayEndHourValue: Date = new Date(new Date().setHours(23, 59, 59));
  public workStartHourValue: Date = new Date(new Date().setHours(9, 0, 0));
  public workEndHourValue: Date = new Date(new Date().setHours(18, 0, 0));
  public weekDays: Object[] = [
    { text: 'Sunday', value: 0 },
    { text: 'Monday', value: 1 },
    { text: 'Tuesday', value: 2 },
    { text: 'Wednesday', value: 3 },
    { text: 'Thursday', value: 4 },
    { text: 'Friday', value: 5 },
    { text: 'Saturday', value: 6 }
  ];
  public timezoneData: Object[] = [
    { text: 'UTC -12:00', value: 'Etc/GMT+12' },
    { text: 'UTC -11:00', value: 'Etc/GMT+11' },
    { text: 'UTC -10:00', value: 'Etc/GMT+10' },
    { text: 'UTC -09:00', value: 'Etc/GMT+9' },
    { text: 'UTC -08:00', value: 'Etc/GMT+8' },
    { text: 'UTC -07:00', value: 'Etc/GMT+7' },
    { text: 'UTC -06:00', value: 'Etc/GMT+6' },
    { text: 'UTC -05:00', value: 'Etc/GMT+5' },
    { text: 'UTC -04:00', value: 'Etc/GMT+4' },
    { text: 'UTC -03:00', value: 'Etc/GMT+3' },
    { text: 'UTC -02:00', value: 'Etc/GMT+2' },
    { text: 'UTC -01:00', value: 'Etc/GMT+1' },
    { text: 'UTC +00:00', value: 'Etc/GMT' },
    { text: 'UTC +01:00', value: 'Etc/GMT-1' },
    { text: 'UTC +02:00', value: 'Etc/GMT-2' },
    { text: 'UTC +03:00', value: 'Etc/GMT-3' },
    { text: 'UTC +04:00', value: 'Etc/GMT-4' },
    { text: 'UTC +05:00', value: 'Etc/GMT-5' },
    { text: 'UTC +05:30', value: 'Asia/Calcutta' },
    { text: 'UTC +06:00', value: 'Etc/GMT-6' },
    { text: 'UTC +07:00', value: 'Etc/GMT-7' },
    { text: 'UTC +08:00', value: 'Etc/GMT-8' },
    { text: 'UTC +09:00', value: 'Etc/GMT-9' },
    { text: 'UTC +10:00', value: 'Etc/GMT-10' },
    { text: 'UTC +11:00', value: 'Etc/GMT-11' },
    { text: 'UTC +12:00', value: 'Etc/GMT-12' },
    { text: 'UTC +13:00', value: 'Etc/GMT-13' },
    { text: 'UTC +14:00', value: 'Etc/GMT-14' }
  ];
  public timeSlotDuration: Object[] = [
    { Name: '1 hour', Value: 60 },
    { Name: '1.5 hours', Value: 90 },
    { Name: '2 hours', Value: 120 },
    { Name: '2.5 hours', Value: 150 },
    { Name: '3 hours', Value: 180 },
    { Name: '3.5 hours', Value: 210 },
    { Name: '4 hours', Value: 240 },
    { Name: '4.5 hours', Value: 270 },
    { Name: '5 hours', Value: 300 },
    { Name: '5.5 hours', Value: 330 },
    { Name: '6 hours', Value: 360 },
    { Name: '6.5 hours', Value: 390 },
    { Name: '7 hours', Value: 420 },
    { Name: '7.5 hours', Value: 450 },
    { Name: '8 hours', Value: 480 },
    { Name: '8.5 hours', Value: 510 },
    { Name: '9 hours', Value: 540 },
    { Name: '9.5 hours', Value: 570 },
    { Name: '10 hours', Value: 600 },
    { Name: '10.5 hours', Value: 630 },
    { Name: '11 hours', Value: 660 },
    { Name: '11.5 hours', Value: 690 },
    { Name: '12 hours', Value: 720 }
  ];
  public timeSlotFields = { text: 'Name', value: 'Value' };
  public timeSlotCount: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public timeSlotDurationValue: Number = 60;
  public timeSlotCountValue: Number = 2;
  public eventSettings: EventSettingsModel = {
    dataSource: [/*{
      'colorTask': 13,
      "StartTime": new Date("2021-01-20T11:30:00.000Z"),
      "EndTime": new Date("2021-01-20T12:30:00.000Z"),
      "Subject": "Doe Test+Kopfschmerzen;"
    }*/]
  };
  @ViewChild('menuObj')
  public menuObj: ContextMenuComponent;
  public selectedTarget: Element;
  public menuItems: MenuItemModel[] = [
    { text: 'New Event', iconCss: 'e-icons new', id: 'Add' },
    { text: 'New Recurring Event', iconCss: 'e-icons recurrence', id: 'AddRecurrence' },
    { text: 'Today', iconCss: 'e-icons today', id: 'Today' },
    { text: 'Edit Event', iconCss: 'e-icons edit', id: 'Save' },
    {
      text: 'Edit Event', id: 'EditRecurrenceEvent', iconCss: 'e-icons edit',
      items: [
        { text: 'Edit Occurrence', id: 'EditOccurrence' },
        { text: 'Edit Series', id: 'EditSeries' }
      ]
    },
    { text: 'Delete Event', iconCss: 'e-icons delete', id: 'Delete' },
    {
      text: 'Delete Event', id: 'DeleteRecurrenceEvent', iconCss: 'e-icons delete',
      items: [
        { text: 'Delete Occurrence', id: 'DeleteOccurrence' },
        { text: 'Delete Series', id: 'DeleteSeries' }
      ]
    }
  ];

  public generateEvents(): Object[] {
    const eventData: Object[] = [];
    const eventSubjects: string[] = [
      'Bering Sea Gold', 'Technology', 'Maintenance', 'Meeting', 'Travelling', 'Annual Conference', 'Birthday Celebration',
      'Farewell Celebration', 'Wedding Aniversary', 'Alaska: The Last Frontier', 'Deadest Catch', 'Sports Day', 'MoonShiners',
      'Close Encounters', 'HighWay Thru Hell', 'Daily Planet', 'Cash Cab', 'Basketball Practice', 'Rugby Match', 'Guitar Class',
      'Music Lessons', 'Doctor checkup', 'Brazil - Mexico', 'Opening ceremony', 'Final presentation'
    ];
    const weekDate: Date = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
    let startDate: Date = new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate(), 10, 0);
    let endDate: Date = new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate(), 11, 30);
    eventData.push({
      Id: 1,
      Subject: eventSubjects[Math.floor(Math.random() * (24 - 0 + 1) + 0)],
      StartTime: startDate,
      EndTime: endDate,
      Location: '',
      Description: 'Event Scheduled',
      RecurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1;COUNT=10;',
      IsAllDay: false,
      IsReadonly: false,
      CalendarId: 1
    });
    for (let a = 0, id = 2; a < 500; a++) {
      const month: number = Math.floor(Math.random() * (11 - 0 + 1) + 0);
      const date: number = Math.floor(Math.random() * (28 - 1 + 1) + 1);
      const hour: number = Math.floor(Math.random() * (23 - 0 + 1) + 0);
      const minutes: number = Math.floor(Math.random() * (59 - 0 + 1) + 0);
      const start: Date = new Date(new Date().getFullYear(), month, date, hour, minutes, 0);
      const end: Date = new Date(start.getTime());
      end.setHours(end.getHours() + 2);
      startDate = new Date(start.getTime());
      endDate = new Date(end.getTime());
      eventData.push({
        Id: id,
        Subject: eventSubjects[Math.floor(Math.random() * (24 - 0 + 1) + 0)],
        StartTime: startDate,
        EndTime: endDate,
        Location: '',
        Description: 'Event Scheduled',
        IsAllDay: id % 10 === 0,
        IsReadonly: endDate < new Date(),
        CalendarId: (a % 4) + 1
      });
      id++;
    }
    if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
      Timezone.prototype.offset = (date: Date, zone: string): number => moment.tz.zone(zone).utcOffset(date.getTime());
    }
    const overviewEvents: { [key: string]: Date }[] = extend([], eventData, null, true) as { [key: string]: Date }[];
    const timezone: Timezone = new Timezone();
    const utcTimezone: never = 'UTC' as never;
    const currentTimezone: never = timezone.getLocalTimezoneName() as never;
    for (const event of overviewEvents) {
      event.StartTime = timezone.convert(event.StartTime, utcTimezone, currentTimezone);
      event.EndTime = timezone.convert(event.EndTime, utcTimezone, currentTimezone);
    }
    return overviewEvents;
  }

  public onToolbarCreated(): void {
    setInterval(() => { this.updateLiveTime(this.scheduleObj ? this.scheduleObj.timezone : 'UTC'); }, 1000);
  }

  public onToolbarItemClicked(args: ClickEventArgs): void {
    switch (args.item.text) {
      case 'Day':
        this.currentView = this.isTimelineView ? 'TimelineDay' : 'Day';
        break;
      case 'Week':
        this.currentView = this.isTimelineView ? 'TimelineWeek' : 'Week';
        break;
      case 'WorkWeek':
        this.currentView = this.isTimelineView ? 'TimelineWorkWeek' : 'WorkWeek';
        break;
      case 'Month':
        this.currentView = this.isTimelineView ? 'TimelineMonth' : 'Month';
        break;
      case 'Year':
        this.currentView = this.isTimelineView ? 'TimelineYear' : 'Year';
        break;
      case 'Agenda':
        this.currentView = 'Agenda';
        break;
      case 'New Event':
        const eventData: Object = this.getEventData();
        this.scheduleObj.openEditor(eventData, 'Add', true);
        break;
      case 'New Recurring Event':
        const recEventData: Object = this.getEventData();
        this.scheduleObj.openEditor(recEventData, 'Add', true, 1);
        break;
    }
  }

  private getEventData(): Object {
    const date: Date = this.scheduleObj.selectedDate;
    return {
      Id: this.scheduleObj.getEventMaxID(),
      Subject: '',
      StartTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), new Date().getHours(), 0, 0),
      EndTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), new Date().getHours() + 1, 0, 0),
      Location: '',
      Description: '',
      IsAllDay: false,
      CalendarId: 1
    };
  }

  public updateLiveTime(timezone: string = 'UTC'): void {
    this.liveTimeUpdate = new Date().toLocaleTimeString('en-US', { timeZone: timezone });
  }

  public onTimelineViewChange(args: SwitchEventArgs): void {
    this.isTimelineView = args.checked;
    switch (this.scheduleObj.currentView) {
      case 'Day':
      case 'TimelineDay':
        this.currentView = this.isTimelineView ? 'TimelineDay' : 'Day';
        break;
      case 'Week':
      case 'TimelineWeek':
        this.currentView = this.isTimelineView ? 'TimelineWeek' : 'Week';
        break;
      case 'WorkWeek':
      case 'TimelineWorkWeek':
        this.currentView = this.isTimelineView ? 'TimelineWorkWeek' : 'WorkWeek';
        break;
      case 'Month':
      case 'TimelineMonth':
        this.currentView = this.isTimelineView ? 'TimelineMonth' : 'Month';
        break;
      case 'Year':
      case 'TimelineYear':
        this.currentView = this.isTimelineView ? 'TimelineYear' : 'Year';
        break;
      case 'Agenda':
        this.currentView = 'Agenda';
        break;
    }
  }

  public onWeekNumberChange(args: SwitchEventArgs): void {
    this.scheduleObj.showWeekNumber = args.checked;
  }

  public onGroupingChange(args: SwitchEventArgs): void {
    this.scheduleObj.group.resources = args.checked ? ['Calendars'] : [];
  }

  public onGridlinesChange(args: SwitchEventArgs): void {
    this.scheduleObj.timeScale.enable = args.checked;
  }

  public onRowAutoHeightChange(args: SwitchEventArgs): void {
    this.scheduleObj.rowAutoHeight = args.checked;
  }

  public onTooltipChange(args: SwitchEventArgs): void {
    this.scheduleObj.eventSettings.enableTooltip = args.checked;
  }

  public onSelected(args: SelectedEventArgs): void {
    this.scheduleObj.importICalendar((<HTMLInputElement>args.event.target).files[0]);
  }

  public onSettingsClick(args): void {
    const settingsPanel: Element = document.querySelector('.overview-content .settings-panel');
    if (settingsPanel.classList.contains('hide')) {
      removeClass([settingsPanel], 'hide');
    } else {
      addClass([settingsPanel], 'hide');
    }
    this.scheduleObj.refreshEvents();
  }

  public showFilterPanel(args): void {
    const settingsPanel: Element = document.querySelector('.overview-content .filter-panel');
    if (settingsPanel.classList.contains('hide')) {
      removeClass([settingsPanel], 'hide');
    } else {
      addClass([settingsPanel], 'hide');
    }
    this.scheduleObj.refreshEvents();
  }

  public getWeatherImage(value: Date): string {
    switch (value.getDay()) {
      case 0:
        return '<img class="weather-image" src="./assets/schedule/images/weather-clear.svg"/><div class="weather-text">25°C</div>';
      case 1:
        return '<img class="weather-image" src="./assets/schedule/images/weather-clouds.svg"/><div class="weather-text">18°C</div>';
      case 2:
        return '<img class="weather-image" src="./assets/schedule/images/weather-rain.svg"/><div class="weather-text">10°C</div>';
      case 3:
        return '<img class="weather-image" src="./assets/schedule/images/weather-clouds.svg"/><div class="weather-text">16°C</div>';
      case 4:
        return '<img class="weather-image" src="./assets/schedule/images/weather-rain.svg"/><div class="weather-text">8°C</div>';
      case 5:
        return '<img class="weather-image" src="./assets/schedule/images/weather-clear.svg"/><div class="weather-text">27°C</div>';
      case 6:
        return '<img class="weather-image" src="./assets/schedule/images/weather-clouds.svg"/><div class="weather-text">17°C</div>';
      default:
        return null;
    }
  }

  public getDateHeaderText(value: Date): string {
    return this.intl.formatDate(value, { skeleton: 'Ed' });
  }

  public onWeekDayChange(args: ChangeEventArgs): void {
    this.scheduleObj.firstDayOfWeek = args.value as number;
  }

  public onWorkWeekDayChange(args: MultiSelectChangeEventArgs): void {
    this.scheduleObj.workDays = args.value as number[];
  }

  public onResourceChange(args: MultiSelectChangeEventArgs): void {
    let resourcePredicate: Predicate;
    for (const value of args.value) {
      if (resourcePredicate) {
        resourcePredicate = resourcePredicate.or(new Predicate('CalendarId', 'equal', value));
      } else {
        resourcePredicate = new Predicate('CalendarId', 'equal', value);
      }
    }

  }

  public onTimezoneChange(args: ChangeEventArgs): void {
    this.scheduleObj.timezone = args.value as string;
    this.updateLiveTime(this.scheduleObj.timezone);
    document.querySelector('.schedule-overview #timezoneBtn').innerHTML =
      '<span class="e-btn-icon e-icons e-schedule-timezone e-icon-left"></span>' + args.itemData.text;
  }

  public onDayStartHourChange(args: TimeEventArgs): void {
    this.scheduleObj.startHour = this.intl.formatDate(args.value, { skeleton: 'Hm' });
  }

  public onDayEndHourChange(args: TimeEventArgs): void {
    this.scheduleObj.endHour = this.intl.formatDate(args.value, { skeleton: 'Hm' });
  }

  public onWorkStartHourChange(args: TimeEventArgs): void {
    this.scheduleObj.workHours.start = this.intl.formatDate(args.value, { skeleton: 'Hm' });
  }

  public onWorkEndHourChange(args: TimeEventArgs): void {
    this.scheduleObj.workHours.end = this.intl.formatDate(args.value, { skeleton: 'Hm' });
  }

  public onTimescaleDurationChange(args: ChangeEventArgs): void {
    this.scheduleObj.timeScale.interval = args.value as number;
  }

  public onTimescaleIntervalChange(args: ChangeEventArgs): void {
    this.scheduleObj.timeScale.slotCount = args.value as number;
  }

  public getResourceData(data: { [key: string]: Object }): { [key: string]: Object } {
    // tslint:disable-next-line: deprecation
    const resources: ResourcesModel = this.scheduleObj.getResourceCollections()[0];
    const resourceData: { [key: string]: Object } = (resources.dataSource as Object[]).filter((resource: { [key: string]: Object }) =>
      resource.id === data.colorTask)[0] as { [key: string]: Object };
    return resourceData;
  }


  public getHeaderStyles(data: { [key: string]: Object }): Object {
    if (data.elementType === 'cell') {
      return { 'align-items': 'center', 'color': '#919191' };
    } else {
      const resourceData: { [key: string]: Object } = this.getResourceData(data);
      return { 'background': resourceData.color, 'color': '#FFFFFF' };
    }
  }

  public getHeaderTitle(data: { [key: string]: Object }): string {
    return (data.elementType === 'cell') ? 'Add Appointment' : 'Appointment Details';
  }

  public getHeaderDetails(data: { [key: string]: Date }): string {
    return this.intl.formatDate(data.StartTime, { type: 'date', skeleton: 'full' }) + ' (' +
      this.intl.formatDate(data.StartTime, { skeleton: 'hm' }) + ' - ' +
      this.intl.formatDate(data.EndTime, { skeleton: 'hm' }) + ')';

  }

  public getEventType(data: { [key: string]: string }): string {
    const resourceData: { [key: string]: Object } = this.getResourceData(data);
    return resourceData.CalendarText as string;
  }

  public buttonClickActions(e: Event) {
    const quickPopup: HTMLElement = this.scheduleObj.element.querySelector('.e-quick-popup-wrapper') as HTMLElement;
    const getSlotData: Function = (): { [key: string]: Object } => {
      const cellDetails: CellClickEventArgs = this.scheduleObj.getCellDetails(this.scheduleObj.getSelectedElements());
      const addObj: { [key: string]: Object } = {};
      addObj.Id = this.scheduleObj.getEventMaxID();
      addObj.Subject = ((quickPopup.querySelector('#title') as EJ2Instance).ej2_instances[0] as TextBoxComponent).value;
      addObj.StartTime = new Date(+cellDetails.startTime);
      addObj.EndTime = new Date(+cellDetails.endTime);
      addObj.Description = ((quickPopup.querySelector('#notes') as EJ2Instance).ej2_instances[0] as TextBoxComponent).value;
      addObj.CalendarId = ((quickPopup.querySelector('#eventType') as EJ2Instance).ej2_instances[0] as DropDownListComponent).value;
      return addObj;
    };
    if ((e.target as HTMLElement).id === 'add') {
      const addObj: { [key: string]: Object } = getSlotData();
      this.scheduleObj.addEvent(addObj);
    } else if ((e.target as HTMLElement).id === 'delete') {
      const eventDetails: { [key: string]: Object } = this.scheduleObj.activeEventData.event as { [key: string]: Object };
      let currentAction: CurrentAction;
      if (eventDetails.RecurrenceRule) {
        currentAction = 'DeleteOccurrence';
      }
      this.scheduleObj.deleteEvent(eventDetails, currentAction);
    } else {
      const isCellPopup: boolean = quickPopup.firstElementChild.classList.contains('e-cell-popup');
      const eventDetails: { [key: string]: Object } = isCellPopup ? getSlotData() :
        this.scheduleObj.activeEventData.event as { [key: string]: Object };
      let currentAction: CurrentAction = isCellPopup ? 'Add' : 'Save';
      if (eventDetails.RecurrenceRule) {
        currentAction = 'EditOccurrence';
      }
      this.scheduleObj.openEditor(eventDetails, currentAction, true);
    }
    this.scheduleObj.closeQuickInfoPopup();
  }

  public onContextMenuBeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
    const newEventElement: HTMLElement = document.querySelector('.e-new-event') as HTMLElement;
    if (newEventElement) {
      remove(newEventElement);
      removeClass([document.querySelector('.e-selected-cell')], 'e-selected-cell');
    }
    const targetElement: HTMLElement = <HTMLElement>args.event.target;
    if (closest(targetElement, '.e-contextmenu')) {
      return;
    }
    this.selectedTarget = closest(targetElement, '.e-appointment,.e-work-cells,' +
      '.e-vertical-view .e-date-header-wrap .e-all-day-cells,.e-vertical-view .e-date-header-wrap .e-header-cells');
    if (isNullOrUndefined(this.selectedTarget)) {
      args.cancel = true;
      return;
    }
    if (this.selectedTarget.classList.contains('e-appointment')) {
      const eventObj: { [key: string]: Object } = this.scheduleObj.getEventDetails(this.selectedTarget) as { [key: string]: Object };
      if (eventObj.RecurrenceRule) {
        this.menuObj.showItems(['EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
        this.menuObj.hideItems(['Add', 'AddRecurrence', 'Today', 'Save', 'Delete'], true);
      } else {
        this.menuObj.showItems(['Save', 'Delete'], true);
        this.menuObj.hideItems(['Add', 'AddRecurrence', 'Today', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
      }
      return;
    }
    this.menuObj.hideItems(['Save', 'Delete', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
    this.menuObj.showItems(['Add', 'AddRecurrence', 'Today'], true);
  }

  public onMenuItemSelect(args: MenuEventArgs): void {
    const selectedMenuItem: string = args.item.id;
    let eventObj: { [key: string]: number };
    if (this.selectedTarget.classList.contains('e-appointment')) {
      eventObj = this.scheduleObj.getEventDetails(this.selectedTarget) as { [key: string]: number };
    }
    switch (selectedMenuItem) {
      case 'Today':
        this.scheduleObj.selectedDate = new Date();
        break;
      case 'Add':
      case 'AddRecurrence':
        const selectedCells: Element[] = this.scheduleObj.getSelectedElements();
        const activeCellsData: CellClickEventArgs =
          this.scheduleObj.getCellDetails(selectedCells.length > 0 ? selectedCells : this.selectedTarget);
        if (selectedMenuItem === 'Add') {
          this.scheduleObj.openEditor(activeCellsData, 'Add');
        } else {
          this.scheduleObj.openEditor(activeCellsData, 'Add', null, 1);
        }
        break;
      case 'Save':
      case 'EditOccurrence':
      case 'EditSeries':
        if (selectedMenuItem === 'EditSeries') {
          const query: Query = new Query().where(this.scheduleObj.eventFields.id, 'equal', eventObj.RecurrenceID);
          eventObj = new DataManager(this.scheduleObj.eventsData).executeLocal(query)[0] as { [key: string]: number };
        }
        this.scheduleObj.openEditor(eventObj, selectedMenuItem);
        break;
      case 'Delete':
        this.scheduleObj.deleteEvent(eventObj);
        break;
      case 'DeleteOccurrence':
      case 'DeleteSeries':
        this.scheduleObj.deleteEvent(eventObj, selectedMenuItem);
        break;
    }
  }

  /* MY CODE */

  @ViewChild("customerUserModal") customerUserModal: Modal;
  @ViewChild("scheduler") public scheduler: SchedulerComponent;
  public customerModal = false;
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
  public data = new UserModel();
  public value: any = [];
  public store: any;
  public calendars: any = [];
  public loading = true;
  public createFormLoading: boolean;
  public orientation = "horizontal";
  public workTime: any[] = [];
  public selectedStoreId: number;
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
  public customerUserModal2 = false;
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
  public quickPreview = false;
  public quickPreviewEvent: any;
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
  public allEvents = [];
  private instance: Internationalization = new Internationalization();
  public sharedCalendarResources: any;

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
    private dynamicService: DynamicSchedulerService) {
  }

  ngOnInit() {
    this.initializationConfig();
    this.initializaionData();

  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicService.getSchedulerHeight();
  }

  initializationConfig() {
    this.height = this.dynamicService.getSchedulerHeight();

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
  }

  initializaionData() {
    this.type = Number(localStorage.getItem("type"));
    this.id = Number(localStorage.getItem("idUser"));
    console.log(this.events);
    this.calendars = [];
    const superadmin = localStorage.getItem("superadmin");

    this.initializeEventCategory();

    if (this.type === 3) {
      this.selectedStoreId = Number(localStorage.getItem("storeId-" + this.id));
    }

    this.initializeStore();
    this.initializeTasks();
    this.getParameters(superadmin);

  }

  initializeEventCategory() {
    this.eventCategoryService
      .getEventCategory(localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
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
        if (this.eventCategory.length > 0) {
          this.selected = this.eventCategory[0].id;
        }
        this.resources = data;
        this.colorPalette = data;
        for (let i = 0; i < data["length"]; i++) {
          this.palette.push(data[i]["color"]);
        }
        console.log(this.resources);
      });
  }

  initializeStore() {
    this.storeService.getStore(localStorage.getItem("superadmin"), (val) => {
      this.store = val;
      if (this.store.length !== 0) {
        this.language.selectStore += this.store[0].storename + ")";
      }
      if (!isNaN(this.selectedStoreId) && this.selectedStoreId !== undefined) {
        const informationAboutStore = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        );
        this.startWork = informationAboutStore.start_work;
        this.endWork = informationAboutStore.end_work;
        this.timeDuration = informationAboutStore.time_duration;
        if (
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
    });
  }

  initializeTasks() {
    if (this.type === 3) {
      this.selectedStoreId = Number(localStorage.getItem("storeId-" + this.id));
    }
    this.storeService.getStore(localStorage.getItem("superadmin"), (val) => {
      this.store = val;
      if (this.store.length !== 0) {
        this.language.selectStore += this.store[0].storename + ")";
      }
      if (!isNaN(this.selectedStoreId) && this.selectedStoreId !== undefined) {
        const informationAboutStore = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        );
        this.startWork = informationAboutStore.start_work;
        this.endWork = informationAboutStore.end_work;
        this.timeDuration = informationAboutStore.time_duration;
        if (
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
    });

    if (
      localStorage.getItem("selectedStore-" + this.id) !== null &&
      localStorage.getItem("selectedUser-" + this.id) !== null &&
      JSON.parse(localStorage.getItem("selectedUser-" + this.id)).length !==
      0 &&
      this.type !== 3
    ) {
      this.calendars = [];
      this.selectedStoreId = Number(
        localStorage.getItem("selectedStore-" + this.id)
      );
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      this.sharedCalendarResources = this.value;
      // this.selectedStore(this.selectedStoreId);
      if (this.value !== null) {
        this.getTaskForSelectedUsers(this.value);
      } else {
        this.calendars.push({ name: null, events: [] });
      }
      this.getUserInCompany(this.selectedStoreId);
    } else if (
      localStorage.getItem("selectedStore-" + this.id) &&
      this.type !== 3
    ) {
      this.calendars = [];
      this.selectedStoreId = Number(
        localStorage.getItem("selectedStore-" + this.id)
      );
      this.selectedStore(this.selectedStoreId);
    } else if (localStorage.getItem("type") === "3") {
      this.service
        .getWorkandTasksForUser(localStorage.getItem("idUser"))
        .subscribe((data) => {
          console.log(data);
          this.events = [];
          this.workTime = this.pickWorkTimeToTask(data["workTime"]);
          this.pickModelForEvent(data["events"]);
          const objectCalendar = {
            name: null,
            events: this.events,
            workTime: this.workTime,
          };

          /*this.eventSettings.dataSource =
            this.calendars.push(objectCalendar);*/
          console.log(this.splitterSize);
          this.loading = false;
          console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          /// this.setWidthForCalendarHeader();
          ///this.setSplitterBarEvent();
        });
      this.size = [];
      this.size.push("100%");
    } else {
      this.service
        .getTasks(localStorage.getItem("superadmin"))
        .subscribe((data) => {
          console.log(data);
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            this.allEvents.concat(data);
            this.eventSettings.dataSource = this.allEvents;
            console.log(this.events);
            const objectCalendar = {
              name: null,
              events: this.events,
            };
            this.calendars.push(objectCalendar);
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          } else {
            this.calendars.push({ name: null, events: [] });
          }
          console.log(this.calendars);
          this.size = [];
          this.size.push("100%");
        });
    }
  }

  clearAllSelectedData() {
    this.customerUser = new CustomerModel();
    this.selectedComplaint = null;
    this.selectedTherapies = null;
    this.selectedTreatments = null;
    this.telephoneValue = "";
    this.mobileValue = "";
    this.isConfirm = false;
    this.complaintData = new ComplaintTherapyModel();
  }

  public getNextId(): number {
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  formatDate(start, end) {
    const dd = String(start.getDate()).padStart(2, "0");
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
    );
  }

  addTherapy(customerId) {
    this.complaintData.customer_id = customerId;
    this.complaintData.date =
      new Date().getDay() +
      "." +
      new Date().getMonth() +
      "." +
      new Date().getFullYear() +
      ".";
    // this.initializeParams();

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
      this.therapyValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatments,
      this.therapyValue
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

  newCustomer() {
    // this.zIndex = 'zIndex';
    this.customerModal = true;
    this.data = new UserModel();
    this.data.gender = "male";
    this.data.superadmin = localStorage.getItem("superadmin");
  }

  closeNewCustomer() {
    this.zIndex = "";
    this.customerModal = false;
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem("superadmin");
    this.customer.createCustomer(this.data, (val) => {
      console.log(val);
      if (val) {
        this.data.id = val.id;
        this.customerUser = this.data;
        this.formGroup.patchValue({ telephone: this.data.telephone });
        this.formGroup.patchValue({ mobile: this.data.mobile });
        this.baseDataIndicator = true;
        this.userWidth = "65%";
        /// this.reloadNewCustomer();
        this.customerModal = false;
        // this.data = new UserModel();
        // form.reset();
      }
    });
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
    this.customerUserModal2 = true;
  }

  closebaseDataForUser() {
    this.customerUserModal2 = false;
  }

  public handleValue(selected) {
    console.log(selected);
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
      user_id: Number(localStorage.getItem("idUser")),
      key: "usersFor-" + this.selectedStoreId + "-" + this.id,
      value: this.value,
    };

    this.mongo.setUsersFor(item).subscribe((data) => {
      console.log(data);
    });
  }

  getTaskForSelectedUsers(value) {
    this.loading = true;
    console.log(value);
    this.calendars = [];
    if (value.length === 0) {
      this.service
        .getTasksForStore(this.selectedStoreId, this.id, this.type)
        .subscribe((data) => {
          this.events = [];
          this.calendars = [];
          this.events = [];
          for (let i = 0; i < data.length; i++) {
            data[i].start = new Date(data[i].start);
            data[i].end = new Date(data[i].end);
            this.events.push(data[i]);
          }
          this.allEvents.concat(data);
          this.eventSettings.dataSource = this.allEvents;
          const objectCalendar = {
            name: null,
            events: this.events,
          };
          this.calendars.push(objectCalendar);
          this.size = [];
          this.size.push("100%");
          this.loading = false;
          console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          /// this.setWidthForCalendarHeader();
          /// this.setSplitterBarEvent();
        });
    } else {
      this.calendars = [];
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
          console.log(data, this.valueLoop[this.loopIndex]);
          this.events = [];
          this.workTime = this.pickWorkTimeToTask(data["workTime"]);
          const objectCalendar = {
            userId: this.valueLoop[this.loopIndex].id,
            name: this.valueLoop[this.loopIndex].shortname,
            events: this.pickModelForEvent(data["events"]),
            workTime: this.workTime,
          };
          this.calendars.push(objectCalendar);
          this.loopIndex++;
          this.splitterSize = this.splitterSizeFull / this.valueLoop.length;
          console.log(this.splitterSize);
          console.log(this.calendars);
          this.size = [];
          if (this.valueLoop.length === this.loopIndex) {
            const sizePannel = 100 / this.loopIndex + "%";
            for (let i = 0; i < this.valueLoop.length - 1; i++) {
              console.log("usao sam ovde!");
              this.size.push(sizePannel);
            }
            this.size.push("");
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            /// this.setWidthForCalendarHeader();
            /// this.setSplitterBarEvent();
          }
          if (this.loopIndex < this.valueLoop.length) {
            this.myLoop();
          }
        });
    }, 100);
  }

  pickModelForEvent(data) {
    this.events = [];
    for (let i = 0; i < data.length; i++) {
      data[i].StartTime = new Date(data[i].start);
      data[i].EndTime = new Date(data[i].end);
      data[i].Subject = data[i].title;
      this.events.push(data[i]);
    }
    if (this.allEvents.length) {
      this.allEvents.concat(data);
    } else {
      this.allEvents = data;
    }
    this.eventSettings.dataSource = this.allEvents;
    return this.events;
  }

  selectedStore(event) {
    console.log(event);
    this.value = [];
    // localStorage.removeItem('selectedUser');
    this.loading = true;
    this.calendars = [];
    this.selectedStoreId = event;
    if (
      localStorage.getItem(
        "usersFor-" + this.selectedStoreId + "-" + this.id
      ) !== null &&
      JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      ).length !== 0 &&
      event !== undefined
    ) {
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      this.sharedCalendarResources = this.value;
      this.getTaskForSelectedUsers(this.value);
      this.getUserInCompany(event);
      this.setStoreWork(event);
      localStorage.setItem("selectedStore-" + this.id, event);
    } else {
      this.value = [];
      if (event !== undefined) {
        this.service
          .getTasksForStore(event, this.id, this.type)
          .subscribe((data) => {
            this.events = [];
            this.calendars = [];
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            this.allEvents.concat(data);
            this.eventSettings.dataSource = this.allEvents;
            const objectCalendar = {
              name: null,
              events: this.events,
              workTime: undefined,
            };
            if (!isNaN(event)) {
              this.setStoreWork(event);
            } else {
              this.startWork = "08:00";
              this.endWork = "22:00";
              this.timeDuration = "60";
              this.therapyDuration = 1;
            }
            this.calendars.push(objectCalendar);
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            /// this.setWidthForCalendarHeader();
            /// this.setSplitterBarEvent();
          });
        this.getUserInCompany(event);
      } else {
        this.service
          .getTasks(localStorage.getItem("superadmin"))
          .subscribe((data) => {
            console.log(data);
            this.events = [];
            if (data.length !== 0) {
              for (let i = 0; i < data.length; i++) {
                data[i].start = new Date(data[i].start);
                data[i].end = new Date(data[i].end);
                this.events.push(data[i]);
              }
              this.allEvents.concat(data);
              this.eventSettings.dataSource = this.allEvents;
              console.log(this.events);
              const objectCalendar = {
                name: null,
                events: this.events,
                workTime: undefined,
              };
              this.calendars.push(objectCalendar);
            } else {
              this.calendars.push({ name: null, events: [] });
            }
            localStorage.removeItem("selectedStore-" + this.id);
            this.usersInCompany = [];
            this.startWork = "08:00";
            this.endWork = "22:00";
            this.timeDuration = "60";
            this.therapyDuration = 1;
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            /// this.setWidthForCalendarHeader();
            /// this.setSplitterBarEvent();
            this.size = [];
            this.size.push("100%");
          });
      }
    }

    const item = {
      user_id: Number(localStorage.getItem("idUser")),
      selectedStore: event,
    };

    this.mongo.setSelectedStore(item).subscribe((data) => {
      console.log(data);
    });
  }

  setStoreWork(event) {
    if (this.store !== undefined) {
      const informationAboutStore = this.getStartEndTimeForStore(
        this.store,
        this.selectedStoreId
      );
      this.startWork = informationAboutStore.start_work;
      this.endWork = informationAboutStore.end_work;
      this.timeDuration = informationAboutStore.time_duration;
      if (
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

      localStorage.setItem("selectedStore-" + this.id, event);
    }
  }

  getStartEndTimeForStore(data, id) {
    if (data !== null && data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          // tslint:disable-next-line: max-line-length
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
    this.service.getUsersInCompany(storeId, (val) => {
      this.usersInCompany = val;
      // this.language.selectedUsers += this.usersInCompany[0].shortname;
      this.loading = false;
      console.log(document.getElementsByClassName("k-scheduler-toolbar"));
    });
  }

  dateFormat(date, i, j) {
    if (
      // tslint:disable-next-line: max-line-length
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

  pickWorkTimeToTask(workTime) {
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
      console.log(data);
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

    this.service.getCompanyUsers(localStorage.getItem("idUser"), (val) => {
      console.log(val);
      if (val.length !== 0) {
        this.allUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
      }
      console.log(this.allUsers);
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
    return this.instance.formatDate(value, { skeleton: 'hm' });
  }

  resetCalendarData() {
    this.eventSettings.dataSource = [];
  }
}


