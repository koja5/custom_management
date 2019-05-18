import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';

import { BaseEditService, SchedulerModelFields } from '@progress/kendo-angular-scheduler';
import { parseDate } from '@progress/kendo-angular-intl';

import { MyEvent } from './task.interface';

const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'destroy';
import {
    SchedulerEvent
} from '@progress/kendo-angular-scheduler';
const fields: SchedulerModelFields = {
    id: 'TaskID',
    title: 'Title',
    description: 'Description',
    startTimezone: 'StartTimezone',
    start: 'Start',
    end: 'End',
    endTimezone: 'EndTimezone',
    isAllDay: 'IsAllDay',
    recurrenceRule: 'RecurrenceRule',
    recurrenceId: 'RecurrenceID',
    recurrenceExceptions: 'RecurrenceException'
};

@Injectable()
export class TaskService extends BaseEditService<MyEvent> {
    public loading = false;

    constructor(private http: HttpClient) {
        super(fields);
    }

    public read(): void {
        if (this.data.length) {
            this.source.next(this.data);
            return;
        }

        this.fetch().subscribe(data => {
            this.data = data.map(item => this.readEvent(item));
            this.source.next(this.data);
        });
    }

    protected save(created: MyEvent[], updated: MyEvent[], deleted: MyEvent[]): void {
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

        zip(...completed).subscribe(() => this.read());
    }

    protected fetch(action: string = '', data?: any): Observable<any[]> {
        this.loading = true;

        return this.http
            .jsonp(`https://demos.telerik.com/kendo-ui/service/tasks/${action}?${this.serializeModels(data)}`, 'callback')
            .pipe(
                map(res => <any[]>res),
                tap(() => this.loading = false)
            );
    }

    private readEvent(item: any): MyEvent {
        return {
            ...item,
            Start: parseDate(item.Start),
            End: parseDate(item.End),
            RecurrenceException: this.parseExceptions(item.RecurrenceException)
        };
    }

    private serializeModels(events: MyEvent[]): string {
        if (!events) {
            return '';
        }

        const data = events.map(event => ({
            ...event,
            RecurrenceException:
                this.serializeExceptions(event.RecurrenceException)
        }));

        return `&models=${JSON.stringify(data)}`;
    }

    createTask(data, callback) {
        console.log(data);
        this.http.post('/api/createTask', data)
            .map(res => res)
            .subscribe(val => callback(val));
    }

    getTasks() {
        return this.http.get<SchedulerEvent[]>('/api/getTasks')
            .map(res => res);
    }

    getTasksForUser(id) {
        return this.http.get<SchedulerEvent[]>('/api/getTasksForUser/' + id)
            .map(res => res);
    }

    getUsersInCompany(id, callback) {
        return this.http.get('/api/getUsersInCompany/' + id)
            .map(res => res)
            .subscribe(val => callback(val));
    }


    getCompanyUsers(id, callback) {
        return this.http.get('/api/getUsers/' + id)
            .map(res => res)            
            .subscribe(val => callback(val));
    }
}
