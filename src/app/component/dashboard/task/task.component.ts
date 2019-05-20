import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from '../../../service/customers.service';
import { CustomersComponent } from '../customers/customers.component';
import { Modal } from 'ngx-modal';
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
} from '@progress/kendo-angular-scheduler';
import '@progress/kendo-date-math/tz/regions/Europe';
import '@progress/kendo-date-math/tz/regions/NorthAmerica';
import { filter } from 'rxjs/operators/filter';

import { TaskService } from '../../../service/task.service';
@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TaskComponent implements OnInit {

    @ViewChild('customer') customerModal: Modal;
    public selectedDate: Date = new Date();
    public formGroup: FormGroup;
    public events: SchedulerEvent[] = [];
    public customerUsers: any;
    public telephoneValue = null;
    public type: any;
    public customerComponent: CustomersComponent;
    public usersInCompany: any;
    public colorTask: any;
    public data = {
        'id': '',
        'shortname': '',
        'firstname': '',
        'lastname': '',
        'gender': '',
        'street': '',
        'streetnumber': '',
        'city': '',
        'telephone': '',
        'mobile': '',
        'email': '',
        'birthday': '',
        'companyId': ''
    };

    constructor(private formBuilder: FormBuilder, private service: TaskService, private customer: CustomersService) {
        this.createFormGroup = this.createFormGroup.bind(this);
    }

    ngOnInit() {
        this.type = localStorage.getItem('type');
        console.log(this.events);
        if (localStorage.getItem('type') === '3') {
            this.service.getTasksForUser(localStorage.getItem('idUser')).subscribe(
                data => {
                    this.events = [];
                    for (let i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                        this.events.push(data[i]);
                    }
                }
            );
        } else {
            this.service.getTasks().subscribe(
                data => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                        this.events.push(data[i]);
                    }
                    console.log(this.events);
                }
            );

            this.service.getUsersInCompany(localStorage.getItem('companyId'), (val) => {
                this.usersInCompany = val;
            });
        }

        this.customer.getCustomers(localStorage.getItem('companyId'), (val) => {
            console.log(val);
            this.customerUsers = val;
        });
        console.log(this.events);
    }

    public createFormGroup(args: CreateFormGroupArgs): FormGroup {
        const dataItem = args.dataItem;
        console.log(this.events);
        this.formGroup = this.formBuilder.group({
            'id': args.isNew ? this.getNextId() : dataItem.id,
            'start': [dataItem.start, Validators.required],
            'end': [dataItem.end, Validators.required],
            'startTimezone': [dataItem.startTimezone],
            'endTimezone': [dataItem.endTimezone],
            'isAllDay': dataItem.isAllDay,
            'title': dataItem.title,
            'colorTask': dataItem.colorTask,
            'creator_id': localStorage.getItem('idUser'),
            'user': dataItem.user,
            'telephone': dataItem.telephone,
            'description': dataItem.description,
            'recurrenceRule': dataItem.recurrenceRule,
            'recurrenceId': dataItem.recurrenceId
        });
        console.log(this.formGroup);
        return this.formGroup;
    }

    public isEditingSeries(editMode: EditMode): boolean {
        return editMode === EditMode.Series;
    }

    public getNextId(): number {
        const len = this.events.length;

        return (len === 0) ? 1 : this.events[this.events.length - 1].id + 1;
    }

    public saveHandler({ sender, formGroup, isNew, dataItem, mode }): void {
        console.log(formGroup);
        if (formGroup.valid) {
            const formValue = formGroup.value;

            if (isNew) {
                this.service.create(formValue);
                this.service.createTask(formValue, val => {
                    console.log(val);
                });
            } else {
                this.handleUpdate(dataItem, formValue, mode);
            }

            this.closeEditor(sender);
        }
    }

    private handleUpdate(item: any, value: any, mode?: EditMode): void {
        const service = this.service;
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

    private closeEditor(scheduler: SchedulerComponent): void {
        scheduler.closeEvent();

        this.formGroup = undefined;
    }

    onValueChange(event) {
        console.log(event);
        if (event !== undefined) {
            this.telephoneValue = event.telephone;
        } else {
            this.telephoneValue = null;
        }
    }

    newCustomer() {
        this.customerModal.open();
    }

    createCustomer(form) {
        console.log(this.data);
        this.data.companyId = localStorage.getItem('companyId');
        this.customer.createCustomer(this.data, (val) => {
            console.log(val);
            this.customerModal.close();
            // form.reset();
        });

    }

    changeUser(event) {
        console.log(event);
        if (event !== undefined) {
            this.service.getTasksForUser(event.id).subscribe(
                data => {
                    console.log(data);
                    this.events = [];
                    for (let i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                        this.events.push(data[i]);
                    }
                }
            );
        } else {
            this.service.getTasks().subscribe(
                data => {
                    this.events = [];
                    for (let i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                        this.events.push(data[i]);
                    }
                }
            );
        }
    }

}
