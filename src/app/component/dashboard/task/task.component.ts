import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from '../../../service/customers.service';
import { CustomersComponent } from '../customers/customers.component';
import { Modal } from 'ngx-modal';
import { MessageService } from '../../../service/message.service';
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
    @ViewChild('customerUserModal') customerUserModal: Modal;
    public selectedDate: Date = new Date();
    public formGroup: FormGroup;
    public events: SchedulerEvent[] = [];
    public customerUsers: any;
    public telephoneValue = null;
    public type: any;
    public customerComponent: CustomersComponent;
    public usersInCompany: any;
    public colorTask: any;
    public zIndex: string;
    public theme: string;
    public selected = '#fe413b';
    public palette: any[] = [];
    public colorPalette: any;
    public selectedColorId: any;
    public language: any;
    public resources: any[] = [];
    public customerUser: any;
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

    constructor(private formBuilder: FormBuilder, private service: TaskService, private customer: CustomersService, private message: MessageService) {
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

        this.message.getTheme().subscribe(
            mess => {
                console.log(mess);
                setTimeout(() => {
                    this.changeTheme(mess);
                }, 50);
            }
        );

        setTimeout(() => {
            this.changeTheme(localStorage.getItem('theme'));
        }, 50);

        if (localStorage.getItem('translation') !== undefined) {
            this.language = JSON.parse(localStorage.getItem('translation'))['calendar'];
            console.log(this.language);
        }

        this.message.getLanguage().subscribe(
            mess => {
                this.language = undefined;
                setTimeout(() => {
                    this.language = JSON.parse(localStorage.getItem('translation'))['calendar'];
                    console.log(this.language);
                }, 10);
            }
        );

        this.service.getTaskColor().subscribe(
            data => {
                console.log(data);
                const resourcesObject = {
                        name: 'Rooms',
                        data: data,
                        field: 'colorTask',
                        valueField: 'id',
                        textField: 'text',
                        colorField: 'color'
                }
                this.resources.push(resourcesObject);
                this.colorPalette = data;
                for(let i = 0; i < data['length']; i++) {
                    this.palette.push(data[i].color);
                }
            }
        );
    }

    public createFormGroup(args: CreateFormGroupArgs): FormGroup {
        const dataItem = args.dataItem;
        console.log(dataItem);

        this.formGroup = this.formBuilder.group({
            'id': args.isNew ? this.getNextId() : dataItem.id,
            'start': [dataItem.start, Validators.required],
            'end': [dataItem.end, Validators.required],
            'startTimezone': [dataItem.startTimezone],
            'endTimezone': [dataItem.endTimezone],
            'isAllDay': dataItem.isAllDay,
            'title': dataItem.title,
            'colorTask': dataItem.colorTitle,
            'creator_id': localStorage.getItem('idUser'),
            'user': dataItem.user,
            'telephone': dataItem.telephone,
            'description': dataItem.description,
            'recurrenceRule': dataItem.recurrenceRule,
            'recurrenceId': dataItem.recurrenceId
        });
 
        if(dataItem.telephone !== null) {
            this.telephoneValue = dataItem.telephone;
        }

        if(dataItem.user !== null) {
            this.customerUser = dataItem.user;
        }

        setTimeout(() => {       
            if(dataItem.colorTask !== null) {
                this.selected = this.IdMapToColor(dataItem.colorTask);
                console.log(this.selected);
            }
            this.changeTheme(localStorage.getItem('theme'));
        }, 50);
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
            let formValue = formGroup.value;

            if (isNew) {
                formValue = this.colorMapToId(formValue);
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
        console.log('test!');
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
        console.log('close!');
        scheduler.closeEvent();

        this.formGroup = undefined;
    }

    onValueChange(event) {
        console.log(event);
        this.customerUser = event;
    }

    newCustomer() {
        this.zIndex = 'zIndex';
        this.customerModal.open();
    }

    closeNewCustomer() {
        this.zIndex = '';
        this.customerModal.close();
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

    changeTheme(theme: string) {
        console.log(theme);
        if (localStorage.getItem('allThemes') !== undefined) {
            const allThemes = JSON.parse(localStorage.getItem('allThemes'));
            console.log(allThemes);
            let items = document.querySelectorAll('.k-dialog-titlebar');
            for (let i = 0; i < items.length; i++) {
                const clas = items[i].classList;
                for (let j = 0; j < allThemes.length; j++) {
                    const themeName = allThemes[j]['name'];
                    console.log(clas);
                    clas.remove('k-dialog-titlebar-' + themeName);
                    clas.add('k-dialog-titlebar-' + theme);
                }
            }

            items = document.querySelectorAll('.k-button-icontext');
            for (let i = 0; i < items.length; i++) {
                const clas = items[i].classList;
                for (let j = 0; j < allThemes.length; j++) {
                    const themeName = allThemes[j]['name'];
                    clas.remove('k-button-icontext-' + themeName);
                    clas.add('k-button-icontext-' + theme);
                }
            }

            items = document.querySelectorAll('.k-primary');
            for (let i = 0; i < items.length; i++) {
                const clas = items[i].classList;
                for (let j = 0; j < allThemes.length; j++) {
                    const themeName = allThemes[j]['name'];
                    clas.remove('k-primary-' + themeName);
                    clas.add('k-primary-' + theme);
                }
            }


            items = document.querySelectorAll('.k-state-selected');
            for (let i = 0; i < items.length; i++) {
                const clas = items[i].classList;
                for (let j = 0; j < allThemes.length; j++) {
                    const themeName = allThemes[j]['name'];
                    console.log(themeName);
                    clas.remove('k-state-selected-' + themeName);
                    clas.add('k-state-selected-' + theme);
                }
            }
            this.theme = theme;
        }
    }

    valueChange(event) {
        console.log(event);
    }

    colorMapToId(task) {
        for(let i = 0; i < this.colorPalette.length; i++) {
            if(this.colorPalette[i].color === task.colorTask) {
                task.colorTask = Number(this.colorPalette[i].id);
            }
        }
        return task;
    }

    IdMapToColor(id) {
        for(let i = 0; i < this.colorPalette.length; i++) {
            if(this.colorPalette[i].id === id) {
                return this.colorPalette[i].color;
            }
        }
        return null;
    }

    baseDataForUser() {
        this.zIndex = 'zIndex';
        this.customerUserModal.open();
    }

    closebaseDataForUser() {
        this.zIndex = '';
        this.customerUserModal.close();
    }

}
