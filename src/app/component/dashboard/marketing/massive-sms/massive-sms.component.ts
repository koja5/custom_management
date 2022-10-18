import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { Subject } from "rxjs";
import { MarketingService } from "src/app/service/marketing.service";
import { FormGuardData } from "src/app/models/formGuard-data";

@Component({
  selector: "app-massive-sms",
  templateUrl: "./massive-sms.component.html",
  styleUrls: ["./massive-sms.component.scss"],
})
export class MassiveSmsComponent implements OnInit, FormGuardData {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  @ViewChild("recipients") recipients: Modal;
  @ViewChild("saveDraft") saveDraft: Modal;
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public allRecipients: any;
  public smsDrafts;
  public fields: Object = { text: 'draftName', value: 'id' };
  public editMode: boolean = false;
  public draftName: string;
  isFormDirty: boolean = false;
  isDataSaved$: Subject<boolean> = new Subject<boolean>();
  showDialogExit: boolean = false
  selectedIndex: number;

  constructor(
    private helpService: HelpService,
    private dynamicService: DynamicService,
    private marketingService: MarketingService
  ) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.superadmin = this.helpService.getSuperadmin();
    this.initialization();
  }

  initialization() {
    this.dynamicService
      .getConfiguration("administarator", "massive-sms")
      .subscribe((config) => {
        this.configField = config;
        this.getSmsDrafts();

        this.loading = false;
      });
  }

  getSmsDrafts(selectNewlyCreated?: boolean) {
    this.marketingService.getSmsDrafts(this.superadmin).subscribe((data) => {
      this.smsDrafts = data;
      if (selectNewlyCreated) {
        this.selectedIndex = this.smsDrafts.length - 1;
        this.packDraftData(this.smsDrafts[this.smsDrafts.length - 1]);
      }
    })
  }

  onDraftChange(smsDraft) {
    this.form.form.reset();
    this.draftName = "";
    if(smsDraft.id !== 0) {
      this.editMode = true;
      this.packDraftData(smsDraft)
    }
    else {
      this.editMode = false;
    }
  }

  packDraftData(data) {
    this.data = data;

    if (this.data) {
      for (let i = 0; i < this.configField.length; i++) {
        if (this.configField[i].type === "multiselect") {
          this.configField[i].value = Array.isArray(
            this.data[this.configField[i].name]
          )
            ? this.data[this.configField[i].name]
            : this.helpService.multiSelectStringToArray(
                this.data[this.configField[i].name]
              );
          this.data[this.configField[i].name] = this.configField[i].value;
        } 
        else if (this.configField[i].type === "checkbox") {
          this.configField[i].value = !!this.data[this.configField[i].field];
          this.data[this.configField[i].field] = this.configField[i].value
        }
        else {
          this.configField[i].value = this.data[this.configField[i].field];
        }
      }
    }

    this.draftName = this.data.draftName;
    this.form.form.patchValue(this.data);
  }

  submitEmitter(event) {
    this.allRecipients = null;
    this.changeData = event;
    this.changeData.superadmin = this.helpService.getSuperadmin();
    this.changeData.countryCode =
      this.helpService.getLocalStorage("countryCode");

    this.getFilteredRecipients();
    this.recipients.open();
  }

  getFilteredRecipients() {
    this.dynamicService
      .callApiPost("/api/getFilteredRecipients", this.changeData)
      .subscribe((data) => {
        if (data && data["length"] > 0) {
          this.allRecipients = data;
        } else {
          this.recipients.close();
          this.helpService.warningToastr(
            "",
            this.language.needToConfigurationParams
          );
        }
      });
  }

  sendSms(event) {
    this.dynamicService
      .callApiGet(
        "/api/checkAvailableSmsCount",
        this.helpService.getSuperadmin()
      )
      .subscribe((data) => {
        if (data && data[0] && data[0]["count"] >= this.allRecipients.length) {
          this.dynamicService
            .callApiPost("/api/sendMassiveSMS", this.changeData)
            .subscribe((data) => {
              if (data) {
                this.helpService.successToastr(
                  this.language.successExecutedActionTitle,
                  this.language.successExecutedActionText
                );
              } else {
                this.helpService.errorToastr(
                  this.language.errorExecutedActionTitle,
                  this.language.errorExecutedActionText
                );
              }
            });
          this.recipients.close();
        } else {
          this.helpService.warningToastr(this.language.needToBuySms, "");
        }
      });
  }

  openSaveDraftModal() {
    this.saveDraft.open();
  }

  saveSmsDraft() {
    const formValues = this.form.form.value;
    let smsDraft = {
      ...this.form.form.value,
      draftName: this.draftName ? this.draftName : "",
      place: formValues.place ? formValues.place : "",
      male: formValues.male ? formValues.male : false,
      female: formValues.female ? formValues.female : false,
      excludeCustomersWithEvents: formValues.excludeCustomersWithEvents ? formValues.excludeCustomersWithEvents : false,
      birthdayFrom: formValues.birthdayFrom ? formValues.birthdayFrom : "",
      birthdayTo: formValues.birthdayTo ? formValues.birthdayTo : "",
      profession: formValues.profession ? formValues.profession : "",
      childs: formValues.childs ? formValues.childs : "",
      start: formValues.start ? formValues.start : "",
      end: formValues.end ? formValues.end : "",
      subject: formValues.subject ? formValues.subject : "",
      message: formValues.message ? formValues.message : "",
      
      category: this.helpService.multiSelectArrayToString(formValues.category),
      creator_id: this.helpService.multiSelectArrayToString(formValues.creator_id),
      recommendation: this.helpService.multiSelectArrayToString(formValues.recommendation),
      relationship: this.helpService.multiSelectArrayToString(formValues.relationship),
      social: this.helpService.multiSelectArrayToString(formValues.social),
      doctor: this.helpService.multiSelectArrayToString(formValues.doctor),
      store: this.helpService.multiSelectArrayToString(formValues.store),
      superadmin: this.helpService.getSuperadmin(),
    };

    if(this.editMode) {
      smsDraft = {
        ...smsDraft,
        id: this.data.id,
      };
      this.marketingService.editSmsDraft(smsDraft).subscribe((data) => {
        this.getSmsDrafts();
        this.saveDraft.close();
        this.editMode = true;
        if (data) {
          this.helpService.successToastr(
            this.language.successTitle,
            this.language.smsDraftEditedSuccessfully
          );
        }else {
          this.helpService.errorToastr(
            this.language.errorTitle,
            this.language.errorTextEdit
          );
        }
      })
    } else {
      this.marketingService.createSmsDraft(smsDraft).subscribe((data) => {
        if (data) {
          this.helpService.successToastr(
            this.language.successTitle,
            this.language.smsDraftSavedSuccessfully
          );
        }else {
          this.helpService.errorToastr(
            this.language.errorTitle,
            this.language.accountErrorUpdatedAccountText
          );
        }
        this.getSmsDrafts(true);
        this.selectedIndex = this.smsDrafts.length - 1;
        this.saveDraft.close();
        this.editMode = true;
      });
    }
    
  }

  onCreateNewDraft() {
    this.selectedIndex = 0;
    this.draftName = "";
    this.form.form.reset();
    this.editMode = false;
    if(!this.smsDrafts || !this.smsDrafts.length) {
      this.smsDrafts.unshift({id: 0, draftName: this.language.addNewSmsDraft});
      return;
    }
    if(this.smsDrafts[0].draftName !== this.language.addNewSmsDraft) {
      this.smsDrafts.unshift({id: 0, draftName: this.language.addNewSmsDraft});
    }
  } 

  deleteSmsDraft() {
    this.marketingService.deleteSmsDraft(this.data).subscribe((data) => {
      this.getSmsDrafts();
      this.form.form.reset();
      this.editMode = false;
      this.selectedIndex = -1;
      this.draftName = "";
      if (data) {
        this.helpService.successToastr(
          this.language.successTitle,
          this.language.smsDraftDeletedSuccessfully
        );
      }else {
        this.helpService.errorToastr(
          this.language.errorTitle,
          this.language.errorTextEdit,
        );
      }
    })
  }

  isDataSavedChange(event: boolean) {
    this.isDataSaved$.next(event);
  }

  openConfirmModal(): void {
    this.showDialogExit = true;
  }

  changeFormDirty(event) {
    this.isFormDirty = event
  }

  changeShowDialogExit(event) {
    this.showDialogExit = event;
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = index;
  }
}
