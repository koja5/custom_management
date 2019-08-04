import { Component, Input, OnInit, ViewEncapsulation, LOCALE_ID, Inject } from '@angular/core';
import { ToolbarService } from '@progress/kendo-angular-scheduler';
import { MessageService } from '../../../service/message.service';
import '@progress/kendo-angular-intl/locales/de/all';
import { IntlService, CldrIntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'my-navigation-view',
    template: `
        {{ selectedDate | kendoDate:'d':localeId }}
    `,
    encapsulation: ViewEncapsulation.None
})
export class MyNavigationViewComponent implements OnInit {
    @Input() public selectedDate: Date;

    // tslint:disable-next-line: max-line-length
    constructor(public toolbarService: ToolbarService, public message: MessageService, @Inject(LOCALE_ID) public localeId: string, public intlService: IntlService) {
    }

    ngOnInit() {
        /*console.log('usao sam ovdee!');
        if (this.dateEvent === 'next') {
            this.next();
        }*/

        this.localeId = 'de-DE';

        this.message.getViewChange().subscribe(
            mess => {
                if (mess === 'next') {
                    this.next();
                } else {
                    this.prev();
                }
            }
        );
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
}

