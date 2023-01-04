import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/service/account.service';
import { HelpService } from 'src/app/service/help.service';
import { Location } from "@angular/common";
import { Modal } from "ngx-modal";
import { DomSanitizer } from "@angular/platform-browser";
import { PackLanguageService } from 'src/app/service/pack-language.service';
import { LoginService } from 'src/app/service/login.service';
import { MailService } from 'src/app/service/mail.service';
import { checkIsValidDate } from 'src/app/shared/utils';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-registered-clinic-detail',
  templateUrl: './registered-clinic-detail.component.html',
  styleUrls: ['./registered-clinic-detail.component.scss']
})
export class RegisteredClinicDetailComponent implements OnInit {

  @ViewChild("clinic") clinic: Modal;
  @ViewChild("chooseImage") chooseImage: Modal;

  data: any;
  clinicId: number;
  language: any;
  numberOfEmployees: number = 0;
  loading: boolean;
  theme: string;
  showDialog: boolean = false;
  isFormDirty: boolean = false;
  imagePath: any;
  updateImageInput: any;
  isFileChoosen: boolean = false;
  fileName: string = '';
  dialogOpened: boolean = false;
  public currentTab = 'profile';
  checkIsValidDate = checkIsValidDate;

  constructor(
    public accountService: AccountService,
    public helpService: HelpService,
    public router: ActivatedRoute,
    public location: Location,
    public sanitizer: DomSanitizer,
    private packLanguage: PackLanguageService,
    private loginService: LoginService,
    private mailService: MailService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.clinicId = +this.router.snapshot.paramMap.get('id');
    this.language = this.helpService.getLanguage();
    this.getSuperAdmin()
      .pipe(
        switchMap(() => this.getClinic())
      )
      .subscribe(() => this.loading = false)
  }

  getSuperAdmin() {
    return this.accountService.getSuperadmin(this.clinicId)
      .pipe(
        map(res => {
          this.data = res[0];
          this.data.birthday = this.data && this.data.birthday ? new Date(this.data.birthday) : null;
          this.data.incompanysince = this.data && this.data.incompanysince ? new Date(this.data.incompanysince) : null;
          if (this.data.img && this.data.img.data.length !== 0) {
            this.imagePath = this.helpService.setUserProfileImagePath(this.data);
          } else {
            this.imagePath = "../../../../../assets/images/users/defaultUser.png";
          }
          return res;
        })
      );
  }

  getClinic() {
    return this.accountService.getClinicEmployees(this.clinicId).pipe(
      map((res: any) => {
        this.numberOfEmployees = res.length;
        return res;
      })
    );
  }

  editOptions() {
    // this.workTimeData();
    this.clinic.closeOnEscape = false;
    this.clinic.closeOnOutsideClick = false;
    this.clinic.hideCloseButton = true;
    this.clinic.open();
    // this.changeTheme(this.theme);
  }

  confirmClose(): void {
    this.clinic.modalRoot.nativeElement.focus();
    if (this.isFormDirty) {
      this.showDialog = true;
    } else {
      this.clinic.close()
      this.showDialog = false;
      this.isFormDirty = false
    }
  }

  receiveConfirm(event: boolean): void {
    if (event) {
      this.clinic.close();
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  updateClinic() {
    this.accountService.updateRegisteredClinic(this.data).subscribe((data) => {
      if (data) {
        this.helpService.successToastr(
          this.language.clinicsEditTitle,
          this.language.clinicSuccessUpdated
        );
        this.clinic.close();
        this.isFormDirty = false;
      } else {
        this.helpService.errorToastr(
          this.language.clinicsEditTitle,
          this.language.clinicErrorUpdated
        );
      }
    });
  }

  backToGrid() {
    this.location.back();
  }

  action(event) {
    //Delete action
    if (event === "yes") {
      this.accountService.deleteRegisteredClinic(this.data).subscribe((data) => {
        if (data) {
          this.helpService.successToastr(
            this.language.clinicSuccessDeleted,
            this.language.accountSuccessUpdatedAccountText
          );
          this.location.back();
        } else {
          this.helpService.errorToastr(
            this.language.clinicErrorDeleted,
            this.language.accountErrorUpdatedAccountText
          );
        }
      }, (error) => {
        console.log(error);
        this.helpService.errorToastr(
          this.language.clinicErrorDeleted,
          this.language.accountErrorUpdatedAccountText
        );
      });
    } else {
      this.dialogOpened = false;
    }
  }

  printUser() {
    window.print();
  }

  updateImage() {
    this.chooseImage.open();
  }

  submitPhoto() {
    let form = new FormData();

    form.append("updateImageInput", this.updateImageInput);
    this.accountService.updateProfileImage(form, this.data)
      .pipe(
        switchMap(() => this.getSuperAdmin())
      )
      .subscribe(
        () => {
          this.helpService.successToastr(
            this.language.accountSuccessUpdatedAccountTitle,
            this.language.accountSuccessUpdatedAccountText
          );
        },
        () => {
          this.helpService.errorToastr(
            this.language.accountErrorUpdatedAccountTitle,
            this.language.accountErrorUpdatedAccountText
          );
        }
      );
    this.chooseImage.close();
  }

  fileChoosen(event: any) {
    this.fileName = event.target.value.substring(event.target.value.indexOf('h') + 2);
    if (event.target.value) {
      this.isFileChoosen = true;
      this.updateImageInput = <File>event.target.files[0];
    } else {
      this.isFileChoosen = false;
    }
  }

  close(component) {
    this[component + "Opened"] = false;
  }

  open(component, id) {
    this[component + "Opened"] = true;
  }

  sendRecoveryLink() {
    const thisObject = this;
    thisObject.data["language"] = this.packLanguage.getLanguageForForgotMail();
    if (this.data.email !== "") {
      this.loginService.forgotPassword(this.data, function (exist, notVerified) {
        setTimeout(() => {
          if (exist) {
            thisObject.mailService
              .sendForgetMail(thisObject.data)
              .subscribe(
                (data) => {
                  thisObject.helpService.successToastr(
                    thisObject.language.sendPasswordRecovery,
                    thisObject.language.sendPasswordRecoverySucess
                  );
                },
                (error) => {
                  thisObject.helpService.errorToastr(
                    thisObject.language.sendPasswordRecovery,
                    thisObject.language.sendPasswordRecoveryError
                  );
                }
              );
          }
        }, 100);
      });
    }
  }

}
