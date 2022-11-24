import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CustomersService } from "../../../../service/customers.service";
import { MessageService } from "../../../../service/message.service";
import { Modal } from "ngx-modal";
import { FileUploader, FileItem } from "ng2-file-upload";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { ComplaintTherapyModel } from "../../../../models/complaint-therapy-model";
import { UsersService } from "../../../../service/users.service";
import { DatePipe } from "@angular/common";
import { BaseOneModel } from "../../../../models/base-one-model";
import { BaseTwoModel } from "src/app/models/base-two-model";
import { PhysicalModel } from "src/app/models/physical-model";
import { TaskService } from "src/app/service/task.service";
import { ToastrService } from "ngx-toastr";
import {
  SortDescriptor,
  process,
  State,
} from "@progress/kendo-data-query";
import { MailService } from "src/app/service/mail.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { LoginService } from "src/app/service/login.service";
import { HelpService } from "src/app/service/help.service";
import { AccountService } from "src/app/service/account.service";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { GridComponent } from "@progress/kendo-angular-grid";

@Component({
  selector: "app-base-date",
  templateUrl: "./base-date.component.html",
  styleUrls: ["./base-date.component.scss"],
})
export class BaseDateComponent implements OnInit {
  @ViewChild("upload") upload: Modal;
  @Input() type;
  @Input() data;
  @Input() date;
  @Input() doctor;
  @Input() imagePath;
  @Output() reload: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitImage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("complaint") complaint: Modal;
  @ViewChild("therapy") therapy: Modal;
  @ViewChild("customer") customer: Modal;
  @ViewChild("document_edit") document_edit: Modal;
  @ViewChild("settingsWindow") settingsWindow: Modal;
  @ViewChild("chooseImage") chooseImage: Modal;

  isFileChoosen: boolean = false;
  fileName: string = '';
  updateImageInput: any;
  currentUser: any;
  public maleImg = "../../../../../assets/images/users/male-patient.png";
  public femaleImg = "../../../../../assets/images/users/female-patient.png";
  public dialogOpened = false;
  public dialogComplaintOpened = false;
  public dialogTherapyOpened = false;
  public dialogDocumentOpened = false;
  public uploader: FileUploader;
  public documents: any;
  public documentsData: any;
  public language: any;
  //public url = "http://localhost:3000/upload";
  public url = "http://116.203.85.82:" + location.port + "/upload";
  public complaintValue: any;
  public complaintData = new ComplaintTherapyModel();
  public gridComplaint: any;
  public gridComplaintData: any;
  public therapyValue: any;
  public treatmentValue: any;
  public gridTherapy: any;
  public gridTherapyData: any;
  public stateValue: any;
  public loadingGrid: any;
  public loading = true;
  public currentTab = "profile";
  public currentTabGrid = "complaint";
  public recommendationList: any;
  public baseDataOne: any;
  public baseDataTwo: any;
  public physicalIllness: any;
  public relationshipList: any;
  public socialList: any;
  public doctorList: any;
  public doctorsList: any;
  public doctorsListTmp: any;
  public selectedRecommendation: any;
  public operationMode = "add";
  public selectedComplaint: any;
  public selectedTherapies: any;
  public selectedTreatment: any;
  public currentComplaint: any;
  public selectedForDelete: string;
  public allUsers: any;
  public selectedUser: any;
  public loadingTherapy = false;
  public theme: string;
  public ourFile: File;
  public fileDescription = [];
  public documentItem: any;
  public loadingGridComplaint = false;
  public loadingGridTherapy = false;
  public loadingGridDocument = false;
  isFormDirty: boolean = false;
  showDialog: boolean = false;
  showDialogChangeTab: boolean = false;
  changeTabName: string;
  public emailValid = true;
  public sort: SortDescriptor[] = [
    {
      field: "date",
      dir: "desc",
    },
  ];
  public stateComplaint: State = {
    sort: [
      {
        field: "date",
        dir: "desc",
      },
    ],
  };
  public stateTherapy: State = {
    sort: [
      {
        field: "date",
        dir: "desc",
      },
    ],
  };
  public stateDocument: State = {
    sort: [
      {
        field: "date",
        dir: "desc",
      },
    ],
  };
  private _allComplaintData: ExcelExportData;

