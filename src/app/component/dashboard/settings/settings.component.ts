import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { HelpService } from "src/app/service/help.service";
import { UserType } from "../../enum/user-type";
import { Router } from "@angular/router";
import { MessageService } from "src/app/service/message.service";
import { Subject, Subscription } from "rxjs";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  public language: any;
  public type: number;
  public userType = UserType;
  public dataNavigationMenu: { [key: string]: Object }[];
  public fields: Object = {
    groupBy: "category",
    iconCss: "icon",
    text: "menu",
    value: "route",
  };
  public height: string = "400px";
  public value: any;
  public subscription: Subscription;
  private unsubscribe: Subject<null> = new Subject();

  constructor(
    public location: Location,
    private helpService: HelpService,
    private router: Router,
    private messageService: MessageService
  ) {
    
  }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.type = this.helpService.getType();
    this.helpService.setTitleForBrowserTab(this.language.settings);
    this.packDataForMobileNavigationMenu();

    this.subscription = this.messageService.getNewLanguage().takeUntil(this.unsubscribe).subscribe((mess) => {
      this.language = JSON.parse(this.helpService.getLocalStorage('language'));
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
}

  packDataForMobileNavigationMenu() {
    this.value = "/dashboard/home/settings/account";
    this.dataNavigationMenu = [
      {
        menu: this.language.settingsAccount,
        category: this.language.settingsAccountNavigation,
        route: "/dashboard/home/settings/account",
        icon: "fa fa-user",
      },
      {
        menu: this.language.settingsChangePassword,
        category: this.language.settingsAccountNavigation,
        route: "/dashboard/home/settings/change-password",
        icon: "fa fa-user",
      },
      {
        menu: this.language.settingsChangeLanguage,
        category: this.language.settingsAccountNavigation,
        route: "/dashboard/home/settings/change-language",
        icon: "fa fa-globe",
      },
      {
        menu: this.language.perimissionForPatientNavigationMenu,
        category: this.language.settingsPermissionNavigation,
        route: "/dashboard/home/settings/permission-patient-menu",
        icon: "fa fa-user",
      },
      {
        menu: this.language.reminderMenu,
        category: this.language.settingsPermissionNavigation,
        route: "/dashboard/home/settings/reminders",
        icon: "fa fa-user",
      },
    ];
  }

  backToGrid() {
    this.location.back();
  }

  changeMobileNavigationMenu(event) {
    this.router.navigate([event.itemData.route]);
  }
}
