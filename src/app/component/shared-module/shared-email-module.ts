import { NgModule } from "@angular/core";
import { DynamicSendEmailComponent } from "../dashboard/email/dynamic-send-email/dynamic-send-email.component";

@NgModule({
  declarations: [DynamicSendEmailComponent],
  exports: [DynamicSendEmailComponent],
  imports: [],
  providers: [],
  bootstrap: [],
})
export class SharedEmailModule {}