  constructor(
    public router: ActivatedRoute,
    public service: CustomersService,
    public taskService: TaskService,
    public message: MessageService,
    public usersService: UsersService,
    private accountService: AccountService,
    private toastr: ToastrService,
    private mailService: MailService,
    private loginService: LoginService,
    private packLanguage: PackLanguageService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    var datetimestamp = Date.now();

    this.uploader = new FileUploader({
      url: this.url /*,
      additionalParameter: { comments: this.data.id },
      disableMultipart: true,
      formatDataFunctionIsAsync: true,
      formatDataFunction: item => {
        return new Promise((resolve, reject) => {
          resolve({
            customer_id: this.data.id,
            name: item._file.name,
            type: item._file.type,
            size: item._file.size,
            description: item.alias,
            filename:  'file-' + datetimestamp + '.' + item.file.name.split('.')[item.file.name.split('.').length - 1],
            date: item.formData
          });
        });
      }*/,
    });

    this.getCurrentUser();

    this.uploader.onBuildItemForm = (fileItem: FileItem, form: any) => {
      form.append("description", fileItem.file["description"]);
      form.append(
        "date",
        fileItem.file.lastModifiedDate !== undefined
          ? fileItem.file.lastModifiedDate
          : new Date()
      );
      form.append("customer_id", this.data.id);
    };

    this.language = JSON.parse(localStorage.getItem("language"));

    this.getParameters();
    this.getDocument();
    this.getComplaint();
    this.getTherapy();

    if (localStorage.getItem("theme") !== null) {
      this.theme = localStorage.getItem("theme");
    }
    setTimeout(() => {
      this.changeTheme(this.theme);
    }, 500);

    this.message.getTheme().subscribe((mess) => {
      this.changeTheme(mess);
      this.theme = mess;
    });

    this.convertStringToDate();
  }

  getCurrentUser() {
    this.usersService.getMe(localStorage.getItem("idUser"), (val) => {
      this.currentUser = val[0];
    });
  }

