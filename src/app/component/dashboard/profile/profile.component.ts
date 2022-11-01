import { Component, OnInit, ViewChild } from "@angular/core";
import { UsersService } from "../../../service/users.service";
import { Modal } from "ngx-modal";
import { DomSanitizer, EventManager } from "@angular/platform-browser";
import { MessageService } from "../../../service/message.service";
import { UploadEvent, RemoveEvent } from "@progress/kendo-angular-upload";
import Swal from "sweetalert2";
import { HelpService } from "src/app/service/help.service";
import { AccountService } from "src/app/service/account.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  @ViewChild("chooseImage") chooseImage: Modal;
  public user = false;
  public data: any;
  public companyData: any;
  public currentTab = "profile";
  public imagePath: any;
  public uploadSaveUrl: string; // should represent an actual API endpoint
  public uploadRemoveUrl: string;
  public language: any;
  public id: number;
  updateImageInput: any;
  isFileChoosen: boolean = false;
  fileName: string = '';

  constructor(
    public service: UsersService,
    public sanitizer: DomSanitizer,
    public message: MessageService,
    private helpService: HelpService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.getMyProfile();
  }

  getMyProfile() {
    this.id = Number(localStorage.getItem("idUser"));
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.profile);

    this.service.getMe(localStorage.getItem("idUser"), (val) => {
      this.data = val[0];

      if (val[0].img && val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);

        let base64String = window.btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl(
          "data:image/png;base64," + base64String
        );
        this.imagePath = path;
      } else {
        this.imagePath = "../../../../assets/images/users/defaultUser.png";
      }
    });

    this.service.getCompany(this.helpService.getSuperadmin(), (val) => {
      if (val.length !== 0) {
        this.companyData = val[0];
      } else {
        this.companyData = [];
      }
    });
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
      this.getMyProfile();
    }, 0);
  }

  updateImage() {
    this.chooseImage.open();
  }

  changeTab(value: string) {
    this.currentTab = value;
  }

  updateUser(event) {
    this.service.updateUser(this.data).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateTextProfile,
          timer: 3000,
          type: "success",
        });
        this.user = false;
      }
    });
  }

  uploadPhoto(event: any) {}

  removeEventHandler(event) {}
}
