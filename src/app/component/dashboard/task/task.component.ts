import { ComplaintTherapyModel } from './../../../models/complaint-therapy-model';
import { UserModel } from './../../../models/user-model';
import { CustomerModel } from "./../../../models/customer-model";
import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  HostListener,
  NgZone,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CustomersService } from "../../../service/customers.service";
import { CustomersComponent } from "../customers/customers.component";
import { Modal } from "ngx-modal";
import { MessageService } from "../../../service/message.service";
import {
  CancelEvent,
  CrudOperation,
  EditMode,
  EventClickEvent,
  RemoveEvent,
  SaveEvent,
  SchedulerComponent,
  SlotClickEvent,
  CreateFormGroupArgs,
  SchedulerEvent,
} from "@progress/kendo-angular-scheduler";
import "@progress/kendo-angular-intl/locales/de/all";
import { filter } from "rxjs/operators/filter";
import { StoreService } from "../../../service/store.service";
import { TaskService } from "../../../service/task.service";
import { isNumber } from "util";
import Swal from "sweetalert2";
import { MongoService } from "../../../service/mongo.service";
import { ToastrService } from "ngx-toastr";
import { UsersService } from '../../../service/users.service';
import { EventCategoryService } from '../../../service/event-category.service';

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TaskComponent implements OnInit {
  @ViewChild("customerUserModal") customerUserModal: Modal;
  @ViewChild("customerModal") customerModal: Modal;
  @ViewChild("customerUserModal2") customerUserModal2: Modal;
  @ViewChild("quickPreview") quickPreview: Modal;
  @ViewChild("scheduler") public scheduler: SchedulerComponent;
  public selectedDate: Date = new Date();
  public formGroup: FormGroup;
  public events: SchedulerEvent[] = [];
  public customerUsers = [];
  public telephoneValue = "";
  public type: any;
  public customerComponent: CustomersComponent;
  public usersInCompany: any = [];
  public colorTask: any;
  public zIndex: string;
  public theme: string;
  public selected = "#cac6c3";
  public palette: any[] = [];
  public colorPalette: any;
  public selectedColorId: any;
  public language: any;
  public languageUser: any;
  public resources: any[] = [];
  public customerUser = new CustomerModel();
  public mobileValue = "";
  public data = new UserModel();
  public value: any = [];
  public store: any;
  public calendars: any = [];
  public loading = true;
  public createFormLoading: boolean;
  public orientation = "horizontal";
  public workTime: any[] = [];
  public selectedStoreId: number;
  public splitterSizeFull = 100;
  public splitterSize: number;
  public dateEvent: string;
  public selectedViewIndex = 0;
  public currentDate = new Date();
  public startWork = "08:00";
  public endWork = "22:00";
  public timeDuration = "60";
  public therapyDuration = 1;
  public loopIndex = 0;
  public valueLoop: any;
  public size = [];
  public selectedButtonIndex = [false, false, false, false, false, false];
  public selectedButtonIndexStyle = ["", "", "", "", "", ""];
  public imagePath = "defaultUser";
  public therapyValue: any;
  public treatmentValue: any;
  public complaintValue: any;
  public CSValue: any;
  public stateValue: any;
  public complaintData = new ComplaintTherapyModel();
  public selectedComplaint: any;
  public selectedTherapies: any;
  public selectedTreatments: any;
  public baseDataIndicator = false;
  public allUsers: any;
  public selectedUser: any;
  public userWidth = "22%";
  public id: number;
  public customerLoading = false;
  public quickPreviewEvent: any;
  public height: any;
  public calendarHeight: any;
  public eventCategory: any;
  public currentTopPosition: any = [];
  private eventOptions: boolean | { capture?: boolean; passive?: boolean };
  public step = 0;
  public pixel = 100;
  public delay = 1000;
  public calendarWidth = 80;
  public requestForConfirmArrival = false;
  public confirmArrivalData: any;
  public isConfirm: any;

  constructor(
    public formBuilder: FormBuilder,
    public service: TaskService,
    public customer: CustomersService,
    public message: MessageService,
    public storeService: StoreService,
    public usersService: UsersService,
    public mongo: MongoService,
    public eventCategoryService: EventCategoryService,
    public ngZone: NgZone,
    private toastr: ToastrService
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  ngOnInit() {
    var self = this;
    this.height = window.innerHeight - 61;
    this.height += "px";
    this.calendarHeight = window.innerHeight - 224;
    this.calendarHeight += "px";

    this.loading = true;
    this.type = Number(localStorage.getItem("type"));
    this.id = Number(localStorage.getItem("idUser"));
    console.log(this.events);
    this.calendars = [];
    const superadmin = localStorage.getItem("superadmin");

    /*this.customer.getCustomers(localStorage.getItem("superadmin"), val => {
      console.log(val);
      this.customerUsers = val.sort((a, b) =>
        String(a["shortname"]).localeCompare(String(b["shortname"]))
      );
      this.loading = false;
    });*/

    this.message.getTheme().subscribe((mess) => {
      console.log(mess);
      setTimeout(() => {
        this.changeTheme(mess);
      }, 50);
    });

    setTimeout(() => {
      this.changeTheme(localStorage.getItem("theme"));
    }, 50);

    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
      this.languageUser = JSON.parse(localStorage.getItem("language"));
      // this.stateValue = JSON.parse(localStorage.getItem("language"))["state"];
    } else {
      this.message.getLanguage().subscribe((mess) => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
          console.log(this.language);
        }, 10);
      });
    }

    /*this.service.getTaskColor().subscribe(data => {
      console.log(data);
      const resourcesObject = {
        name: "Rooms",
        data: data,
        field: "colorTask",
        valueField: "id",
        textField: "text",
        colorField: "color"
      };
      this.resources.push(resourcesObject);
      this.colorPalette = data;
      for (let i = 0; i < data["length"]; i++) {
        this.palette.push(data[i].color);
      }
    });*/

    this.eventCategoryService
      .getEventCategory(localStorage.getItem("superadmin"))
      .subscribe((data: []) => {
        this.eventCategory = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
        const resourcesObject = {
          name: "tasks",
          data: data,
          field: "colorTask",
          valueField: "id",
          textField: "text",
          colorField: "color",
        };
        if (this.eventCategory.length > 0) {
          this.selected = this.eventCategory[0].id;
        }
        this.resources.push(resourcesObject);
        this.colorPalette = data;
        for (let i = 0; i < data["length"]; i++) {
          this.palette.push(data[i]["color"]);
        }
        console.log(this.resources);
      });

    if (this.type === 3) {
      this.selectedStoreId = Number(localStorage.getItem("storeId-" + this.id));
    }
    this.storeService.getStore(localStorage.getItem("superadmin"), (val) => {
      this.store = val;
      if (this.store.length !== 0) {
        this.language.selectStore += this.store[0].storename + ")";
      }
      if (!isNaN(this.selectedStoreId) && this.selectedStoreId !== undefined) {
        const informationAboutStore = this.getStartEndTimeForStore(
          this.store,
          this.selectedStoreId
        );
        this.startWork = informationAboutStore.start_work;
        this.endWork = informationAboutStore.end_work;
        this.timeDuration = informationAboutStore.time_duration;
        if (
          Number(this.timeDuration) > Number(informationAboutStore.time_therapy)
        ) {
          this.therapyDuration =
            Number(this.timeDuration) /
            Number(informationAboutStore.time_therapy);
        } else {
          this.therapyDuration =
            Number(informationAboutStore.time_therapy) /
            Number(this.timeDuration);
        }
      }
    });

    if (
      localStorage.getItem("selectedStore-" + this.id) !== null &&
      localStorage.getItem("selectedUser-" + this.id) !== null &&
      JSON.parse(localStorage.getItem("selectedUser-" + this.id)).length !==
        0 &&
      this.type !== 3
    ) {
      this.calendars = [];
      this.selectedStoreId = Number(
        localStorage.getItem("selectedStore-" + this.id)
      );
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      // this.selectedStore(this.selectedStoreId);
      if (this.value !== null) {
        this.getTaskForSelectedUsers(this.value);
      } else {
        this.calendars.push({ name: null, events: [] });
      }
      this.getUserInCompany(this.selectedStoreId);
    } else if (
      localStorage.getItem("selectedStore-" + this.id) &&
      this.type !== 3
    ) {
      this.calendars = [];
      this.selectedStoreId = Number(
        localStorage.getItem("selectedStore-" + this.id)
      );
      this.selectedStore(this.selectedStoreId);
    } else if (localStorage.getItem("type") === "3") {
      this.service
        .getWorkandTasksForUser(localStorage.getItem("idUser"))
        .subscribe((data) => {
          console.log(data);
          this.events = [];
          this.workTime = this.pickWorkTimeToTask(data["workTime"]);
          this.pickModelForEvent(data["events"]);
          const objectCalendar = {
            name: null,
            events: this.events,
            workTime: this.workTime,
          };
          this.calendars.push(objectCalendar);
          console.log(this.splitterSize);
          this.loading = false;
          console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          this.setWidthForCalendarHeader();
          this.setSplitterBarEvent();
        });
      /*this.service
          .getTasksForUser(localStorage.getItem('idUser'))
          .subscribe(data => {
            this.events = [];
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            this.workTime = [];
            this.service.getWorkTimeForUser(localStorage.getItem('idUser')).subscribe(
              data => {
                console.log(data);
                this.workTime.push(this.pickWorkTimeToTask(data));
                console.log(this.workTime);
                const objectCalendar = {
                  name: null,
                  events: this.events,
                  workTime: this.workTime
                };
                console.log(objectCalendar);
                this.calendars.push(objectCalendar);
                this.height += this.height;
                console.log(this.calendars);
                this.loading = false;
              });
          });*/
      this.size = [];
      this.size.push("100%");
    } else {
      this.service
        .getTasks(localStorage.getItem("superadmin"))
        .subscribe((data) => {
          console.log(data);
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            console.log(this.events);
            const objectCalendar = {
              name: null,
              events: this.events,
            };
            this.calendars.push(objectCalendar);
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          } else {
            this.calendars.push({ name: null, events: [] });
          }
          console.log(this.calendars);
          this.size = [];
          this.size.push("100%");
        });
    }

    if (localStorage.getItem("calendarView") !== null) {
      this.selectedViewIndex = Number(localStorage.getItem("calendarView"));
      this.selectedButtonIndex[this.selectedViewIndex] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[this.selectedViewIndex] =
          "activeButton" + this.theme;
      }, 50);
    } else {
      this.selectedButtonIndex[0] = true;
      setTimeout(() => {
        this.selectedButtonIndexStyle[0] = "activeButton" + this.theme;
      }, 50);
    }

    this.getParameters(superadmin);
  }

  clearAllSelectedData() {
    this.customerUser = new CustomerModel();
    this.selectedComplaint = null;
    this.selectedTherapies = null;
    this.selectedTreatments = null;
    this.telephoneValue = "";
    this.mobileValue = "";
    this.isConfirm = false;
    this.complaintData = new ComplaintTherapyModel();
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    this.baseDataIndicator = false;
    if (this.eventCategory.length > 0) {
      this.selected = this.eventCategory[0].id;
    }
    if (
      (isNaN(this.selectedStoreId) ||
        this.selectedStoreId === null ||
        this.selectedStoreId === undefined) &&
      this.type !== 3
    ) {
      /*Swal.fire({
        title: this.language.selectStoreIndicatorTitle,
        text: this.language.selectStoreIndicatorText,
        timer: 3000,
        type: "error"
      });*/
      this.toastr.success(
        this.language.selectStoreIndicatorTitle,
        this.language.selectStoreIndicatorText,
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
      this.createFormLoading = false;
      return this.createFormGroup.bind(this);
    } else {
      this.createFormLoading = false;
      const dataItem = args.dataItem;
      // this.clearAllSelectedData();
      /*this.customerUser = new CustomerModel();
      this.customerUser.attention = '';
      this.customerUser.physicalComplaint = '';*/
      /*this.customerUser.attention = '';
      this.customerUser.physicalComplaint = '';*/
      if (
        typeof dataItem.customer_id === "number" &&
        dataItem.customer_id !== null
      ) {
        this.customerUsers = [];
        this.customer
          .getCustomerWithId(dataItem.customer_id)
          .subscribe((data) => {
            console.log(data);
            this.customerUser = data[0];
            this.customerUsers.push(data[0]);
            this.telephoneValue = data[0].telephone;
            this.mobileValue = data[0].mobile;
            this.baseDataIndicator = true;
            this.userWidth = "65%";
          });
      }

      let timeDurationInd = 0;
      let timeDuration = 0;
      if (!isNaN(this.selectedStoreId)) {
        if (dataItem.id === undefined || dataItem.id === null) {
          const informationAboutStore = this.getStartEndTimeForStore(
            this.store,
            this.selectedStoreId
          );
          timeDurationInd =
            Number(informationAboutStore.time_therapy) !==
            Number(this.timeDuration)
              ? 1
              : 0;
          timeDuration = Number(informationAboutStore.time_therapy);
        } else {
          const informationAboutStore = this.getStartEndTimeForStore(
            this.store,
            this.selectedStoreId
          );
          if (
            dataItem.end.getTime() - dataItem.start.getTime() !==
            Number(informationAboutStore.time_therapy) * 60000
          ) {
            timeDuration =
              (dataItem.end.getTime() - dataItem.start.getTime()) / 60000;
          } else {
            timeDurationInd =
              Number(informationAboutStore.time_therapy) !==
              Number(this.timeDuration)
                ? 1
                : 0;
            timeDuration = Number(informationAboutStore.time_therapy);
          }
        }
      }

      if (
        this.customerUser !== undefined &&
        this.customerUser !== null &&
        this.customerUser.id !== undefined
      ) {
        this.baseDataIndicator = true;
        this.userWidth = "65%";
      }

      this.formGroup = this.formBuilder.group({
        id: args.isNew ? this.getNextId() : dataItem.id,
        start: [dataItem.start, Validators.required],
        end: [
          timeDurationInd
            ? new Date(dataItem.start.getTime() + timeDuration * 60000)
            : dataItem.end,
          Validators.required,
        ],
        startTimezone: [dataItem.startTimezone],
        endTimezone: [dataItem.endTimezone],
        isAllDay: dataItem.isAllDay,
        colorTask: dataItem.colorTitle,
        creator_id: Number(localStorage.getItem("idUser")),
        user: this.customerUser,
        therapy_id: dataItem.therapy_id,
        telephone: dataItem.telephone,
        mobile: dataItem.mobile,
        superadmin: dataItem.superadmin,
        confirm: dataItem.confirm,
        description: dataItem.description,
        recurrenceRule: dataItem.recurrenceRule,
        recurrenceId: dataItem.recurrenceId,
      });

      setTimeout(() => {
        if (dataItem.therapy_id !== undefined) {
          this.customer.getTherapy(dataItem.therapy_id).subscribe((data) => {
            console.log(data);
            if (data["length"] !== 0) {
              this.splitToValue(
                data[0].complaint,
                data[0].therapies,
                data[0].therapies_previous
              );
              /*this.usersService.getUserWithId(data[0].em, val => {
                this.selectedUser = val[0];
              });*/
              this.complaintData = data[0];
              this.complaintData.cs = Number(data[0].cs);
              this.complaintData.state = Number(data[0].state);
            }
            this.createFormLoading = true;
          });
        } else {
          this.createFormLoading = true;
        }

        console.log(dataItem.colorTask);
        if (dataItem.colorTask !== undefined) {
          this.selected = dataItem.colorTask;
          console.log(this.selected);
        }

        if (dataItem.telephone !== undefined) {
          this.telephoneValue = dataItem.telephone;
        }
        if (dataItem.mobile !== undefined) {
          this.mobileValue = dataItem.mobile;
        }

        if (dataItem.confirm !== undefined) {
          if (dataItem.confirm === -1) {
            this.isConfirm = 0;
          } else {
            this.isConfirm = 1;
          }
        }

        this.changeTheme(localStorage.getItem("theme"));
      }, 100);
      return this.formGroup;
    }
  }

  public isEditingSeries(editMode: EditMode): boolean {
    return editMode === EditMode.Series;
  }

  public getNextId(): number {
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  public saveHandler(
    { sender, formGroup, isNew, dataItem, mode },
    selectedUser
  ): void {
    console.log(formGroup);
    console.log(sender);
    console.log(dataItem);
    console.log(selectedUser);
    if (formGroup.valid) {
      let formValue = formGroup.value;
      formValue.colorTask = this.selected;
      formValue.telephone = this.telephoneValue;
      formValue.user = this.customerUser;
      formValue.mobile = this.mobileValue;
      formValue.title =
        this.customerUser["lastname"] +
        " " +
        this.customerUser["firstname"] +
        "+" +
        this.complaintData.complaint_title;
      formValue.superadmin = localStorage.getItem("superadmin");
      if (this.type !== 3 && selectedUser !== undefined) {
        formValue.creator_id = selectedUser;
      } else {
        formValue.creator_id = localStorage.getItem("idUser");
      }

      if (isNew) {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["lastname"] +
          " " +
          this.customerUser["firstname"] +
          "+" +
          this.complaintData.complaint_title;
        this.complaintData.date = this.formatDate(
          formValue.start,
          formValue.end
        );
        if (this.isConfirm) {
          formValue.confirm = 0;
        } else {
          formValue.confirm = -1;
        }
        this.customer.addTherapy(this.complaintData).subscribe((data) => {
          if (data["success"]) {
            formValue.therapy_id = data["id"];
            if (this.type === 0) {
              formValue["storeId"] = this.selectedStoreId;
            }
            this.service.createTask(formValue, (val) => {
              console.log(val);
              if (val.success) {
                this.service.create(formValue);
                /*Swal.fire({
                  title: this.language.successUpdateTitle,
                  text: this.language.successUpdateText,
                  timer: 3000,
                  type: "success"
                });*/
                this.toastr.success(
                  this.language.successUpdateTitle,
                  this.language.successUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              } else {
                /*Swal.fire({
                  title: this.language.unsuccessUpdateTitle,
                  text: this.language.unsuccessUpdateText,
                  timer: 3000,
                  type: "error"
                });*/
                this.toastr.error(
                  this.language.unsuccessUpdateTitle,
                  this.language.unsuccessUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              }
            });

            console.log(this.data);
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"],
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe((data) => {
                console.log(data);
              });
          } else {
            Swal.fire({
              title: this.language.unsuccessUpdateTitle,
              text: this.language.unsuccessUpdateText,
              timer: 3000,
              type: "error",
            });
          }
          /*this.selectedComplaint = [];
          this.selectedTherapies = [];
          this.selectedTreatments = [];*/
        });
      } else {
        formValue = this.colorMapToId(formValue);
        this.addTherapy(this.customerUser["id"]);
        formValue.title =
          this.customerUser["lastname"] +
          " " +
          this.customerUser["firstname"] +
          "+" +
          this.complaintData.complaint_title;
        this.complaintData.date = this.formatDate(
          formValue.start,
          formValue.end
        );
        if (this.isConfirm) {
          formValue.confirm = 0;
        } else {
          formValue.confirm = -1;
        }
        this.customer.updateTherapy(this.complaintData).subscribe((data) => {
          if (data) {
            this.service.updateTask(formValue, (val) => {
              console.log(val);
              if (val.success) {
                this.handleUpdate(dataItem, formValue, mode);
                /*Swal.fire({
                  title: this.language.successUpdateTitle,
                  text: this.language.successUpdateText,
                  timer: 3000,
                  type: "success"
                });*/
                this.toastr.success(
                  this.language.successUpdateTitle,
                  this.language.successUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              } else {
                /*Swal.fire({
                  title: this.language.unsuccessUpdateTitle,
                  text: this.language.unsuccessUpdateText,
                  timer: 3000,
                  type: "error"
                });*/
                this.toastr.error(
                  this.language.unsuccessUpdateTitle,
                  this.language.unsuccessUpdateText,
                  { timeOut: 7000, positionClass: "toast-bottom-right" }
                );
              }
            });
            const customerAttentionAndPhysical = {
              id: this.customerUser["id"],
              attention: this.customerUser["attention"],
              physicalComplaint: this.customerUser["physicalComplaint"],
            };
            console.log(customerAttentionAndPhysical);
            this.customer
              .updateAttentionAndPhysical(customerAttentionAndPhysical)
              .subscribe((data) => {
                console.log(data);
              });
          } else {
            /*Swal.fire({
              title: this.language.unsuccessUpdateTitle,
              text: this.language.unsuccessUpdateText,
              timer: 3000,
              type: "error"
            });*/
            this.toastr.success(
              this.language.unsuccessUpdateTitle,
              this.language.unsuccessUpdateText,
              { timeOut: 7000, positionClass: "toast-bottom-right" }
            );
          }
          /*this.selectedComplaint = [];
          this.selectedTherapies = [];
          this.selectedTreatments = [];*/
        });
      }

      this.closeEditor(sender);
    } else {
      Swal.fire({
        title: this.language.unsuccessUpdateTitle,
        text: this.language.unsuccessUpdateText,
        timer: 3000,
        type: "error",
      });
      this.toastr.success(
        this.language.unsuccessUpdateTitle,
        this.language.unsuccessUpdateText,
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
    }
  }

  formatDate(start, end) {
    const dd = String(start.getDate()).padStart(2, "0");
    const mm = String(start.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = start.getFullYear();
    const hhStart = start.getHours();
    const minStart = start.getMinutes();
    const hhEnd = end.getHours();
    const minEnd = end.getMinutes();
    return (
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hhStart === 0 ? "00" : hhStart) +
      ":" +
      (minStart < 10 ? "0" + minStart : minStart) +
      "-" +
      (hhEnd === 0 ? "00" : hhEnd) +
      ":" +
      (minEnd < 10 ? "0" + minEnd : minEnd)
    );
  }

  addTherapy(customerId) {
    this.complaintData.customer_id = customerId;
    this.complaintData.date =
      new Date().getDay() +
      "." +
      new Date().getMonth() +
      "." +
      new Date().getFullYear() +
      ".";
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
      this.selectedTreatments,
      this.therapyValue
    ).value;
    this.complaintData.therapies_previous_title = this.pickToModel(
      this.selectedTreatments,
      this.therapyValue
    ).title;
  }

  public handleUpdate(item: any, value: any, mode?: EditMode): void {
    const service = this.service;
    console.log("update!");
    if (mode === EditMode.Occurrence) {
      if (service.isException(item)) {
        service.update(item, value);
      } else {
        service.createException(item, value);
      }
    } else {
      // The item is non-recurring or we are editing the entire series.
      service.update(item, value);
    }
  }

  public closeEditor(scheduler: SchedulerComponent): void {
    console.log("close!");
    scheduler.closeEvent();

    this.formGroup = undefined;
  }

  onValueChange(event) {
    console.log(event);
    if (event !== undefined) {
      this.customerUser = event;
      this.telephoneValue = event.telephone;
      this.mobileValue = event.mobile;
      this.isConfirm = event.isConfirm;
      this.getComplaintAndTherapyForCustomer(event.id);
      this.baseDataIndicator = true;
      this.userWidth = "65%";
    } else {
      this.customerUser = {
        attention: "",
        physicalComplaint: "",
      };
      this.telephoneValue = null;
      this.mobileValue = null;
      this.isConfirm = false;
      this.baseDataIndicator = false;
      this.selectedComplaint = null;
      this.selectedTherapies = null;
      this.selectedTreatments = null;
      this.complaintData = new ComplaintTherapyModel();
      this.userWidth = "22%";
    }
  }

  getComplaintAndTherapyForCustomer(id) {
    console.log(id);
    this.customer.getTherapyForCustomer(id).subscribe((data) => {
      console.log(data);
      if (data["length"] !== 0) {
        const i = data["length"] - 1;
        this.selectedComplaint = this.stringToArray(data[i]["complaint"]);
        this.selectedTherapies = this.stringToArray(data[i]["therapies"]);
      }
    });
  }

  newCustomer() {
    // this.zIndex = 'zIndex';
    this.customerModal.open();
    this.data = new UserModel();
    this.data.gender = "male";
    this.data.superadmin = localStorage.getItem("superadmin");
    setTimeout(() => {
      this.changeTheme(this.theme);
    }, 50);
  }

  closeNewCustomer() {
    this.zIndex = "";
    this.customerModal.close();
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem("superadmin");
    this.customer.createCustomer(this.data, (val) => {
      console.log(val);
      if (val) {
        this.data.id = val.id;
        this.customerUser = this.data as CustomerModel;
        this.formGroup.patchValue({ telephone: this.data.telephone });
        this.formGroup.patchValue({ mobile: this.data.mobile });
        this.baseDataIndicator = true;
        this.reloadNewCustomer();
        this.customerModal.close();
      }
    });
  }

  changeTheme(theme: string) {
    console.log(theme);
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

      items = document.querySelectorAll(".k-button-icontext");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          clas.remove("k-button-icontext-" + themeName);
          clas.add("k-button-icontext-" + theme);
        }
      }

      items = document.querySelectorAll(".k-primary");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          clas.remove("k-primary-" + themeName);
          clas.add("k-primary-" + theme);
        }
      }

      items = document.querySelectorAll(".k-state-selected");
      for (let i = 0; i < items.length; i++) {
        const clas = items[i].classList;
        for (let j = 0; j < allThemes.length; j++) {
          const themeName = allThemes[j]["name"];
          console.log(themeName);
          clas.remove("k-state-selected-" + themeName);
          clas.add("k-state-selected-" + theme);
        }
      }
      this.theme = theme;
    }
  }

  setWidthForCalendarHeader() {
    setTimeout(() => {
      let items = document.querySelectorAll(".k-scheduler-toolbar");
      let calendars = document.querySelectorAll(".k-scheduler");
      console.log(
        document.getElementsByClassName("k-scheduler-header-all-day")
      );
      console.log(
        document.getElementsByClassName("k-scheduler-header-wrap")[0]
          .childNodes[0]
      );
      for (let i = 0; i < items.length; i++) {
        console.log((calendars[i] as HTMLElement).offsetWidth);
        (items[i] as HTMLElement).style.width =
          (calendars[i] as HTMLElement).offsetWidth + "px";
      }
    }, 50);
  }

  setSplitterBarEvent() {
    setTimeout(() => {
      let splitterBar = document.querySelectorAll(".k-splitbar");
      for (let i = 0; i < splitterBar.length; i++) {
        splitterBar[i].addEventListener(
          "click",
          this.splitteBarEvent.bind(this)
        );
      }
    }, 50);
  }

  splitteBarEvent(event) {
    this.setWidthForCalendarHeader();
  }

  valueChange(event) {
    console.log(event);
  }

  colorMapToId(task) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].color === task.colorTask) {
        task.colorTask = Number(this.colorPalette[i].id);
      }
    }
    return task;
  }

  IdMapToColor(id) {
    for (let i = 0; i < this.colorPalette.length; i++) {
      if (this.colorPalette[i].id === id) {
        return this.colorPalette[i].color;
      }
    }
    return null;
  }

  baseDataForUser() {
    // this.zIndex = 'zIndex';
    // this.customerUserModal.open();
    this.customerUserModal2.open();
  }

  closebaseDataForUser() {
    // this.zIndex = '';
    // this.customerUserModal.close();
    this.customerUserModal2.close();
  }

  public handleValue(selected) {
    console.log(selected);
    this.value = selected;

    /*if (selected.length <= 3) {
      this.value = selected;
    } else {
      this.value = this.value.map(item => item);
    }*/
    localStorage.setItem("selectedUser-" + this.id, JSON.stringify(this.value));
    localStorage.setItem(
      "usersFor-" + this.selectedStoreId + "-" + this.id,
      JSON.stringify(this.value)
    );
    this.getTaskForSelectedUsers(this.value);

    const item = {
      user_id: Number(localStorage.getItem("idUser")),
      key: "usersFor-" + this.selectedStoreId + "-" + this.id,
      value: this.value,
    };

    this.mongo.setUsersFor(item).subscribe((data) => {
      console.log(data);
    });
  }

  getTaskForSelectedUsers(value) {
    this.loading = true;
    console.log(value);
    this.calendars = [];
    if (value.length === 0) {
      this.service
        .getTasksForStore(this.selectedStoreId, this.id, this.type)
        .subscribe((data) => {
          this.events = [];
          this.calendars = [];
          this.events = [];
          for (let i = 0; i < data.length; i++) {
            data[i].start = new Date(data[i].start);
            data[i].end = new Date(data[i].end);
            this.events.push(data[i]);
          }
          const objectCalendar = {
            name: null,
            events: this.events,
          };
          this.calendars.push(objectCalendar);
          this.size = [];
          this.size.push("100%");
          this.loading = false;
          console.log(document.getElementsByClassName("k-scheduler-toolbar"));
          this.setWidthForCalendarHeader();
          this.setSplitterBarEvent();
        });
    } else {
      this.calendars = [];
      let index = 0;

      this.loopIndex = 0;
      this.valueLoop = value;
      this.myLoop();
      /*for (let i = 0; i < value.length; i++) {
        this.service.getWorkandTasksForUser(value[i].id).subscribe(
          data => {
            console.log(data, value[i]);
            this.events = [];
            this.workTime = this.pickWorkTimeToTask(data['workTime']);
            const objectCalendar = {
              userId: value[index].id,
              name: value[index].shortname,
              events: this.pickModelForEvent(data['events']),
              workTime: this.workTime
            };
            this.calendars.push(objectCalendar);
            this.height += this.height;
            index++;
            this.splitterSize = this.splitterSizeFull / value.length;
            console.log(this.splitterSize);
            console.log(this.calendars);
            if (value.length === index) {
              this.loading = false;
            }
          });
      }*/
    }
  }

  myLoop() {
    setTimeout(() => {
      this.service
        .getWorkandTasksForUser(this.valueLoop[this.loopIndex].id)
        .subscribe((data) => {
          console.log(data, this.valueLoop[this.loopIndex]);
          this.events = [];
          this.workTime = this.pickWorkTimeToTask(data["workTime"]);
          const objectCalendar = {
            userId: this.valueLoop[this.loopIndex].id,
            name: this.valueLoop[this.loopIndex].shortname,
            events: this.pickModelForEvent(data["events"]),
            workTime: this.workTime,
          };
          this.calendars.push(objectCalendar);
          this.loopIndex++;
          this.splitterSize = this.splitterSizeFull / this.valueLoop.length;
          console.log(this.splitterSize);
          console.log(this.calendars);
          this.size = [];
          if (this.valueLoop.length === this.loopIndex) {
            const sizePannel = 100 / this.loopIndex + "%";
            for (let i = 0; i < this.valueLoop.length - 1; i++) {
              console.log("usao sam ovde!");
              this.size.push(sizePannel);
            }
            this.size.push("");
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            this.setWidthForCalendarHeader();
            this.setSplitterBarEvent();
          }
          if (this.loopIndex < this.valueLoop.length) {
            this.myLoop();
          }
        });
    }, 100);
  }

  pickModelForEvent(data) {
    this.events = [];
    for (let i = 0; i < data.length; i++) {
      data[i].start = new Date(data[i].start);
      data[i].end = new Date(data[i].end);
      this.events.push(data[i]);
    }
    return this.events;
  }

  selectedStore(event) {
    console.log(event);
    this.value = [];
    // localStorage.removeItem('selectedUser');
    this.loading = true;
    this.calendars = [];
    this.selectedStoreId = event;
    if (
      localStorage.getItem(
        "usersFor-" + this.selectedStoreId + "-" + this.id
      ) !== null &&
      JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      ).length !== 0 &&
      event !== undefined
    ) {
      this.value = JSON.parse(
        localStorage.getItem("usersFor-" + this.selectedStoreId + "-" + this.id)
      );
      this.getTaskForSelectedUsers(this.value);
      this.getUserInCompany(event);
      this.setStoreWork(event);
      localStorage.setItem("selectedStore-" + this.id, event);
    } else {
      this.value = [];
      if (event !== undefined) {
        this.service
          .getTasksForStore(event, this.id, this.type)
          .subscribe((data) => {
            this.events = [];
            this.calendars = [];
            for (let i = 0; i < data.length; i++) {
              data[i].start = new Date(data[i].start);
              data[i].end = new Date(data[i].end);
              this.events.push(data[i]);
            }
            const objectCalendar = {
              name: null,
              events: this.events,
              workTime: undefined,
            };
            if (!isNaN(event)) {
              this.setStoreWork(event);
            } else {
              this.startWork = "08:00";
              this.endWork = "22:00";
              this.timeDuration = "60";
              this.therapyDuration = 1;
            }
            this.calendars.push(objectCalendar);
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            this.setWidthForCalendarHeader();
            this.setSplitterBarEvent();
          });
        this.getUserInCompany(event);
      } else {
        this.service
          .getTasks(localStorage.getItem("superadmin"))
          .subscribe((data) => {
            console.log(data);
            this.events = [];
            if (data.length !== 0) {
              for (let i = 0; i < data.length; i++) {
                data[i].start = new Date(data[i].start);
                data[i].end = new Date(data[i].end);
                this.events.push(data[i]);
              }
              console.log(this.events);
              const objectCalendar = {
                name: null,
                events: this.events,
                workTime: undefined,
              };
              this.calendars.push(objectCalendar);
            } else {
              this.calendars.push({ name: null, events: [] });
            }
            localStorage.removeItem("selectedStore-" + this.id);
            this.usersInCompany = [];
            this.startWork = "08:00";
            this.endWork = "22:00";
            this.timeDuration = "60";
            this.therapyDuration = 1;
            this.loading = false;
            console.log(document.getElementsByClassName("k-scheduler-toolbar"));
            this.setWidthForCalendarHeader();
            this.setSplitterBarEvent();
            this.size = [];
            this.size.push("100%");
          });
      }
    }

    const item = {
      user_id: Number(localStorage.getItem("idUser")),
      selectedStore: event,
    };

    this.mongo.setSelectedStore(item).subscribe((data) => {
      console.log(data);
    });
  }

  setStoreWork(event) {
    if (this.store !== undefined) {
      const informationAboutStore = this.getStartEndTimeForStore(
        this.store,
        this.selectedStoreId
      );
      this.startWork = informationAboutStore.start_work;
      this.endWork = informationAboutStore.end_work;
      this.timeDuration = informationAboutStore.time_duration;
      if (
        Number(this.timeDuration) > Number(informationAboutStore.time_therapy)
      ) {
        this.therapyDuration =
          Number(this.timeDuration) /
          Number(informationAboutStore.time_therapy);
      } else {
        this.therapyDuration =
          Number(informationAboutStore.time_therapy) /
          Number(this.timeDuration);
      }

      localStorage.setItem("selectedStore-" + this.id, event);
    }
  }

  getStartEndTimeForStore(data, id) {
    if (data !== null && data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          // tslint:disable-next-line: max-line-length
          return {
            start_work:
              new Date(data[i].start_work).getHours() +
              ":" +
              new Date(data[i].start_work).getMinutes(),
            end_work:
              new Date(data[i].end_work).getHours() +
              ":" +
              new Date(data[i].end_work).getMinutes(),
            time_duration: data[i].time_duration,
            time_therapy: data[i].time_therapy,
          };
        }
      }
    }
    return null;
  }

  getUserInCompany(storeId) {
    this.usersService.getUsersInCompany(storeId, (val) => {
      this.usersInCompany = val;
      // this.language.selectedUsers += this.usersInCompany[0].shortname;
      this.loading = false;
      console.log(document.getElementsByClassName("k-scheduler-toolbar"));
    });
  }

  dragEndHandler(event) {
    console.log(event);
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, (val) => {
        console.log(val);
      });
    }, 50);
  }

  resizeEndHandler(event) {
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, (val) => {
        console.log(val);
      });
    }, 50);
  }

  removeHandler({ sender, dataItem }: RemoveEvent): void {
    this.service.deleteTask(dataItem.id).subscribe((data) => {
      if (data) {
        this.customer
          .deleteTherapy(dataItem.therapy_id)
          .subscribe((data_therapy) => {
            console.log(data_therapy);
          });
      }
    });
  }

  cancelHandler(event) {
    console.log(event);
  }

  dateFormat(date, i, j) {
    if (
      // tslint:disable-next-line: max-line-length
      new Date(this.calendars[i].workTime[j].change) <= new Date(date) &&
      (j + 1 <= this.calendars[i].workTime.length - 1
        ? new Date(date) < new Date(this.calendars[i].workTime[j + 1].change)
        : true) &&
      new Date(date).getDay() - 1 < 5 &&
      new Date(date).getDay() !== 0
    ) {
      if (
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1].end >
            new Date(date).getHours()) ||
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start2 <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
            .end2 > new Date(date).getHours()) ||
        (this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
          .start3 <= new Date(date).getHours() &&
          this.calendars[i].workTime[j].times[new Date(date).getDay() - 1]
            .end3 > new Date(date).getHours())
      ) {
        return "workTime";
      } else {
        return "none";
      }
    } else {
      return "noTime";
    }
  }

  convertNumericToDay(numeric) {
    let day = null;
    if (numeric === 1) {
      day = "monday";
    } else if (numeric === 2) {
      day = "tuesday";
    } else if (numeric === 3) {
      day = "wednesday";
    } else if (numeric === 4) {
      day = "thursday";
    } else if (numeric === 5) {
      day = "friday";
    }
    return day;
  }

  pickWorkTimeToTask(workTime) {
    let workTimeArray = [];
    const allWorkTime = [];
    let workTimeObject = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < workTime.length; i++) {
      workTimeArray = [];
      for (let j = 1; j < 6; j++) {
        workTimeObject = {
          day: Number(workTime[i][this.convertNumericToDay(j)].split("-")[0]),
          start: workTime[i][this.convertNumericToDay(j)].split("-")[1],
          end: workTime[i][this.convertNumericToDay(j)].split("-")[2],
          start2: workTime[i][this.convertNumericToDay(j)].split("-")[3],
          end2: workTime[i][this.convertNumericToDay(j)].split("-")[4],
          start3: workTime[i][this.convertNumericToDay(j)].split("-")[5],
          end3: workTime[i][this.convertNumericToDay(j)].split("-")[6],
        };
        workTimeArray.push(workTimeObject);
      }
      allWorkTime.push({
        change: workTime[i].dateChange,
        color: workTime[i].color,
        times: workTimeArray,
      });
    }
    console.log(allWorkTime);
    return allWorkTime;
  }

  dateEventChange(event: string) {
    /*this.loading = true;
    setTimeout(() => {
      for (let i = 0; i < this.calendars.length; i++) {
        this.calendars[i]['dateChange'] = event;
      }
      this.loading = false;
    }, 50);
    console.log(this.calendars);*/
    this.message.sendViewChange(event);
  }

  changeHandler(event) {
    console.log(event);
  }

  selectedViewCalendar(index) {
    // this.selectedViewIndex = null;
    // setTimeout(() => {
    this.selectedButtonIndex[this.selectedViewIndex] = false;
    this.selectedButtonIndexStyle[this.selectedViewIndex] = "";
    this.selectedViewIndex = index;
    this.selectedButtonIndex[this.selectedViewIndex] = true;
    this.selectedButtonIndexStyle[this.selectedViewIndex] =
      "activeButton" + this.theme;
    localStorage.setItem("calendarView", index);
    //}, 50);
  }

  chageDate(event) {
    console.log(event);
    this.message.sendDateChange(event);
  }

  getParameters(superadmin) {
    this.customer
      .getParameters("Complaint", superadmin)
      .subscribe((data: []) => {
        console.log(data);
        this.complaintValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.customer.getParameters("Therapy", superadmin).subscribe((data: []) => {
      console.log(data);
      this.therapyValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.customer
      .getParameters("Treatment", superadmin)
      .subscribe((data: []) => {
        console.log(data);
        this.treatmentValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.customer.getParameters("CS", superadmin).subscribe((data: []) => {
      console.log(data);
      this.CSValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.customer.getParameters("State", superadmin).subscribe((data: []) => {
      console.log(data);
      this.stateValue = data.sort(function (a, b) {
        return a["sequence"] - b["sequence"];
      });
    });

    this.usersService.getCompanyUsers(localStorage.getItem("idUser"), (val) => {
      console.log(val);
      if (val.length !== 0) {
        this.allUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
      }
      console.log(this.allUsers);
    });
  }

  pickToModel(data: any, titleValue) {
    let value = "";
    if (data === undefined || data === null) {
      data = [];
    }
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

  stringToArray(data) {
    let array = [];
    const dataArray = data.split(";");
    if (dataArray.length > 0) {
      for (let i = 0; i < dataArray.length; i++) {
        array.push(Number(dataArray[i]));
      }
    } else {
      array.push(Number(data));
    }
    return array;
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

  splitToValue(complaint, therapies, therapies_previous) {
    if (complaint.split(";") !== undefined) {
      this.selectedComplaint = complaint.split(";").map(Number);
    } else {
      this.selectedComplaint = Number(complaint);
    }

    if (therapies.split(";") !== undefined) {
      this.selectedTherapies = therapies.split(";").map(Number);
    } else {
      this.selectedTherapies = Number(therapies);
    }

    if (therapies_previous.split(";") !== undefined) {
      this.selectedTreatments = therapies_previous.split(";").map(Number);
    } else {
      this.selectedTreatments = Number(therapies_previous);
    }
  }

  reloadNewCustomer() {
    this.customerUsers = null;
    setTimeout(() => {
      this.customer.getCustomers(localStorage.getItem("superadmin"), (val) => {
        console.log(val);
        this.customerUsers = val.sort((a, b) =>
          a["shortname"].localeCompare(b["shortname"])
        );
        this.loading = false;
        console.log(document.getElementsByClassName("k-scheduler-toolbar"));
      });
    }, 150);
  }

  onValueUserEmChange(event) {
    this.complaintData.em = event.id;
    this.complaintData.em_title = event.lastname + " " + event.firstname;
  }

  searchCustomer(event) {
    console.log(event);
    if (event !== "" && event.length > 2) {
      this.customerLoading = true;
      const searchFilter = {
        superadmin: localStorage.getItem("superadmin"),
        filter: event,
      };
      this.customer.searchCustomer(searchFilter).subscribe((val: []) => {
        console.log(val);
        this.customerUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerLoading = false;
      });
    } else {
      this.customerUsers = [];
    }
  }

  eventClickHendler({ sender, event }: EventClickEvent): void {
    console.log(event);
    this.quickPreviewEvent = event;
    this.quickPreview.open();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    console.log(event);
    this.height = window.innerHeight - 61;
    this.height += "px";
    this.calendarHeight = window.innerHeight - 224;
    this.calendarHeight += "px";
    this.setWidthForCalendarHeader();
  }

  exportToPdf() {
    this.scheduler.saveAsPDF();
  }

  selectedEventCategory(event) {
    this.selected = event;
  }

  public get sidebarSize(): any[] {
    return this.size;
  }
  public set sidebarSize(newSize: any[]) {
    console.log(newSize);
    this.size = newSize;
    console.log("test");
  }

  sendAgainConfirmMail(dataItem) {
    console.log(dataItem);
    this.confirmArrivalData = {
      id: dataItem.id,
      name: dataItem.title.split("+")[0],
      customer_id: dataItem.customer_id,
    };
    this.requestForConfirmArrival = true;
  }

  requestForConfirmArrivalAnswer(answer) {
    console.log(answer);
    if (answer === "yes") {
      this.service
        .sendConfirmArrivalAgain(this.confirmArrivalData)
        .subscribe((data) => {
          console.log(data);
        });

      this.toastr.success(
        this.language.successTitle,
        this.language.successTextConfirmArrival.replace(
          "{{QUOTE}}",
          this.confirmArrivalData.name
        ),
        { timeOut: 7000, positionClass: "toast-bottom-right" }
      );
    }
    this.requestForConfirmArrival = false;
  }

  closeCustomerModal() {
    this.customerModal.close();
    this.reloadNewCustomer();
  }
}
