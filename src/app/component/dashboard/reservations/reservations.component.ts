import { Component, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";
import { MailService } from "src/app/service/mail.service";
import { MessageService } from "src/app/service/message.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { ReservationsService } from "src/app/service/reservations.service";

@Component({
  selector: "app-reservations",
  templateUrl: "./reservations.component.html",
  styleUrls: ["./reservations.component.scss"],
})
export class ReservationsComponent implements OnInit {
  public path = "grid";
  public name = "reservations";
  public showDialog = false;
  public language: any;
  public data: any;

  constructor(
    private service: ReservationsService,
    private helpService: HelpService,
    private messageService: MessageService,
    private packLanguage: PackLanguageService,
    private mailService: MailService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  actionEmitter(event) {
    this.data = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      if (this.data.request.type.toString().toLowerCase() === "get") {
      } else if (this.data.request.type.toString().toLowerCase() === "post") {
        this.callApiPost(
          this.data.request.api,
          this.helpService.findValueByField(
            this.data.data,
            this.data.request.root,
            this.data.request.fields
          )
        );
      }
    }
    this.showDialog = false;
  }

  callApiPost(api, value) {
    const mail = {
      id: value,
      superadmin: this.helpService.getSuperadmin(),
      email: this.data.data.email,
      firstname: this.data.data.firstname ? this.data.data.firstname : "",
      language: this.packLanguage.getLanguageForInfoForApproveReservation(),
    };
    if (this.data.id === "approve") {
      this.deleteReservation(api, value);
      this.mailService.sendInfoForApproveReservation(mail).subscribe((data) => {
        if (data) {
        }
      });
    } else if (this.data.id === "deny") {
      const mail = {
        id: value,
        superadmin: this.helpService.getSuperadmin(),
        email: this.data.data.email,
        firstname: this.data.data.firstname ? this.data.data.firstname : "",
        language: this.packLanguage.getLanguageForInfoForDenyReservation(),
      };

      this.mailService.sendInfoForDenyReservation(mail).subscribe((data) => {
        console.log(data);
        if (data) {
          this.deleteReservation(api, value);
        }
      });
    }
  }

  deleteReservation(api, value) {
    this.service.callApiPost(api, { id: value }).subscribe((data) => {
      if (data) {
        this.helpService.successToastr(
          "",
          this.language.reservationSuccessUpdateText
        );
        this.messageService.sendRefreshDynamicGrid();
      } else {
        this.helpService.errorToastr(
          "",
          this.language.reservationErrorUpdateText
        );
      }
    });
  }
}
