import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { CookieService } from "ng2-cookies";
import { Router, ActivatedRoute } from "@angular/router";
import { Modal } from "ngx-modal";
import { MessageService } from "../../service/message.service";
import { DashboardService } from "../../service/dashboard.service";
import { UsersService } from "../../service/users.service";
import { DomSanitizer } from "@angular/platform-browser";
import { NavigationMenuModel } from "../../models/navigation-menu";
import { MongoService } from "../../service/mongo.service";
import { HelpService } from "src/app/service/help.service";
import { UserType } from "../enum/user-type";
import { StorageService } from "src/app/service/storage.service";
declare var document: any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild("settings") settings: Modal;
  @ViewChild("firstLogin") firstLogin: Modal;
  @ViewChild("templateLoading") templateLoading: Modal;
  public sidebar = "";
  public sidebarMobile = "";
  public profile = "";
  public type: number;
  public theme: string;
  public languageName;
  public language: any;
  public allThemes: any;
  public allLanguage: any;
  public imagePath: any = "../../../assets/images/users/defaultUser.png";
  public selectedNode = "calendar";
  public selectedNodeModel = new NavigationMenuModel();
  public typeOfDesign = "vertical";
  public user: any;
  public pathFromUrl: any;
  public subMenuInd = "";
  public sidebarHeight: any;
  public userType = UserType;
  public permissionPatientMenu: any;
  public showHideCollapse = [];
  public activeGroup = [];
  public height: string;
  public templateAccount: any;
  public templateAccountFields = {
    text: "name",
    value: "account_id",
  };
  public templateAccountValue: any;

  constructor(
    private router: Router,
    private cookie: CookieService,
    private message: MessageService,
    private service: DashboardService,
    private users: UsersService,
    private sanitizer: DomSanitizer,
    private activatedRouter: ActivatedRoute,
    private mongo: MongoService,
    private helpService: HelpService,
    private storageService: StorageService
  ) {
    this.helpService.setTitleForBrowserTab("ClinicNode");
  }

  ngOnInit() {
    this.height = this.helpService.getHeightForGrid();
    this.sidebarHeight = window.innerHeight - 60 + "px";
    this.selectedNode =
      this.activatedRouter.snapshot["_routerState"].url.split("/")[2];
    this.initializeCollapse();
    this.checkDefaultLink();
    this.checkFirstLogin();

    this.selectedNodeModel[this.selectedNode] = "active";

    if (this.helpService.getLocalStorage("theme") !== null) {
      this.theme = this.helpService.getLocalStorage("theme");
    } else {
      this.theme = "Theme2";
      this.insertThemeForUser(this.theme);
      this.helpService.setLocalStorage("theme", this.theme);
    }
    this.type = Number(this.helpService.getLocalStorage("type"));

    if (this.helpService.getLocalStorage("allThemes") !== undefined) {
      this.service.getThemeConfig().subscribe((data) => {
        console.log(data);
        this.allThemes = data;
        this.helpService.setLocalStorage(
          "allThemes",
          JSON.stringify(this.allThemes)
        );
      });
    } else {
      this.allThemes = this.helpService.getLocalStorage("allThemes");
    }

    if (this.helpService.getLocalStorage("allLanguage") === null) {
      this.service.getLanguageConfig().subscribe((data) => {
        this.allLanguage = data;
        this.helpService.setLocalStorage(
          "allLanguage",
          JSON.stringify(this.allLanguage)
        );
      });
    } else {
      this.allLanguage = JSON.parse(
        this.helpService.getLocalStorage("allLanguage")
      );
    }

    // defined default language
    // setTimeout(() => {
    //   if (this.helpService.getLocalStorage("defaultLanguage") !== null) {
    //     this.languageName = this.helpService.getLocalStorage("defaultLanguage");
    //   } else {
    //     console.log(this.allLanguage);
    //     for (let i = 0; i < this.allLanguage.length; i++) {
    //       if (this.allLanguage[i].default) {
    //         this.languageName = this.allLanguage[i].name;
    //         this.helpService.setLocalStorage("defaultLanguage", this.languageName);
    //         console.log(this.languageName);
    //       }
    //     }
    //   }
    // }, 500);

    if (this.helpService.getLocalStorage("language") !== null) {
      this.language = JSON.parse(this.helpService.getLocalStorage("language"));
    } else {
      /*this.service.getTranslation("english").subscribe(data => {
        console.log(data);
        this.language = data;
        this.helpService.setLocalStorage("language", JSON.stringify(this.language));
      });*/
    }

    this.getMe();

    this.message.getImageProfile().subscribe((mess) => {
      this.getMe();
    });

    /*this.mongo.getConfigurationForUser(this.helpService.getLocalStorage('idUser')).subscribe(
      data => {
        console.log(data);
      }
    );*/

    if (this.helpService.getLocalStorage("sidebar")) {
      this.sidebar = this.helpService.getLocalStorage("sidebar");
    }
    this.checkPermissionForPatientMenu();

    this.message.getNewLanguage().subscribe((mess) => {
      this.language = JSON.parse(this.helpService.getLocalStorage("language"));
    });
  }

  checkDefaultLink() {
    if (this.helpService.getSessionStorage("defaultLink")) {
      this.router.navigate([this.helpService.getSessionStorage("defaultLink")]);
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = this.helpService.getHeightForGrid();
  }

  initializeCollapse() {
    for (let i = 0; i < 3; i++) {
      this.showHideCollapse[i] = "";
      this.activeGroup[i] = "";
    }
  }

  collapse(index) {
    if (this.showHideCollapse[index] === "") {
      this.showHideCollapse[index] = "mm-show";
      this.activeGroup[index] = "mm-active";
    } else {
      this.showHideCollapse[index] = "";
      this.activeGroup[index] = "";
    }
  }

  checkPermissionForPatientMenu() {
    const superadmin = this.helpService.getSuperadmin();
    if (this.type === this.userType.patient) {
      this.mongo
        .getPermissionForPatientNavigation(superadmin)
        .subscribe((data) => {
          this.permissionPatientMenu = data;
        });
    }
  }

  insertThemeForUser(theme: string) {
    const item = {
      user_id: this.helpService.getMe(),
      theme: theme,
    };

    this.mongo.includeConfiguration(item).subscribe((data) => {
      console.log(data);
    });
  }

  getMe() {
    this.users.getMe(this.helpService.getMe(), (val) => {
      console.log(val);
      if (val && val.length > 0) {
        this.user = val[0];
        if (val[0].img && val[0].img.data && val[0].img.data.length !== 0) {
          const TYPED_ARRAY = new Uint8Array(val[0].img.data);
          const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
          const base64String = btoa(STRING_CHAR);
          const path = this.sanitizer.bypassSecurityTrustUrl(
            "data:image/png;base64," + base64String
          );
          console.log(path);
          this.imagePath = path;
        }
      } else {
        this.imagePath = "../../../assets/images/users/defaultUser.png";
      }
    });
  }

  /*hideShowSidebar() {
    if (this.sidebar === '') {
      this.sidebar = 'enlarged';
    } else {
      this.sidebar = '';
    }
  }*/

  hideShowSidebar() {
    if (this.sidebar === "") {
      this.sidebar = "sidemenu-closed sidebar-enable";
    } else {
      this.sidebar = "";
    }

    this.helpService.setLocalStorage("sidebar", this.sidebar);
  }

  hideShowSidebarMobile() {
    this.sidebar = "";
    if (this.sidebarMobile === "") {
      this.sidebarMobile = "collapse show";
    } else {
      this.sidebarMobile = "";
    }
  }

  showHideProfile() {
    if (this.profile === "") {
      this.profile = "show";
    } else {
      this.profile = "";
    }
  }

  logout() {
    if (this.helpService.getMe()) {
      const item = {
        user_id: this.helpService.getMe(),
        selectedStore: this.storageService.getSelectedStore(
          this.helpService.getMe()
        ),
      };
      this.mongo.setSelectedStore(item).subscribe((data) => {
        console.log(data);
      });
    }
    this.cookie.deleteAll("/");
    sessionStorage.clear();
    localStorage.removeItem("idUser");
    this.cookie.deleteAll("/dashboard/home");
    setTimeout(() => {
      this.router.navigate(["login"]);
    }, 50);
  }

  changeTheme(name: string) {
    console.log(name);
    this.helpService.setLocalStorage("theme", name);
    this.theme = name;
    this.message.sendTheme(name);

    const item = {
      user_id: 123,
      theme: "Theme2",
      events: "Event",
      store_users: [
        {
          key: "store-3",
          value: {
            id: 3,
            user: "pera",
          },
        },
      ],
    };

    this.mongo.includeConfiguration(item).subscribe((data) => {
      console.log(data);
    });
  }

  changeLanguage(name: string) {
    this.languageName = name;
    this.helpService.setLocalStorage("language", name);
    this.language = undefined;
    /*this.service.getTranslation(this.languageName).subscribe(data => {
      this.language = data;
      this.helpService.setLocalStorage("language", JSON.stringify(this.language));
      this.message.sendLanguage();
    });*/
  }

  returnActiveNode(node) {
    this.selectedNodeModel[this.selectedNode] = "";
    this.selectedNode = node;
    this.selectedNodeModel[this.selectedNode] = "active";
    setTimeout(() => {
      this.pathFromUrl = window.location.pathname.split("/");
      // this.pathFromUrl = this.pathFromUrl.splice(0, 1);
      console.log(this.pathFromUrl);
    }, 10);
  }

  showHideSubMenu() {
    if (this.subMenuInd === "") {
      this.subMenuInd = "active open";
      this.sidebarHeight = window.innerHeight - 50 + "px";
    } else {
      this.subMenuInd = "";
      this.sidebarHeight = "auto";
    }
  }

  toggleFullscreen(): void {
    const isInFullScreen =
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement &&
        document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement &&
        document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);

    const docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  getUserType(type) {
    if (type === this.userType.owner) {
      return this.language.owner;
    } else if (type === this.userType.admin) {
      return this.language.admin;
    } else if (type === this.userType.doctor) {
      return this.language.doctor;
    } else if (type === this.userType.nurse) {
      return this.language.nurse;
    } else if (type === this.userType.patient) {
      return this.language.patient;
    } else if (type === this.userType.administrator) {
      return this.language.administrator;
    }
  }

  checkFirstLogin() {
    if (this.helpService.getSessionStorage("first_login")) {
      this.service.getTemplateAccount().subscribe((data) => {
        this.templateAccount = data;
      });
      this.firstLogin.open();
      sessionStorage.removeItem("first_login");
    }
  }

  loadTemplateAccount() {
    this.firstLogin.close();
    this.templateLoading.open();
    const data = {
      id: this.helpService.getMe(),
      account_id: this.templateAccountValue,
    };
    this.service.loadTemplateAccount(data).subscribe((response) => {
      if (response) {
        this.templateLoading.close();
      }
    });
  }
}
