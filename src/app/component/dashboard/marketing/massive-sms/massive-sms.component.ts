import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { Subject } from "rxjs";
import { MarketingService } from "src/app/service/marketing.service";
import { FormGuardData } from "src/app/models/formGuard-data";

const draftType = 'sms';

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
  public copyMode: boolean = false;
  public draftName: string;
  public originalDraftName: string;
  isFormDirty: boolean = false;
  isDataSaved$: Subject<boolean> = new Subject<boolean>();
  showDialogExit: boolean = false
  selectedIndex: number;
  public dialogOpened = false;
  public saveDraftModalHeader: string;

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
        console.log(config);
        this.configField = config;
        this.getSmsDrafts();

        this.loading = false;
      });
  }

  getSmsDrafts(selectNewlyCreated?: boolean) {
    this.marketingService.getDrafts(this.superadmin, draftType).subscribe((data) => {
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
    this.isDataSavedChange(true);
    this.changeFormDirty(false);
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
          if (this.configField[i].allowCustom) {
            this.configField[i].value =
              Array.isArray(this.data[this.configField[i].name]) ||
              this.data[this.configField[i].name] === ""
                ? this.data[this.configField[i].name]
                : this.helpService.multiSelectStringToArrayString(
                    this.data[this.configField[i].name]
                  );
            this.data[this.configField[i].name] = this.configField[i].value;
          } else {
            this.configField[i].value = Array.isArray(
              this.data[this.configField[i].name]
            )
              ? this.data[this.configField[i].name]
              : this.helpService.multiSelectStringToArrayNumber(
                  this.data[this.configField[i].name]
                );
            this.data[this.configField[i].name] = this.configField[i].value;
          }
        } else if (this.configField[i].type === "checkbox") {
          this.configField[i].value = !!this.data[this.configField[i].field];
          this.data[this.configField[i].field] = this.configField[i].value;
        } else {
          this.configField[i].value = this.data[this.configField[i].field];
        }
      }
    }

    this.draftName = this.data.draftName;
    this.form.form.patchValue(this.data);
  }

  submitEmitter(event) {
    this.allRecipients = null;
    this.changeData = this.helpService.removeZeroArrayFromObject(event);
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
        if (data) {
          this.allRecipients = data;
        } else if(!data) {
          this.recipients.close();
          this.helpService.warningToastr(
            "",
            this.language.needToConfigurationParams
          );
        }
      }, (error) => {
        console.log(error);
        this.recipients.close();
        this.helpService.warningToastr(
          "",
          this.language.needToConfigurationParams
        );
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

  openSaveDraftModal(headerName: string) {
    this.saveDraftModalHeader = headerName;
    this.saveDraft.open();
  }

  prepareForCopyModal(headerName: string) {
    this.copyMode = true;
    this.editMode = false;
    this.originalDraftName = this.draftName
    this.draftName = `${this.draftName} Copy`;
    this.openSaveDraftModal(headerName);
  }

  actionOnClose() {
    if(this.copyMode) {
      this.copyMode = false
      this.editMode = true;
      this.draftName = this.originalDraftName;
    }
  }

  saveSmsDraft() {
    const formValues = this.form.form.value;

    let smsDraft = this.helpService.prepareDraft(
      formValues,
      this.draftName,
      draftType
    );

    if(this.editMode) {
      smsDraft = {
        ...smsDraft,
        id: this.data.id,
      };
      this.marketingService.editDraft(smsDraft).subscribe((data) => {
        this.getSmsDrafts();
        this.saveDraft.close();
        this.editMode = true;
        this.isDataSavedChange(true);
        this.changeFormDirty(false);
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
      this.marketingService.createDraft(smsDraft).subscribe((data) => {
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
        this.isDataSavedChange(true);
        this.changeFormDirty(false);
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
      this.smsDrafts.unshift({id: 0, draftName: this.language.addNewSmsDraft || 'Add new sms draft'});
      return;
    }
    if(this.smsDrafts[0].draftName !== this.language.addNewSmsDraft) {
      this.smsDrafts.unshift({id: 0, draftName: this.language.addNewSmsDraft || 'Add new sms draft'});
    }
  } 

  deleteSmsDraft() {
    this.marketingService.deleteDraft(this.data).subscribe((data) => {
      this.getSmsDrafts();
      this.form.form.reset();
      this.editMode = false;
      this.selectedIndex = -1;
      this.draftName = "";
      this.isDataSavedChange(true);
      this.changeFormDirty(false);
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

  closeDeleteDialog(status: string): void {
    if(status === 'yes') {
      this.deleteSmsDraft();
    }
    this.dialogOpened = false;
  }

  openDeleteDialog(): void {
    this.dialogOpened = true;
  }
}
