import { NgModule } from "@angular/core";
import { DynamicSendSmsComponent } from "../dashboard/sms/dynamic-send-sms/dynamic-send-sms.component";

@NgModule({
  declarations: [DynamicSendSmsComponent],
  exports: [DynamicSendSmsComponent],
  imports: [
  ],
  providers: [],
  bootstrap: [],
})
export class SharedSMSModule {}
