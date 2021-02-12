import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BaseDateComponent } from "../dashboard/task/base-date/base-date.component";


@NgModule({
    declarations: [
        BaseDateComponent
    ],
    exports: [
        BaseDateComponent
    ],
    imports: [CommonModule],
    providers: [],
    bootstrap: [],
})
export class BaseDateSharedModule {
}
