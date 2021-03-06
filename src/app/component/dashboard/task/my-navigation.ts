import {
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
    LOCALE_ID,
    Inject
} from '@angular/core';
import {
    ToolbarService,
    SchedulerView
} from '@progress/kendo-angular-scheduler';
import { MessageService } from '../../../service/message.service';
import '@progress/kendo-angular-intl/locales/de/all';
import { IntlService, CldrIntlService } from '@progress/kendo-angular-intl';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'my-navigation',
    template: `
    KW{{ selectedDate | date:'w' }}
  `,
    encapsulation: ViewEncapsulation.None
})
export class MyNavigationComponent implements OnInit {
    template: import('@angular/core').TemplateRef<any>;
    title: string;
    name: string;
    @Input() public selectedDate: Date;

    // tslint:disable-next-line: max-line-length
    constructor(
        public toolbarService: ToolbarService,
        public message: MessageService,
        @Inject(LOCALE_ID) public localeId: string,
        public intlService: IntlService
    ) {
    }

    ngOnInit() {
        /*console.log('usao sam ovdee!');
            if (this.dateEvent === 'next') {
                this.next();
            }*/

        this.localeId = 'de-DE';

        this.message.getViewChange().subscribe(mess => {
            if (mess === 'next') {
                this.next();
            } else if (mess === 'prev') {
                this.prev();
            } else if (mess === 'today') {
                this.today();
            }
        });

        this.message.getDateChange().subscribe(
            mess => {
                this.dateChange(mess);
            }
        )
    }

    public next(): void {
        console.log('usao sam ovdee!');
        this.toolbarService.navigate({
            type: 'next'
        });

    }

    public prev(): void {
        this.toolbarService.navigate({
            type: 'prev'
        });
    }

    public today(): void {
        this.toolbarService.navigate({
            type: 'today'
        });
    }

    public dateChange(date): void {
        this.toolbarService.navigate({
            type: 'select-date',
            date: new Date(date)
        });
    }
}