  sendRecoveryLink() {
    const thisObject = this;
    thisObject.data["language"] = this.packLanguage.getLanguageForForgotMail();
    if (this.data.email !== "") {
      this.loginService.forgotPassword(
        this.data,
        function (exist, notVerified) {
          setTimeout(() => {
            if (exist) {
              thisObject.mailService.sendForgetMail(thisObject.data).subscribe(
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
        }
      );
    }
  }

  convertStringToDate() {
    if (this.data.birthday) {
      this.data.birthday = new Date(this.data.birthday);
    } else {
      this.data.birthday = new Date();
    }
  }

  getParameters() {
    this.service
      .getParameters("Complaint", localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        this.complaintValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.service
      .getParameters("Therapy", localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        this.therapyValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.usersService.getCompanyUsers(localStorage.getItem("idUser"), (val) => {
      this.allUsers = val;
    });

    this.service
      .getParameters("Treatment", localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        this.treatmentValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.stateValue = JSON.parse(localStorage.getItem("language"))["state"];
  }

  getComplaint() {
    this["loadingGridComplaint"] = true;
    this.service.getComplaintForCustomer(this.data.id).subscribe((data: []) => {
      this.gridComplaint = process(data, this.stateComplaint);
      this.gridComplaintData = data;
      this._allComplaintData = <ExcelExportData>{
        data: process(this.gridComplaintData, this.stateComplaint).data,
      }
      this["loadingGridComplaint"] = false;
      this.loading = false;
    });
  }

  convertStringToArray(data) {
    let arrayData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].complaint.split(";") !== undefined) {
        arrayData.push(data[i].complaint.split(";").map(Number));
      } else {
        arrayData.push(Number(data[i].complaint));
      }
    }
    return arrayData;
  }

  customerOpen() {
    this.customer.closeOnEscape = false;
    this.customer.closeOnOutsideClick = false;
    this.customer.hideCloseButton = true;
    this.customer.open();
  }

  settingsWindowOpen() {
    this.settingsWindow.closeOnEscape = false;
    this.settingsWindow.closeOnOutsideClick = false;
    this.settingsWindow.hideCloseButton = true;
    this.settingsWindow.open();
  }

  getTherapy() {
    this["loadingGridTherapy"] = true;
    this.service.getTherapyForCustomer(this.data.id).subscribe((data: []) => {
      this.gridTherapy = process(data, this.stateTherapy);
      this.gridTherapyData = data.map((item: []) => {
        item["date"] = new Date(item["date"]);
        return item;
      });
      this["loadingGridTherapy"] = false;
      this.loading = false;
    });
  }

  getDocument() {
    this["loadingGridDocument"] = true;
    this.service.getDocuments(this.data.id, (val: []) => {
      this.documents = process(val, this.stateDocument);
      this.documentsData = val;
      this["loadingGridDocument"] = false;
      this.loading = false;
    });
  }

  formatingData(data) {
    const datePipe = new DatePipe("en-US");
    for (let i = 0; i < data["length"]; i++) {
      data[i].date = datePipe.transform(data[i].date, "dd/MM/yyyy");
      const stringToArray = [];
      if (data[i].complaint.split(";") !== undefined) {
        stringToArray.push(data[i].complaint.split(";").map(Number));
      } else {
        stringToArray.push(Number(data[i].complaint));
      }
      let complaintString = "";
      for (let j = 0; j < stringToArray.length; j++) {
        complaintString += this.getTitle(this.complaintValue, stringToArray[j]);
      }
      data[i].complaint = complaintString;
    }
    return data;
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

  public close(component) {
    this[component + "Opened"] = false;
  }

  open(component, id) {
    this[component + "Opened"] = true;
    this.selectedForDelete = id;
    this.changeTheme(this.theme);
  }

  action(event) {
    if (event === "yes") {
      this.service.deleteCustomer(this.data.id, (val) => {
        this.message.sendDeleteCustomer();
        this.dialogOpened = false;
      });
    } else {
      this.dialogOpened = false;
    }
  }

  deleteComplaint(event) {
    if (event === "yes") {
      this.service.deleteComplaint(this.selectedForDelete).subscribe((data) => {
        if (data) {
          this.getComplaint();
        }
      });
    }
    this.dialogComplaintOpened = false;
  }

  receiveConfirm(event: boolean, modal: Modal): void {
    if (event) {
      modal.close();
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }

  confirmClose(modal: Modal): void {
    modal.modalRoot.nativeElement.focus();
    if (this.isFormDirty) {
      this.showDialog = true;
    } else {
      modal.close();
      this.showDialog = false;
      this.isFormDirty = false;
    }
  }

  isDirty(): void {
    this.isFormDirty = true;
  }

  editCustomer() {
    this.date.birthday = new Date(this.date.birthday);
    this.customer.closeOnEscape = false;
    this.customer.closeOnOutsideClick = false;
    this.customer.hideCloseButton = true;
    this.customer.open();
  }

  updateCustomer(customer) {
    this.data.shortname = this.data.lastname + " " + this.data.firstname;
    this.service.updateCustomer(this.data, (val) => {
      if (val.success) {
        this.customer.close();
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateText
            .toString()
            .replace("{content}", this.data.shortname),
          timer: 3000,
          type: "success",
          onClose: () => {
          },
        });
      }
    });
    this.isFormDirty = false;
  }

  onChange(event) {
    this.data.birthday = event;
  }

  downloadFile(filename: string) {
    console.log(filename);
    this.service.downloadFile(filename).subscribe(
      (data) => saveAs(data, filename),
      (error) => console.error(error)
    );
  }

  previewDocument(filename: string) {
    this.service.getPdfFile(filename).subscribe((data) => {
      console.log(data);
      let file = new Blob([data], { type: "application/pdf" });
      console.log(file);
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    });
  }

  deleteDocument(event) {
    if (event === "yes") {
      console.log(this.data);
      const pathSplit = this.selectedForDelete["path"].replace(
        new RegExp("\\\\", "gi"),
        "/"
      );
      const object = {
        path: this.selectedForDelete["path"].replace(
          new RegExp("\\\\", "gi"),
          "/"
        ),
      };
      this.service.deleteDocument(object).subscribe((data) => {
        console.log(data);
      });
      this.service
        .deleteDocumentFromDatabase(this.selectedForDelete["id"])
        .subscribe((data) => {
          if (data) {
            this.getDocument();
          }
        });
    }
    this.dialogDocumentOpened = false;
  }

  backToGrid() {
    this.message.sendBackToCustomerGrid();
  }

  openComplaintModal() {
    this.selectedComplaint = [];
    this.selectedTherapies = [];
    this.selectedTreatment = [];
    this.complaintData = new ComplaintTherapyModel();
    this.complaintData.complaint = "";
    this.complaintData.therapies = "";
    this.operationMode = "add";
    // this.complaintValue = JSON.parse(localStorage.getItem('language'))['complaint'];
    // this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];
    this.service
      .getParameters("Therapy", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        console.log(data);
        this.therapyValue = data;
      });
    this.service
      .getParameters("Complaint", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.complaintValue = data;
      });
    this.complaint.closeOnEscape = false;
    this.complaint.closeOnOutsideClick = false;
    this.complaint.hideCloseButton = true;
    this.complaint.open();
  }

  openTherapyModal() {
    /*this.selectedComplaint = [];
    this.selectedTherapies = [];
    this.selectedTreatment = [];*/
    this.complaintData.state = null;
    this.complaintData = new ComplaintTherapyModel();
    this.complaintData.complaint = "";
    this.complaintData.therapies = "";
    this.operationMode = "add";
    /*this.complaintValue = JSON.parse(localStorage.getItem('language'))[
      'complaint'
    ];
    this.therapyValue = JSON.parse(localStorage.getItem('language'))['therapy'];*/
    this.service
      .getParameters("Therapy", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.therapyValue = data;
      });
    this.service
      .getParameters("Complaint", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.complaintValue = data;
      });

    this.therapy.open();
  }

