import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { HolidayModel } from 'src/app/models/holiday-model';
import { DynamicSchedulerService } from 'src/app/service/dynamic-scheduler.service';
import { HelpService } from 'src/app/service/help.service';
import { HolidayService } from 'src/app/service/holiday.service';
import { MessageService } from 'src/app/service/message.service';
import { Modal } from 'ngx-modal';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';
import { HolidayTemplate } from 'src/app/models/holiday-template.model';
import { DateService } from 'src/app/service/date.service';
import { checkIfInputValid } from "../../../../shared/utils";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-choose-holiday',
  templateUrl: './choose-holiday.component.html',
  styleUrls: ['./choose-holiday.component.scss']
})
export class ChooseHolidayComponent implements OnInit {
  @ViewChild("holidayModal") holidayModal: Modal;

  @ViewChild('endTime')
  public endTimeDatePicker: DatePickerComponent;

  public currentHoliday: HolidayModel;
  public addNewHoliday: boolean = true;
  public deleteModal: boolean = false;
  public language: any;
  public templateHolidays: HolidayModel[] = [];
  public clinicHolidays: HolidayModel[] = [];
  public holidays: HolidayModel[] = [];
  public holidayTemplateList: HolidayTemplate[];
  private superAdminId: number;
  public selectedTemplates = null;

