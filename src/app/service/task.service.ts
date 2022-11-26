import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs/Observable";
import { zip } from "rxjs/observable/zip";
import { map } from "rxjs/operators/map";
import { tap } from "rxjs/operators/tap";

import {
  BaseEditService,
  SchedulerModelFields,
} from "@progress/kendo-angular-scheduler";
import { parseDate } from "@progress/kendo-angular-intl";

import { MyEvent } from "./task.interface";

const CREATE_ACTION = "create";
const UPDATE_ACTION = "update";
const REMOVE_ACTION = "destroy";
import { SchedulerEvent } from "@progress/kendo-angular-scheduler";
const fields: SchedulerModelFields = {
  id: "TaskID",
  title: "Title",
  description: "Description",
  startTimezone: "StartTimezone",
  start: "Start",
  end: "End",
  endTimezone: "EndTimezone",
  isAllDay: "IsAllDay",
  recurrenceRule: "RecurrenceRule",
  recurrenceId: "RecurrenceID",
  recurrenceExceptions: "RecurrenceException",
};

@Injectable()
export class TaskService extends BaseEditService<MyEvent> {
  public loading = false;

  constructor(public http: HttpClient) {
    super(fields);
  }

  public read(): void {
    if (this.data.length) {
      this.source.next(this.data);
      return;
    }

    this.fetch().subscribe((data) => {
      this.data = data.map((item) => this.readEvent(item));
      this.source.next(this.data);
    });
  }

  protected save(
    created: MyEvent[],
    updated: MyEvent[],
    deleted: MyEvent[]
  ): void {
    const completed = [];
    if (deleted.length) {
      completed.push(this.fetch(REMOVE_ACTION, deleted));
    }

    if (updated.length) {
      completed.push(this.fetch(UPDATE_ACTION, updated));
    }

    if (created.length) {
      completed.push(this.fetch(CREATE_ACTION, created));
    }

    zip(completed).subscribe(() => this.read());
  }

  protected fetch(action: string = "", data?: any): Observable<any[]> {
    this.loading = true;
    console.log("usao sam ovde u fetch!");
    console.log(action);
    console.log(data);
    return this.http
      .jsonp(
        `https://demos.telerik.com/kendo-ui/service/tasks/${action}?${this.serializeModels(
          data
        )}`,
        "callback"
      )
      .pipe(
        map((res) => <any[]>res),
        tap(() => (this.loading = false))
      );
  }

  public readEvent(item: any): MyEvent {
    return {
      ...item,
      Start: parseDate(item.Start),
      End: parseDate(item.End),
      RecurrenceException: this.parseExceptions(item.RecurrenceException),
    };
  }

  public serializeModels(events: MyEvent[]): string {
    if (!events) {
      return "";
    }

    const data = events.map((event) => ({
      ...event,
      RecurrenceException: this.serializeExceptions(event.RecurrenceException),
    }));

    return `&models=${JSON.stringify(data)}`;
  }

  createTask(data, callback) {
    console.log(data);
    this.http
      .post("/api/createTask", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  updateTask(data, callback) {
    return this.http
      .post("/api/updateTask", data)
      .map((res) => res)
      .subscribe((val) => callback(val));
  }

  deleteTask(id) {
    return this.http.get("/api/deleteTask/" + id).map((res) => res);
  }

  getTasks(id) {
    return this.http
      .get<SchedulerEvent[]>("/api/getTasks/" + id)
      .map((res) => res);
  }

  getEventCategoryStatistic(superadmin) {
    return this.http.get("/api/getEventCategoryStatistic/" + superadmin);
  }

  getTasksForUser(id) {
    return this.http
      .get<SchedulerEvent[]>("/api/getTasksForUser/" + id)
      .map((res) => res);
  }

  getWorkandTasksForUser(id) {
    return this.http
      .get<SchedulerEvent[]>("/api/getWorkandTaskForUser/" + id)
      .map((res) => res);
  }

  getTasksForStore(id, idUser, typeOfUser) {
    return this.http
      .get<SchedulerEvent[]>(
        "/api/getTasksForStore/" + id + "/" + idUser + "/" + typeOfUser
      )
      .map((res) => res);
  }

  getTaskColor() {
    return this.http
      .get("../assets/configuration/task-color.json")
      .map((res) => res);
  }

  getWorkTimeForUser(id) {
    return this.http.get("/api/getWorkTimeForUser/" + id).map((res) => res);
  }

  sendConfirmArrivalAgain(data) {
    return this.http
      .post("/api/sendConfirmArrivalAgain", data)
      .map((res) => res);
  }

  getDataForMassiveInvoice(patientId) {
    return this.http.get<any[]>("/api/getDataForMassiveInvoice/" + patientId).toPromise();
  }

}
