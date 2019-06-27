import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
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
  SchedulerEvent
} from "@progress/kendo-angular-scheduler";
import "@progress/kendo-date-math/tz/regions/Europe";
import "@progress/kendo-date-math/tz/regions/NorthAmerica";
import { filter } from "rxjs/operators/filter";
import { StoreService } from "../../../service/store.service";
import { TaskService } from "../../../service/task.service";
import { isNumber } from "util";
import Swal from "sweetalert2";

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class TaskComponent implements OnInit {
  @ViewChild("customer") customerModal: Modal;
  @ViewChild("customerUserModal") customerUserModal: Modal;
  public selectedDate: Date = new Date();
  public formGroup: FormGroup;
  public events: SchedulerEvent[] = [];
  public customerUsers: any;
  public telephoneValue = "";
  public type: any;
  public customerComponent: CustomersComponent;
  public usersInCompany: any = [];
  public colorTask: any;
  public zIndex: string;
  public theme: string;
  public selected = "#fe413b";
  public palette: any[] = [];
  public colorPalette: any;
  public selectedColorId: any;
  public language: any;
  public resources: any[] = [];
  public customerUser: any;
  public data = {
    id: "",
    shortname: "",
    firstname: "",
    lastname: "",
    gender: "",
    street: "",
    streetnumber: "",
    city: "",
    telephone: "",
    mobile: "",
    email: "",
    birthday: "",
    storeId: ""
  };
  public value: any = [];
  public store: any;
  public calendars: any = [];
  public loading = true;
  public height = 92;
  public orientation = "vertical";
  public workTime: any[] = [];

  constructor(
    public formBuilder: FormBuilder,
    public service: TaskService,
    public customer: CustomersService,
    public message: MessageService,
    public storeService: StoreService
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);
  }

  ngOnInit() {
    this.loading = true;
    this.type = localStorage.getItem("type");
    console.log(this.events);
    this.calendars = [];
    this.height = 92;
    if (localStorage.getItem("type") === "3") {
      this.service
        .getTasksForUser(localStorage.getItem("idUser"))
        .subscribe(data => {
          this.events = [];
          for (let i = 0; i < data.length; i++) {
            data[i].start = new Date(data[i].start);
            data[i].end = new Date(data[i].end);
            this.events.push(data[i]);
          }
          const objectCalendar = {
            name: null,
            events: this.events
          };
          this.calendars.push(objectCalendar);
          console.log(this.calendars);
          this.loading = false;
        });
    } else {
      this.service.getTasks().subscribe(data => {
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
            events: this.events
          };
          this.calendars.push(objectCalendar);
          this.height += this.height;
          this.loading = false;
        } else {
          this.calendars.push({ name: null, events: [] });
          console.log(this.calendars);
        }
      });
    }

    this.customer.getCustomers(localStorage.getItem("storeId"), val => {
      console.log(val);
      this.customerUsers = val;
      this.loading = false;
    });
    console.log(this.events);

    this.message.getTheme().subscribe(mess => {
      console.log(mess);
      setTimeout(() => {
        this.changeTheme(mess);
      }, 50);
    });

    setTimeout(() => {
      this.changeTheme(localStorage.getItem("theme"));
    }, 50);

    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"))["calendar"];
      console.log(this.language);
    }

    this.message.getLanguage().subscribe(mess => {
      this.language = undefined;
      setTimeout(() => {
        this.language = JSON.parse(localStorage.getItem("language"))[
          "calendar"
        ];
        console.log(this.language);
      }, 10);
    });

    this.service.getTaskColor().subscribe(data => {
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
    });

    this.storeService.getStore(localStorage.getItem("idUser"), val => {
      this.store = val;
    });
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    const dataItem = args.dataItem;
    console.log(dataItem);
    if (
      typeof dataItem.customer_id === "number" &&
      dataItem.customer_id !== null
    ) {
      console.log(dataItem.customer_id);
      this.customer.getCustomerWithId(dataItem.customer_id).subscribe(data => {
        console.log(data);
        this.customerUser = data[0];
      });
    }

    this.formGroup = this.formBuilder.group({
      id: args.isNew ? this.getNextId() : dataItem.id,
      start: [dataItem.start, Validators.required],
      end: [dataItem.end, Validators.required],
      startTimezone: [dataItem.startTimezone],
      endTimezone: [dataItem.endTimezone],
      isAllDay: dataItem.isAllDay,
      title: dataItem.title,
      colorTask: dataItem.colorTitle,
      creator_id: localStorage.getItem("idUser"),
      user: this.customerUser,
      telephone: dataItem.telephone,
      description: dataItem.description,
      recurrenceRule: dataItem.recurrenceRule,
      recurrenceId: dataItem.recurrenceId
    });

    setTimeout(() => {
      if (dataItem.colorTask !== null) {
        this.selected = this.IdMapToColor(dataItem.colorTask);
        console.log(this.selected);
      }

      if (dataItem.telephone !== undefined) {
        this.telephoneValue = dataItem.telephone;
      }

      this.formGroup = this.formBuilder.group({
        user: this.customerUser
      });
      this.changeTheme(localStorage.getItem("theme"));
    }, 50);
    return this.formGroup;
  }

  public isEditingSeries(editMode: EditMode): boolean {
    console.log("update!");
    return editMode === EditMode.Series;
  }

  public getNextId(): number {
    console.log("test");
    const len = this.events.length;

    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  public saveHandler({ sender, formGroup, isNew, dataItem, mode }): void {
    console.log(formGroup);
    console.log(sender);
    console.log(dataItem);
    console.log(mode);
    if (formGroup.valid) {
      let formValue = formGroup.value;

      if (isNew) {
        formValue = this.colorMapToId(formValue);
        this.service.createTask(formValue, val => {
          console.log(val);
          if (val.success) {
            this.service.create(formValue);
            Swal.fire({
              title: this.language.successUpdateTitle,
              text: this.language.successUpdateText,
              timer: 3000,
              type: "success"
            });
          } else {
            Swal.fire({
              title: this.language.unsuccessUpdateTitle,
              text: this.language.unsuccessUpdateText,
              timer: 3000,
              type: "error"
            });
          }
        });
      } else {
        this.handleUpdate(dataItem, formValue, mode);
      }

      this.closeEditor(sender);
    }
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
    } else {
      this.customerUser = undefined;
      this.telephoneValue = null;
    }
  }

  newCustomer() {
    this.zIndex = "zIndex";
    this.customerModal.open();
  }

  closeNewCustomer() {
    this.zIndex = "";
    this.customerModal.close();
  }

  createCustomer(form) {
    console.log(this.data);
    this.data.storeId = localStorage.getItem("storeId");
    this.customer.createCustomer(this.data, val => {
      console.log(val);
      this.customerModal.close();
      // form.reset();
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
    this.zIndex = "zIndex";
    this.customerUserModal.open();
  }

  closebaseDataForUser() {
    this.zIndex = "";
    this.customerUserModal.close();
  }

  public handleValue(selected) {
    console.log(selected);
    if (selected.length <= 3) {
      this.value = selected;
    } else {
      this.value = this.value.map(item => item);
    }

    this.getTaskForSelectedUsers(this.value);
  }

  getTaskForSelectedUsers(value) {
    this.loading = true;
    console.log(value);
    this.calendars = [];
    this.height = 92;
    if (value.length === 0) {
      this.service.getTasks().subscribe(data => {
        this.events = [];
        for (let i = 0; i < data.length; i++) {
          data[i].start = new Date(data[i].start);
          data[i].end = new Date(data[i].end);
          this.events.push(data[i]);
        }
        const objectCalendar = {
          name: null,
          events: this.events
        };
        this.calendars.push(objectCalendar);
        this.loading = false;
      });
    } else {
      this.workTime = [];
      this.calendars = [];
      for (let i = 0; i < value.length; i++) {
        this.service.getTasksForUser(value[i].id).subscribe(data => {
          console.log(data);
          this.events = [];
          for (let i = 0; i < data.length; i++) {
            data[i].start = new Date(data[i].start);
            data[i].end = new Date(data[i].end);
            this.events.push(data[i]);
          }
          this.service.getWorkTimeForUser(value[i].id).subscribe(data => {
            //this.workTime = data[2];
            console.log(data);
            this.workTime.push(this.pickWorkTimeToTask(data));
            console.log(this.workTime);
            const objectCalendar = {
              name: value[i].shortname,
              events: this.events,
              workTime: this.workTime
            };
            console.log(data);
            this.calendars.push(objectCalendar);
            this.height += this.height;
            console.log(this.calendars);
            this.loading = false;
          });
        });
      }
    }
  }

  selectedStore(event) {
    console.log(event);
    this.loading = true;
    if (event !== undefined) {
      this.service.getUsersInCompany(event.id, val => {
        this.usersInCompany = val;
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  dragEndHandler(event) {
    console.log(event);
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, val => {
        console.log(val);
      });
    }, 50);
  }

  resizeEndHandler(event) {
    const formValue = this.colorMapToId(event.dataItem);
    setTimeout(() => {
      this.service.updateTask(formValue, val => {
        console.log(val);
      });
    }, 50);
  }

  removeHandler({ sender, dataItem }: RemoveEvent): void {
    console.log(sender);
    console.log(dataItem);
    this.service.deleteTask(dataItem.id).subscribe(data => {
      console.log(data);
    });
    /*sender.openRemoveConfirmationDialog().subscribe((shouldRemove) => {
        if (shouldRemove) {
          console.log('brisem!');
          console.log(dataItem);
          this.service.remove(dataItem);
        }
    });*/
  }

  cancelHandler(event) {
    console.log(event);
  }

  dateFormat(date, i, j) {
    // console.log(new Date(date).getUTCDay());
    // console.log(new Date(date).getHours());
    if (new Date(date).getDay() - 1 < 5 && new Date(date).getDay() !== 0) {
      console.log(new Date(date).getDay() - 1);
      if (
        this.workTime[i][j].times[new Date(date).getDay() - 1].start <=
          new Date(date).getHours() &&
        this.workTime[i][j].times[new Date(date).getDay() - 1].end >=
          new Date(date).getHours()
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  convertNumericToDay(numeric) {
    let day = null;
    if (numeric === 1) {
      day = this.language.monday.toString().toLowerCase();
    } else if (numeric === 2) {
      day = this.language.tuesday.toLowerCase();
    } else if (numeric === 3) {
      day = this.language.wednesday.toLowerCase();
    } else if (numeric === 4) {
      day = this.language.thursday.toLowerCase();
    } else if (numeric === 5) {
      day = this.language.friday.toLowerCase();
    }
    return day;
  }

  pickWorkTimeToTask(workTime) {
    let workTimeArray = [];
    let allWorkTime = [];
    let workTimeObject = null;
    for (let i = 0; i < workTime.length; i++) {
      workTimeArray = [];
      for (let j = 1; j < 6; j++) {
        workTimeObject = {
          day: Number(workTime[i][this.convertNumericToDay(j)].split("-")[0]),
          start: workTime[i][this.convertNumericToDay(j)].split("-")[1],
          end: workTime[i][this.convertNumericToDay(j)].split("-")[2]
        };
        workTimeArray.push(workTimeObject);
      }
      allWorkTime.push({
        change: workTime[i].dateChange,
        times: workTimeArray
      });
    }
    console.log(allWorkTime);
    return allWorkTime;
  }
}
