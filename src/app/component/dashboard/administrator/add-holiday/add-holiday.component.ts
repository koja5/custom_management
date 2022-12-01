import { HolidayTemplate } from './../../../../models/holiday-template.model';
import { UsersService } from "./../../../../service/users.service";
import { HolidayService } from "../../../../service/holiday.service";
import { HolidayModel } from "../../../../models/holiday-model";
import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { MessageService } from "src/app/service/message.service";
import { IndividualConfig, ToastrService } from "ngx-toastr";
import { HelpService } from "src/app/service/help.service";
import { DatePickerComponent } from "@progress/kendo-angular-dateinputs";
import {
  GroupDescriptor,
  SortDescriptor,
  State,
  process,
} from "@progress/kendo-data-query";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { DynamicSchedulerService } from "src/app/service/dynamic-scheduler.service";
import { TabType } from "src/app/component/enum/tab-type";
import { DateService } from "src/app/service/date.service";
import { UserModel } from 'src/app/models/user-model';
import { checkIfInputValid } from "../../../../shared/utils";
import { SortMode } from 'src/app/component/enum/sort-mode';
import { SortDirection } from 'src/app/component/enum/sort-direction';

@Component({
  selector: "app-add-holiday",
  templateUrl: "./add-holiday.component.html",
  styleUrls: ["./add-holiday.component.scss"],
})
export class AddHolidayComponent implements OnInit {
  @ViewChild("endTime")
  public endTimeDatePicker: DatePickerComponent;

  public language: any;
  public addNewHoliday: boolean = true;
  public deleteModal: boolean = false;
  public deleteHolidayModal: boolean = false;
  public currentHoliday: HolidayModel = new HolidayModel();
  public holidayTemplateList: HolidayTemplate[];
  public currentTab = TabType.Holidays;
  public sortingOptionsList = [];
  public selectedSortOption;
  public tabType = TabType;
  public addTemplate: boolean;

  public holidayTemplatesGridData: any;
  public pageSize = 5;

