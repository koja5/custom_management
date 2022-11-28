import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { Subject } from "rxjs";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { FormGuardData } from "src/app/models/formGuard-data";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { MarketingService } from "src/app/service/marketing.service";

const draftType = 'email';

@Component({
  selector: "app-massive-email",
  templateUrl: "./massive-email.component.html",
  styleUrls: ["./massive-email.component.scss"],
})
export class MassiveEmailComponent implements OnInit, FormGuardData {
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
  public emailDrafts;
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
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.superadmin = this.helpService.getSuperadmin();
    this.initialization();
  }

  initialization() {
    this.dynamicService
      .getConfiguration("administarator", "massive-email")
      .subscribe((config) => {
        this.configField = config;
        this.getEmailDrafts();

        this.loading = false;
      });
  }

  getEmailDrafts(selectNewlyCreated?: boolean) {
    this.marketingService.getDrafts(this.superadmin, draftType).subscribe((data) => {
      this.emailDrafts = data;
      if (selectNewlyCreated) {
        this.selectedIndex = this.emailDrafts.length - 1;
        this.packDraftData(this.emailDrafts[this.emailDrafts.length - 1]);
      }
    })
  }

  onDraftChange(emailDraft) {
    this.form.form.reset();
    this.draftName = "";
    this.isDataSavedChange(true);
    this.changeFormDirty(false);
    if(emailDraft.id !== 0) {
      this.editMode = true;
      this.packDraftData(emailDraft)
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
    this.changeData = this.helpService.removeZeroArrayFromObject(event);
    this.changeData.superadmin = this.helpService.getSuperadmin();
    this.changeData.mode = "mail";
    this.changeData.language = this.language;
    this.getFilteredRecipients();
    this.recipients.open();
  }

  getFilteredRecipients() {
    this.allRecipients = null;
    this.dynamicService
      .callApiPost("/api/getFilteredRecipients", this.changeData)
      .subscribe((data) => {
        console.log(data);
        if (data) {
          this.allRecipients = data;
        }  else if(!data) {
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

  sendMails() {
    this.dynamicService
      .callApiPost("/api/sendMassiveEmail", this.changeData)
      .subscribe((data) => {
        this.helpService.successToastr(
          this.language.successExecutedActionTitle,
          this.language.successExecutedActionText
        );
        this.recipients.close();
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

  saveEmailDraft() {
    const formValues = this.form.form.value;
    let emailDraft = this.helpService.prepareDraft(
      formValues,
      this.draftName,
      draftType
    );

    if(this.editMode) {
      emailDraft = {
        ...emailDraft,
        id: this.data.id,
      };
      this.marketingService.editDraft(emailDraft).subscribe((data) => {
        this.getEmailDrafts();
        this.saveDraft.close();
        this.editMode = true;
        this.isDataSavedChange(true);
        this.changeFormDirty(false);
        if (data) {
          this.helpService.successToastr(
            this.language.successTitle,
            this.language.emailDraftEditedSuccessfully
          );
        }else {
          this.helpService.errorToastr(
            this.language.errorTitle,
            this.language.errorTextEdit
          );
        }
      })
    } else {
      this.marketingService.createDraft(emailDraft).subscribe((data) => {
        if (data) {
          this.helpService.successToastr(
            this.language.successTitle,
            this.language.emailDraftSavedSuccessfully
          );
        }else {
          this.helpService.errorToastr(
            this.language.errorTitle,
            this.language.accountErrorUpdatedAccountText
          );
        }
        this.getEmailDrafts(true);
        this.selectedIndex = this.emailDrafts.length - 1;
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
    if(!this.emailDrafts || !this.emailDrafts.length) {
      this.emailDrafts.unshift({id: 0, draftName: this.language.addNewEmailDraft || 'Add new email draft'});
      return;
    }
    if(this.emailDrafts[0].draftName !== this.language.addNewEmailDraft) {
      this.emailDrafts.unshift({id: 0, draftName: this.language.addNewEmailDraft || 'Add new email draft'});
    }
  }

  deleteEmailDraft() {
    this.marketingService.deleteDraft(this.data).subscribe((data) => {
      this.getEmailDrafts();
      this.form.form.reset();
      this.editMode = false;
      this.selectedIndex = -1;
      this.draftName = "";
      this.isDataSavedChange(true);
      this.changeFormDirty(false);
      
      if (data) {
        this.helpService.successToastr(
          this.language.successTitle,
          this.language.emailDraftDeletedSuccessfully
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
      this.deleteEmailDraft();
    }
    this.dialogOpened = false;
  }

  openDeleteDialog(): void {
    this.dialogOpened = true;
  }
}