  height: string;
  private overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };
  public superAdminTemplates: number[] = [];
  private deleteHolidayTemplateId: number;
  checkIfInputValid = checkIfInputValid;

  get holidayModalTitle(): string {
    return this.addNewHoliday ?
      this.language.addHoliday :
      this.language.editHoliday;
  }

  get isSaveDisabled(): boolean {
    return this.areEqual(this.superAdminTemplates, this.selectedTemplates ? this.selectedTemplates.map(elem => elem.id) : []);
  }

  constructor(
    public messageService: MessageService,
    private holidayService: HolidayService,
    private helpService: HelpService,
    private dateService: DateService,
    private toastrService: ToastrService,
    private dynamicService: DynamicSchedulerService) { }

  ngOnInit() {
    this.initializationConfig();
    this.superAdminId = Number(this.helpService.getSuperadmin());

    this.currentHoliday = new HolidayModel();

    this.loadHolidayTemplates();
    this.loadHolidaysForClinic();

    this.height = this.dynamicService.getDefineHolidayHeight();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.dynamicService.getDefineHolidayHeight();
  }

  public loadHolidaysForClinic(): void {

    if (!this.superAdminId) {
      return;
    }

    this.clinicHolidays = [];
    this.templateHolidays = [];

    this.holidayService.getHolidaysForClinic(this.superAdminId).then(result => {
      console.log(result);
      if (result && result.length > 0) {

        result.forEach(elem => {
          elem.StartTime = new Date(elem.StartTime);
          elem.EndTime = new Date(elem.EndTime);
        })
        this.clinicHolidays = result;
      }
    });

    // load holidays defined by clinic and holidays defined by selected clinic template (if there is some)

    this.holidayService.getStoreTemplateConnection(this.superAdminId).then((ids) => {
      this.superAdminTemplates = ids.map(elem => elem.templateId);
      this.selectedTemplates = this.holidayTemplateList ? this.holidayTemplateList.filter(x => this.superAdminTemplates.includes(x.id)) : [];

      if (ids.length) {
        this.getHolidaysByTemplates(this.superAdminTemplates);
      }
    });
  }

  public openAddNewHolidayModal(): void {
    this.addNewHoliday = true;
    this.currentHoliday = new HolidayModel();
    this.holidayModal.open();
  }

  public openEditHolidayModal(holiday: HolidayModel): void {
    this.currentHoliday = holiday;
    this.currentHoliday.StartTime = new Date(holiday.StartTime);
    this.currentHoliday.EndTime = new Date(holiday.EndTime);

    this.addNewHoliday = false;
    this.holidayModal.open();
  }

  public getFormattedDate(holiday: HolidayModel): string {
    const d1 = this.dateService.formatDate(holiday.StartTime.toISOString());
    const d2 = this.dateService.formatDate(holiday.EndTime.toISOString());
    return d1 == d2 ? d1 : d1 + " - " + d2;
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

  public loadHolidaysByTemplates(): void {
    //reset
    this.templateHolidays = [];

    const ids = this.selectedTemplates.map(elem => elem.id);
    //const newIds = ids.filter(x => !this.storeTemplates.includes(x));

    //If no selected template then display only clinic holidays
    if (!ids.length) {
      return;
    }

    this.getHolidaysByTemplates(ids);
  }

  private getHolidaysByTemplates(templateIds: number[]) {
    this.holidayService.getHolidaysByTemplates(templateIds).then(result => {
      console.log(result);
      if (result && result.length > 0) {
        result.forEach(elem => {
          elem.StartTime = new Date(elem.StartTime);
          elem.EndTime = new Date(elem.EndTime);
        })
        this.templateHolidays = result;
      }
    });
  }

  public loadHolidayTemplates() {
    this.holidayService.getHolidayTemplatesPromise().then((result) => {
      this.holidayTemplateList = result;
    });
  }

  private initializationConfig(): void {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
    } else {
      this.messageService.getLanguage().subscribe((mess) => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
        }, 10);
      });
    }
  }

  public onTemplateChange(): void {
    if (this.selectedTemplates && this.selectedTemplates.length > 0) {
      this.loadHolidaysByTemplates();
    } else {
      //reset
      this.selectedTemplates = [];
      this.templateHolidays = [];
    }
  }

  // connect clinic with holiday template
  // if those templates are already connected save button is disabled
  // ako selectedTemplates sadrzi idjeve koji nisu u storeTemplates to su novi idjevi, njih dodajemo
  // ako selectedTemplates ne sadrzi neki ili sve idjeve koji su u storeTemplates njih brisemo
  public saveTemplateSelection(): void {
    const ids = this.selectedTemplates.map(elem => elem.id);
    const idsForAdding = ids.filter(x => !this.superAdminTemplates.includes(x));

    if (idsForAdding.length) {
      this.holidayService.createStoreTemplateConnection(idsForAdding, this.superAdminId, (result) => {
        if (result) {
          this.superAdminTemplates = ids;
          this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);
        } else {
          this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
        }
      });

    }

    // for removing
    const idsForRemoving = this.superAdminTemplates.filter(x => !ids.includes(x));
    if (idsForRemoving.length) {
      this.holidayService.deleteStoreTemplateConnection(idsForRemoving, this.superAdminId, (result) => {
        console.log(result);
        if (result) {
          this.superAdminTemplates = ids;
          this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);
        } else {
          this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
        }
      });
    }
  }

  public addClinicHoliday(form: NgForm): void {
    this.currentHoliday.superAdminId = this.superAdminId;
    this.currentHoliday.StartTime = new Date(this.currentHoliday.StartTime.toISOString());
    this.currentHoliday.EndTime = new Date(this.currentHoliday.EndTime.toISOString());

    this.holidayService.createHoliday(this.currentHoliday, (insertedId) => {
      if (insertedId) {
        this.displaySuccessMessage(
          this.language.adminSuccessCreateTitle,
          this.language.adminSuccessCreateText
        );

        this.clinicHolidays.push(this.currentHoliday);
        this.clinicHolidays.sort(function (a, b) { return a.StartTime.getTime() - b.StartTime.getTime() })
      }
      else {
        this.displayErrorMessage(
          this.language.adminErrorCreateTitle,
          this.language.adminErrorCreateText
        );
      }
      this.closeHolidayModal();
    });
  }

  public updateClinicHoliday(): void {
    this.holidayService.updateHoliday(this.currentHoliday, (val) => {
      if (val) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
      this.closeHolidayModal();
    });
  }

  public openDeleteModal(id): void {
    this.deleteModal = true;
    this.deleteHolidayTemplateId = id;
  }

  public deleteClinicHoliday(): void {
    this.holidayService.deleteHoliday(this.deleteHolidayTemplateId, (val) => {
      if (val) {
        this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);

        //DELETE FROM ARRAY
        this.clinicHolidays = this.clinicHolidays.filter(h => h.id !== this.deleteHolidayTemplateId);
      } else {
        this.displayErrorMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
      }
      this.closeDeleteDialog();
    });
  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, this.overrideMessage);
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }

  public closeHolidayModal(): void {
    this.holidayModal.close();
  }

  public setMinEndTime(event): void {
    this.endTimeDatePicker.min = event;
    this.currentHoliday.EndTime = event;
  }

  public closeDeleteDialog(): void {
    this.deleteModal = false;
  }
}