  public pageable = {
    pageSizes: true,
    previousNext: true,
  };
  public state: State = {
    skip: 0,
    take: 5,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc",
      },
    ],
  };
  checkIfInputValid = checkIfInputValid;

  @ViewChild("holidayModal") holidayModal: Modal;
  @ViewChild("templateModal") templateModal: Modal;
  public selectedHolidayTemplate: HolidayTemplate;
  private overrideMessage: Partial<IndividualConfig> = {
    timeOut: 7000,
    positionClass: "toast-bottom-right",
  };
  public currentTemplate = new HolidayTemplate();

  public user: UserModel;
  private deleteHolidayTemplateId: number;
  public height: string;
  public holidayList: HolidayModel[] = [];
  deleteHolidayId: number;

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.height = this.dynamicService.getHolidayCalendarHeight();
  }

  get holidayModalTitle(): string {
    return this.addNewHoliday
      ? this.language.addHoliday
      : this.language.editHoliday;
  }

  get templateModalTitle(): string {
    return this.addTemplate
      ? this.language.addTemplate
      : this.language.editTemplate;
  }

   get holidayTemplateNotSelected():boolean{
    return this.selectedHolidayTemplate==null || this.selectedHolidayTemplate==undefined;
  }

  constructor(
    public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private usersService: UsersService,
    private dynamicService: DynamicSchedulerService,
    private dateService: DateService,
    private toastrService: ToastrService
  ) { }

  ngOnInit() {
    this.initializationConfig();
    this.usersService.getUserWithIdPromise(this.helpService.getMe())
      .then((data) => {
        this.user = data;
      });

    this.loadHolidayTemplates();
    this.setSortOptions();
    this.selectedSortOption = this.sortingOptionsList[0];

    this.height = this.dynamicService.getHolidayCalendarHeight();
  }

  private initializationConfig(): void {
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

  public loadHolidayTemplates() {
    this.holidayService.getHolidayTemplatesPromise().then((result) => {
      this.holidayTemplateList = result;
      this.holidayTemplatesGridData = process(this.holidayTemplateList, this.state);
    });
  }

  private setSortOptions():void{
    this.sortingOptionsList =[];

    for(const mode in SortMode){
      if(mode){
        const translationKeyAsc = SortMode[mode] + SortDirection.Ascending;
        const translationKeyDesc = SortMode[mode] + SortDirection.Descending;

        this.sortingOptionsList.push({
          value: {
            mode:mode,
            direction: SortDirection.Ascending
          },
          text: this.language[translationKeyAsc]
        })

        this.sortingOptionsList.push({
          value: {
            mode:mode,
            direction: SortDirection.Descending
          },
          text: this.language[translationKeyDesc]
        })
      }
    }
  }

  public changeTab(value: TabType): void {
    if (this.currentTab === value) {
      return;
    }

    this.selectedHolidayTemplate = null;
    this.holidayList = [];

    this.currentTab = value;
  }

  public onHolidayTemplateChange(): void {
    if (this.selectedHolidayTemplate) {
      this.loadHolidaysByTemplate();
      this.currentHoliday.templateId = this.selectedHolidayTemplate.id;
    } else {
      //reset
      this.holidayList = [];
      this.selectedHolidayTemplate = null;
    }
  }

  public loadHolidaysByTemplate(): void {
    //reset
    this.holidayList = [];

    this.holidayService
      .getHolidaysByTemplate(this.selectedHolidayTemplate.id)
      .then((result) => {
        if (result && result.length > 0) {

          result.forEach(elem => {
            elem.StartTime = new Date(elem.StartTime);
            elem.EndTime = new Date(elem.EndTime);
          })

          this.holidayList = result;
        }
      });
  }

  public getFormattedDate(holiday: HolidayModel): string {
    const d1 = this.dateService.formatDate(holiday.StartTime.toISOString());
    const d2 = this.dateService.formatDate(holiday.EndTime.toISOString());
    return d1 == d2 ? d1 : d1 + " - " + d2;
  }

  public openAddNewHolidayModal(): void {
    if (!this.selectedHolidayTemplate) {
      this.displaySelectTemplateMessage();
      return;
    }

    this.addNewHoliday = true;

    this.currentHoliday = new HolidayModel();
    this.currentHoliday.templateId = this.selectedHolidayTemplate.id;

    this.holidayModal.open();
  }

  public setMinEndTime(event): void {
    this.endTimeDatePicker.min = event;
    this.currentHoliday.EndTime = event;
  }

  public addHoliday(): void {
    this.currentHoliday.templateId = this.selectedHolidayTemplate.id;
    this.currentHoliday.StartTime = new Date(this.currentHoliday.StartTime.toISOString());
    this.currentHoliday.EndTime = new Date(this.currentHoliday.EndTime.toISOString());

    this.holidayService.createHoliday(this.currentHoliday, (insertedId) => {
      if (insertedId) {
        this.displaySuccessMessage(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText
        );
        this.holidayList.push(this.currentHoliday);
        this.sortHolidays();

        if(this.selectedSortOption.value.direction == SortDirection.Descending){
          this.holidayList.reverse();
        }

      } else {
        this.displayErrorMessage(
          this.language.adminErrorCreateTitle,
          this.language.adminErrorCreateText
        );
      }
      this.closeHolidayModal();
    });
  }

  private sortHolidays() {
    this.holidayList = this.holidayList.sort((a, b) => a.StartTime.getTime() > b.StartTime.getTime() ? 1 : a.StartTime.getTime() < b.StartTime.getTime() ? -1 : 0 );
  }

  public openEditHolidayModal(holiday: HolidayModel): void {
    this.currentHoliday = holiday;
    this.currentHoliday.StartTime = new Date(holiday.StartTime);
    this.currentHoliday.EndTime = new Date(holiday.EndTime);

    this.addNewHoliday = false;
    this.holidayModal.open();
  }

  public updateHoliday(): void {
    this.holidayService.updateHoliday(this.currentHoliday, (val) => {
      if (val) {
        this.displaySuccessMessage(
          this.language.adminSuccessUpdateTitle,
          this.language.adminSuccessUpdateText
        );
      } else {
        this.displayErrorMessage(
          this.language.adminErrorUpdateTitle,
          this.language.adminErrorUpdateText
        );
      }
      this.closeHolidayModal();
    });
  }

  public deleteHoliday(): void {
    this.holidayService.deleteHoliday(this.deleteHolidayId, (val) => {
      if (val) {
        this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);

        //DELETE FROM ARRAY
        this.holidayList = this.holidayList.filter(h => h.id !== this.currentHoliday.id);
      } else {
        this.displayErrorMessage(
          this.language.adminErrorDeleteTitle,
          this.language.adminErrorDeleteText
        );
      }
      this.closeDeleteHolidayDialog();
    });
  }

  public closeHolidayModal(): void {
    this.holidayModal.close();
  }

  public openAddNewHolidayTemplateModal(): void {
    this.currentTemplate = new HolidayTemplate();
    this.currentTemplate.name = "";
    this.currentTemplate.description = "";
    this.addTemplate = true;

    this.templateModal.open();
  }

  public createTemplate(): void {
    this.holidayService.createHolidayTemplate(this.currentTemplate).then((insertedId) => {
      if (insertedId) {
        this.displaySuccessMessage(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText
        );

        this.loadHolidayTemplates();
      } else {
        this.displayErrorMessage(
          this.language.adminErrorCreateTitle,
          this.language.adminErrorCreateText
        );
      }
      this.closeTemplateModal();
    });
  }

  public openEditHolidayTemplateModal(event: HolidayTemplate): void {
    this.currentTemplate = event;
    this.addTemplate = false;
    this.templateModal.open();
  }

  public updateTemplate(): void {
    this.holidayService.updateHolidayTemplate(this.currentTemplate).then((result) => {
      this.closeTemplateModal();
      if (result) {
        this.displaySuccessMessage(
          this.language.adminSuccessUpdateTitle,
          this.language.adminSuccessUpdateText
        );
      } else {
        this.displayErrorMessage(
          this.language.adminErrorUpdateTitle,
          this.language.adminErrorUpdateText
        );
      }
      this.closeTemplateModal();
    });
  }

  public openDeleteHolidayDialog(event: number): void {
    this.deleteHolidayModal = true;
    this.deleteHolidayId = event;
  }

  public openDeleteHolidayTemplateDialog(event: number): void {
    this.deleteModal = true;
    this.deleteHolidayTemplateId = event;
  }

  public deleteHolidayTemplate(): void {
    const holidayTemplate = this.holidayTemplateList.find(
      (elem) => elem.id === this.deleteHolidayTemplateId
    );

    this.holidayService.deleteHolidaysByTemplateId(holidayTemplate).then((result) => {
      if (result) {
        this.holidayService.deleteHolidayTemplate(holidayTemplate).then((result) => {
          if (result) {
            this.displaySuccessMessage(
              this.language.adminSuccessDeleteTitle,
              this.language.adminSuccessDeleteText
            );

            this.holidayTemplateList = this.holidayTemplateList.filter(elem => elem.id !== this.deleteHolidayTemplateId);

            this.holidayTemplatesGridData = process(this.holidayTemplateList, this.state);

            this.deleteHolidayTemplateId = null;

          } else {
            this.displayErrorMessage(
              this.language.adminErrorDeleteTitle,
              this.language.adminErrorDeleteText
            );
          }
        });

      } else {
        this.displayErrorMessage(
          this.language.adminErrorDeleteTitle,
          this.language.adminErrorDeleteText
        );
      }
      this.closeDeleteDialog();
    })
  }

  public closeDeleteDialog(): void {
    this.deleteModal = false;
    this.deleteHolidayTemplateId = null;
  }

  public closeDeleteHolidayDialog(): void {
    this.deleteHolidayModal = false;
    this.deleteHolidayId = null;
  }

  public closeTemplateModal(): void {
    this.templateModal.close();
  }

  public pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.holidayTemplatesGridData = process(this.holidayTemplateList, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.holidayTemplatesGridData = process(this.holidayTemplateList, this.state);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.holidayTemplatesGridData = process(this.holidayTemplateList, this.state);
  }

  private displaySelectTemplateMessage(): void {
    this.toastrService.warning(
      this.language.chooseTemplate,
      null,
      this.overrideMessage
    );
  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, this.overrideMessage);
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }

  public onSortValueChanged():void{
    this.holidayList.reverse();
  }

}