  /*selectComplaint(event) {
    console.log(event);
    this.complaintData.complaint = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.complaint += element.title + ';';
    });
  }

  selectTherapies(event) {
    console.log(event);
    this.complaintData.therapies = '';
    event.forEach(element => {
      console.log(element);
      this.complaintData.therapies += element.title + ';';
    });
  }*/

  selectedState(event) {
    this.complaintData.state = event;
  }

  addComplaint(event) {
    this.complaintData.customer_id = this.data.id;
    // this.complaintData.date = this.getTodayDate();

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
      this.treatmentValue
    ).value;
    this.complaintData.therapies_title = this.pickToModel(
      this.selectedTherapies,
      this.treatmentValue
    ).title;

    if (localStorage.getItem("username") === null) {
      this.usersService.getMe(localStorage.getItem("idUser"), (val) => {
        console.log(val);
        localStorage.setItem("username", val[0]["shortname"]);
        this.complaintData.employee_name = val[0]["shortname"];
        console.log(this.complaintData);
        this.service.addComplaint(this.complaintData).subscribe((data) => {
          if (data) {
            this.getComplaint();
            this.complaint.close();
            /*Swal.fire({
              title: "Successfull!",
              text: "New complaint is successfull added!",
              timer: 3000,
              type: "success"
            });*/
            this.toastr.success(
              "Successfull!",
              "New complaint is successfull added!",
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
            this.selectedComplaint = [];
            this.selectedTherapies = [];
          } else {
            Swal.fire({
              title: "Error",
              text: "New complaint is not added!",
              timer: 3000,
              type: "error",
            });
          }
        });
      });
    } else {
      this.complaintData.employee_name = localStorage.getItem("username");
      this.service.addComplaint(this.complaintData).subscribe((data) => {
        if (data) {
          this.getComplaint();
          this.complaint.close();
          /*Swal.fire({
            title: "Successfull!",
            text: "New complaint is successfull added!",
            timer: 3000,
            type: "success"
          });*/

          this.toastr.success(
            "Successfull!",
            "New complaint is successfull added!",
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
          this.selectedComplaint = [];
          this.selectedTherapies = [];
        } else {
          Swal.fire({
            title: "Error",
            text: "New complaint is not added!",
            timer: 3000,
            type: "error",
          });
        }
      });
    }
    this.isFormDirty = false;
  }

  getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    return (
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hh === 0 ? "00" : min) +
      ":" +
      (min < 10 ? "0" + min : min)
    );
  }

  pickToModel(data: any, titleValue) {
    let value = "";
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

  updateComplaint(complaint) {
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
      this.treatmentValue
    ).value;
    this.complaintData.therapies_title = this.pickToModel(
      this.selectedTherapies,
      this.treatmentValue
    ).title;

    this.service.updateComplaint(this.complaintData).subscribe((data) => {
      if (data) {
        this.getComplaint();
        this.complaint.close();
        Swal.fire({
          title: "Successfull!",
          text: "Complaint is successfull updated!",
          timer: 3000,
          type: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Complaint is not updated!",
          timer: 3000,
          type: "error",
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
    });
    this.isFormDirty = false;
  }

  addTherapy(therapy) {
    this.complaintData.customer_id = this.data.id;
    // this.complaintData.date = this.getTodayDate();
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
      this.selectedTreatment,
      this.therapyValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatment,
      this.therapyValue
    ).title;

    this.service.addTherapy(this.complaintData).subscribe((data) => {
      if (data["success"]) {
        this.getTherapy();
        this.therapy.close();
        Swal.fire({
          title: "Successfull!",
          text: "New therapy is successfull added!",
          timer: 3000,
          type: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "New therapy is not added!",
          timer: 3000,
          type: "error",
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
    });
    this.isFormDirty = false;
  }

  updateTherapy(event) {
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
      this.selectedTreatment,
      this.therapyValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatment,
      this.therapyValue
    ).title;

    this.service.updateTherapy(this.complaintData).subscribe((data) => {
      if (data) {
        this.getTherapy();
        this.therapy.close();
        Swal.fire({
          title: "Successfull!",
          text: "Therapy is successfull updated!",
          timer: 3000,
          type: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Therapy is not updated!",
          timer: 3000,
          type: "error",
        });
      }
      this.selectedComplaint = [];
      this.selectedTherapies = [];
      this.selectedTreatment = [];
    });
    this.isFormDirty = false;
  }

  editTherapy(event) {
    this.complaintData = event;
    this.loadingTherapy = true;

    if (event.complaint.split(";") !== undefined) {
      this.selectedComplaint = event.complaint.split(";").map(Number);
    } else {
      this.selectedComplaint = Number(event.complaint);
    }
    if (event.therapies.split(";") !== undefined) {
      this.selectedTherapies = event.therapies.split(";").map(Number);
    } else {
      this.selectedTherapies = Number(event.therapies);
    }
    if (event.therapies_previous.split(";") !== undefined) {
      this.selectedTreatment = event.therapies_previous.split(";").map(Number);
    } else {
      this.selectedTreatment = Number(event.therapies_previous);
    }
    if (event.em !== undefined && event.em !== null) {
      this.usersService.getUserWithId(event.em, (val) => {
        this.selectedUser = val[0];
        this.loadingTherapy = false;
      });
    } else {
      this.loadingTherapy = false;
    }
    this.therapy.open();
    this.operationMode = "edit";
  }

  deleteTherapy(event) {
    if (event === "yes") {
      console.log(this.data);
      this.service.deleteTherapy(this.selectedForDelete).subscribe((data) => {
        console.log(data);
        if (data) {
          this.getTherapy();
        }
      });
    }
    this.dialogTherapyOpened = false;
  }

  initializeParams() {
    this.complaintData.cs_title = "";
    this.complaintData.em = "";
  }

  receiveConfirmChangeTab(flag: boolean) {
    if (flag) {
      this.isFormDirty = false;
      this.changeTab(this.changeTabName);
    } else {
      this.showDialogChangeTab = false;
    }
  }

  changeTab(tab) {
    this.changeTabName = tab;
    if (this.isFormDirty) {
      this.showDialogChangeTab = true;
    } else {
      this.currentTab = tab;
      // this.baseData = null;
      if (tab === "base_one") {
        this.initializeBaseOneData();
      } else if (tab === "base_two") {
        this.service.getBaseDataTwo(this.data.id).subscribe((data) => {
          if (data["length"] !== 0) {
            this.baseDataTwo = data[0];
            this.baseDataTwo.birthday = new Date(this.baseDataTwo.birthday);
            this.operationMode = "edit";
          } else {
            if (
              this.isEmptyObject(this.baseDataTwo) ||
              this.baseDataTwo === undefined
            ) {
              this.baseDataTwo = new BaseTwoModel();
            }
            this.operationMode = "add";
            console.log(this.baseDataTwo);
          }
        });
      } else if (tab === "physical_illness") {
        this.service.getPhysicallIllness(this.data.id).subscribe((data) => {
          if (data["length"] !== 0) {
            this.physicalIllness = data[0];
            this.operationMode = "edit";
          } else {
            if (
              this.isEmptyObject(this.physicalIllness) ||
              this.physicalIllness === undefined
            ) {
              this.physicalIllness = new PhysicalModel();
            }
            this.operationMode = "add";
          }
        });
      }
      this.showDialogChangeTab = false;
      this.isFormDirty = false;
    }
  }

  changeTabGrid(tab) {
    this.currentTabGrid = tab;
    if (tab === "complaint") {
      this.getComplaint();
    } else if (tab === "therapy") {
      this.getTherapy();
    } else if (tab === "document") {
      this.getDocument();
    }
  }

  getTranslate(title) {
    if (title === "profile") {
      return this.language.profile;
    } else if (title === "base_one") {
      return this.language.baseDataOne;
    } else if (title === "base_two") {
      return this.language.baseDataTwo;
    } else if (title === "physical_illness") {
      return this.language.physicalIllness;
    } else if (title === "add") {
      return this.language.addComplaint;
    } else if (title === "edit") {
      return this.language.updateComplaint;
    } else if (title === "addTherapy") {
      return this.language.addTherapy;
    } else if (title === "editTherapy") {
      return this.language.updateTherapy;
    }
    return null;
  }

  initializeBaseOneData() {
    this.service
      .getCustomerList("Recommendation", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.recommendationList = data;
      });

    this.service
      .getCustomerList("Relationship", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.relationshipList = data;
      });

    this.service
      .getCustomerList("Social", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.socialList = data;
      });

    this.service
      .getCustomerList("Doctor", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.doctorList = data;
      });
    this.service
      .getCustomerList("Doctors", localStorage.getItem("superadmin"))
      .subscribe((data) => {
        this.doctorsList = data;
        this.doctorsListTmp = this.doctorsList.slice();
        this.doctorsListTmp.forEach(doctor => {
          const firstName = doctor.firstname ? doctor.firstname : '';
          const lastName = doctor.lastname ? doctor.lastname : '';
          doctor.fullname = firstName + ' ' + lastName;
        });
      });

    this.service.getBaseDataOne(this.data.id).subscribe((data) => {
      console.log(data);
      if (data["length"] !== 0) {
        this.baseDataOne = data[0];
        this.baseDataOne.first_date = new Date(this.baseDataOne.first_date);
        if (this.baseDataOne.recommendation.split(";") !== undefined) {
          this.selectedRecommendation = this.baseDataOne.recommendation
            .split(";")
            .map(Number);
        } else {
          this.selectedRecommendation = Number(this.baseDataOne.recommendation);
        }
        this.operationMode = "edit";
      } else {
        if (
          this.isEmptyObject(this.baseDataOne) ||
          this.baseDataOne === undefined
        ) {
          this.baseDataOne = new BaseOneModel();
        }
        this.operationMode = "add";
      }
    });
  }

  isEmptyObject(obj) {
    return obj && Object.keys(obj).length === 0;
  }

  addBaseDataOne() {
    let recommendation = "";
    // tslint:disable-next-line: prefer-for-of
    if (this.selectedRecommendation) {
      for (let i = 0; i < this.selectedRecommendation.length; i++) {
        recommendation += this.selectedRecommendation[i] + ";";
      }
      recommendation = recommendation.substring(0, recommendation.length - 1);
    }
    this.baseDataOne.customer_id = this.data.id;
    this.baseDataOne.recommendation = recommendation;
    this.service.addBaseDataOne(this.baseDataOne).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: this.language.successAddDataTitle,
          text: this.language.successAddDataText,
          timer: 3000,
          type: "success",
        });
        this.customer.close();
      }
    });
  }

  updateBaseDataOne() {
    let recommendation = "";
    // tslint:disable-next-line: prefer-for-of
    if (this.selectedRecommendation) {
      for (let i = 0; i < this.selectedRecommendation.length; i++) {
        recommendation += this.selectedRecommendation[i] + ";";
      }
      recommendation = recommendation.substring(0, recommendation.length - 1);
    }
    this.baseDataOne.customer_id = this.data.id;
    this.baseDataOne.recommendation = recommendation;
    this.service.updateBaseDataOne(this.baseDataOne).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateData,
          timer: 3000,
          type: "success",
        });
        this.customer.close();
      }
    });
    this.isFormDirty = false;
  }

  addBaseDataTwo() {
    console.log(this.baseDataTwo);
    this.baseDataTwo.customer_id = this.data.id;
    this.service.addBaseDataTwo(this.baseDataTwo).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: this.language.successAddDataTitle,
          text: this.language.successAddDataText,
          timer: 3000,
          type: "success",
        });
        this.customer.close();
      }
    });
  }

  updateBaseDataTwo() {
    console.log(this.baseDataTwo);
    this.baseDataTwo.customer_id = this.data.id;
    this.service.updateBaseDataTwo(this.baseDataTwo).subscribe((data) => {
      console.log(data);
      if (data) {
        Swal.fire({
          title: this.language.successUpdateTitle,
          text: this.language.successUpdateData,
          timer: 3000,
          type: "success",
        });
        this.customer.close();
      }
    });
    this.isFormDirty = false;
  }

  addPhysicalIllness(physical) {
    this.physicalIllness.customer_id = this.data.id;
    this.service.addPhysicalIllness(this.physicalIllness).subscribe((data) => {
      if (data) {
        Swal.fire({
          title: this.language.successAddDataTitle,
          text: this.language.successAddDataText,
          timer: 3000,
          type: "success",
        });
        this.customer.close();
      }
    });
    this.isFormDirty = false;
  }

  updatePhysicalIllness(physical) {
    this.physicalIllness.customer_id = this.data.id;
    this.service
      .updatePhysicalIllness(this.physicalIllness)
      .subscribe((data) => {
        if (data) {
          Swal.fire({
            title: this.language.successUpdateTitle,
            text: this.language.successUpdateData,
            timer: 3000,
            type: "success",
          });
          this.customer.close();
        }
      });
    this.isFormDirty = false;
  }

  editMode() {
    this.operationMode = "edit";
  }

  mapToInt(data: string) {
    console.log(data);
    return data.split(";").map(Number);
  }

  onPanelChange(event) {
    if (this.baseDataOne === undefined) {
      this.initializeBaseOneData();
    }
  }

  editComplaint(event) {
    this.complaintData = event;
    if (event.complaint.split(";") !== undefined) {
      this.selectedComplaint = event.complaint.split(";").map(Number);
    } else {
      this.selectedComplaint = Number(event.complaint);
    }
    if (event.therapies.split(";") !== undefined) {
      this.selectedTherapies = event.therapies.split(";").map(Number);
    } else {
      this.selectedTherapies = Number(event.therapies);
    }
    this.operationMode = "edit";
    this.complaint.open();
  }

  uploadOpen() {
    this.upload.closeOnEscape = false;
    this.upload.closeOnOutsideClick = false;
    this.upload.hideCloseButton = true;
    this.upload.open();
  }

  closeUploadModal() {
    this.getDocument();
    this.upload.close();
  }

  onValueUserEmChange(event) {
    this.complaintData.em = event.id;
    this.complaintData.em_title = event.lastname + " " + event.firstname;
  }

  valueChangeState(event) {
    this.complaintData.state = event;
  }

  changeTheme(theme: string) {
    setTimeout(() => {
      if (localStorage.getItem("allThemes") !== undefined) {
        const allThemes = JSON.parse(localStorage.getItem("allThemes"));
        console.log(allThemes);
        let items = document.querySelectorAll(".k-dialog-titlebar");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const themeName = allThemes[j]["name"];
            console.log(clas);
            clas.remove("k-dialog-titlebar-" + themeName);
            clas.add("k-dialog-titlebar-" + theme);
          }
        }

        items = document.querySelectorAll(".k-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("gridHeader-" + element);

            clas.add("gridHeader-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-numbers");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-numbers-" + element);
            clas.add("k-pager-numbers-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-select");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-select-" + element);
            clas.add("k-select-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-grid-table");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-table-" + element);
            clas.add("k-grid-table-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-grid-header");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-grid-header-" + element);
            clas.add("k-grid-header-" + this.theme);
          }
        }
        items = document.querySelectorAll(".k-pager-wrap");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("k-pager-wrap-" + element);
            clas.add("k-pager-wrap-" + this.theme);
          }
        }

        items = document.querySelectorAll(".k-button");
        for (let i = 0; i < items.length; i++) {
          const clas = items[i].classList;
          for (let j = 0; j < allThemes.length; j++) {
            const element = allThemes[j]["name"];
            clas.remove("inputTheme-" + element);
            clas.add("inputTheme-" + this.theme);
          }
        }
      }
    }, 50);
  }

  filterDoctor(event) {
    this.doctorsListTmp = this.doctorsList.filter((doctor) => doctor.fullname.toLowerCase().indexOf(event.toLowerCase()) !== -1);
  }

  printCustomer() {
    window.print();
  }

  editDocuments(item) {
    this.document_edit.closeOnEscape = false;
    this.document_edit.closeOnOutsideClick = false;
    this.document_edit.hideCloseButton = true;
    this.document_edit.open();
    this.documentItem = item;
    if (
      this.documentItem.date !== null &&
      this.documentItem.date !== undefined
    ) {
      this.documentItem.date = new Date(this.documentItem.date);
    }
  }

  updateDocument() {
    this.service.updateDocument(this.documentItem).subscribe((data) => {
      if (data) {
        this.document_edit.close();
        this.toastr.success("Successfull!", "Document update successfuly!", {
          timeOut: 7000,
          positionClass: "toast-bottom-right",
        });
      } else {
        this.toastr.error("Error!", "Document is not updated!", {
          timeOut: 7000,
          positionClass: "toast-bottom-right",
        });
      }
    });
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
        this.emitImage.emit(this.data);
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
      this.getCurrentUser();
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

  public sortChange(
    sort: SortDescriptor[],
    stateType,
    viewData,
    allData
  ): void {
    this[stateType].sort = sort;
    this[viewData] = process(this[allData], this[stateType]);
  }

  public allPages: boolean;

  @ViewChild('complaintGrid') complaintGrid;
  @ViewChild('therapyGrid') therapyGrid;
  @ViewChild('documentsGrid') documentsGrid;

  exportComplaintPDF(): void {
    this.complaintGrid.saveAsPDF();
  }

  exportTherapyPDF(value: boolean): void {
    this.therapyGrid.saveAsPDF();
  }

  exportDocumentsPDF(value: boolean): void {
    this.documentsGrid.saveAsPDF();
  }

}
