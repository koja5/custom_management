import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/service/account.service';
import { HelpService } from 'src/app/service/help.service';
import { Location } from "@angular/common";
import { Modal } from "ngx-modal";
import Swal from "sweetalert2";
import { DomSanitizer } from "@angular/platform-browser";
import { UsersService } from 'src/app/service/users.service';
import { PackLanguageService } from 'src/app/service/pack-language.service';
import { LoginService } from 'src/app/service/login.service';
import { MailService } from 'src/app/service/mail.service';

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
  loading = true;
  theme: string;
  showDialog: boolean = false;
  isFormDirty: boolean = false;
  imagePath: any;
  updateImageInput: any;
  isFileChoosen: boolean = false;
  fileName: string = '';
  dialogOpened: boolean = false;

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
    this.clinicId = +this.router.snapshot.paramMap.get('id');
    this.language = this.helpService.getLanguage();
    this.getSuperAdmin();
    this.getClinic();
    
    setTimeout(() => {
      this.modelData();
    }, 1000);
  }

  modelData() {
    this.data.birthday = new Date(this.data.birthday);
    this.data.incompanysince = new Date(this.data.incompanysince);
    this.loading = false;
  }

  getSuperAdmin() {
    this.accountService.getSuperadmin(this.clinicId).subscribe(res => {
      this.data = res[0];
      if (this.data.img && this.data.img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(this.data.img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl(
          "data:image/png;base64," + base64String
        );
      
        this.imagePath = path;
      } else {
          this.imagePath = "../../../../../assets/images/users/defaultUser.png";
      }
    });
  }

  getClinic() {
    this.accountService.getClinicEmployees(this.clinicId).subscribe((res: any) => {
      this.numberOfEmployees = res.length;
    });
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
    if(this.isFormDirty) {
      this.showDialog = true;
    }else {
      this.clinic.close()
      this.showDialog = false;
      this.isFormDirty = false
    }
  }

  receiveConfirm(event: boolean): void {
    if(event) {
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
        Swal.fire({
          title: "Successfull!",
          text: "Successful update user!",
          timer: 3000,
          type: "success",
        });
        this.clinic.close();
        this.isFormDirty = false;
      }
    });
  }

  backToGrid() {
    this.location.back();
  }

  action(event) {
    if (event === "yes") {
      this.accountService.deleteRegisteredClinic(this.data).subscribe((data) => {
        if (data) {
          Swal.fire({
            title: "Successfull!",
            text: "Successful delete user!",
            timer: 3000,
            type: "success",
          });
          this.location.back();
        }
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
    this.accountService.updateProfileImage(form, this.data).subscribe(
      (data) => {
        this.helpService.successToastr(
          this.language.accountSuccessUpdatedAccountTitle,
          this.language.accountSuccessUpdatedAccountText
        );
      },
      (error) => {
        this.helpService.errorToastr(
          this.language.accountErrorUpdatedAccountTitle,
          this.language.accountErrorUpdatedAccountText
        );
      }
    );
    this.chooseImage.close();
    setTimeout(() => {
      this.getSuperAdmin();
    }, 0);
  }

  fileChoosen(event: any) {
    this.fileName = event.target.value.substring(event.target.value.indexOf('h') + 2);
    if (event.target.value) {
      this.isFileChoosen = true;
      this.updateImageInput = <File>event.target.files[0];
    }else {
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
