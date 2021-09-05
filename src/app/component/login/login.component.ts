import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../service/login.service";
import { MailService } from "../../service/mail.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CookieService } from "ng2-cookies";
import { DashboardService } from "../../service/dashboard.service";
import { MongoService } from "../../service/mongo.service";
import { HelpService } from "src/app/service/help.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { StorageService } from "src/app/service/storage.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public loginForm = "active";
  public signupForm: string;
  public recoverForm: string;
  public loading = false;
  public hideShow = "password";
  public hideShowEye = "fa-eye-slash";
  public loginInfo: any;
  public signUpInfo: any;
  public forgotInfo = false;
  public errorInfo: string;
  public emailValid = true;
  public language: any;

  public data = {
    id: "",
    shortname: "",
    password: "",
    street: "",
    zipcode: "",
    place: "",
    email: "",
    telephone: "",
    mobile: "",
    comment: "",
    storeId: 0,
  };
  // public data: LoginData;

  constructor(
    private service: LoginService,
    private mailService: MailService,
    private cookie: CookieService,
    private router: Router,
    private dashboardService: DashboardService,
    private mongo: MongoService,
    private helpService: HelpService,
    private packLanguage: PackLanguageService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.initialization();
    // ovde treba da se napravi da se ocita lokacija korisnika i na osnovu toga povuce odgovarajuci jezik
    // kada se korisnik loguje, povlaci se ona konfiguracija koju je on sacuvao...
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    } else {
      /*this.dashboardService.getTranslation("english").subscribe(data => {
        console.log(data);
        this.helpService.setLocalStorage("language", JSON.stringify(data));
        this.language = data["login"];
      });*/
    }
  }

  initialization() {
    if (this.helpService.getLocalStorage("defaultLanguage")) {
      this.language = JSON.parse(this.helpService.getLocalStorage("language"));
    } else {
      this.checkCountryLocation();
    }
    this.helpService.setDefaultBrowserTabTitle();
  }

  checkCountryLocation() {
    this.service.checkCountryLocation().subscribe(
      (data) => {
        this.getTranslationByCountryCode(data["countryCode"]);
      },
      (error) => {
        console.log(error);
        this.service.getDefaultLanguage().subscribe((language) => {
          this.language = language["config"];
          this.helpService.setLocalStorage(
            "language",
            JSON.stringify(this.language)
          );
        });
      }
    );
  }

  getTranslationByCountryCode(countryCode: string) {
    this.service.getTranslationByCountryCode(countryCode).subscribe(
      (language) => {
        if (language !== null) {
          this.language = language["config"];
          this.helpService.setLocalStorage(
            "language",
            JSON.stringify(this.language)
          );
          this.router.navigate(["/dashboard/home/task"]);
        } else {
          this.service.getDefaultLanguage().subscribe(
            (language) => {
              if (language !== null) {
                this.language = language["config"];
                this.helpService.setLocalStorage(
                  "language",
                  JSON.stringify(this.language)
                );
                this.router.navigate(["/dashboard/home/task"]);
              } else {
                this.router.navigate(["/maintence"]);
              }
            },
            (error) => {
              this.router.navigate(["/maintence"]);
            }
          );
        }
      },
      (error) => {
        this.router.navigate(["/maintence"]);
      }
    );
  }

  signUpActive() {
    this.loginForm = "";
    this.recoverForm = "";
    this.signupForm = "active";
  }

  loginActive() {
    this.signupForm = "";
    this.recoverForm = "";
    this.loginForm = "active";
  }

  /*forgotActive() {
    this.signupForm = '';
    this.recoverForm = '';
    this.loginForm = 'active';
    this.forgotInfo = 'Link to recovery password is send on your mail!';
  }*/

  recoveryActive() {
    this.signupForm = "";
    this.loginForm = "";
    this.recoverForm = "active";
  }

  login(form) {
    this.loading = true;
    this.service.login(
      this.data,
      (isLogin, notActive, user, type, id, storeId, superadmin, last_login) => {
        console.log("login" + notActive);
        if (isLogin) {
          if (!notActive) {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))[
              "checkMailForActive"
            ];
            this.loading = false;
          } else {
            this.cookie.set("user", type);
            this.helpService.setLocalStorage("type", type);
            this.helpService.setLocalStorage("idUser", id);
            this.helpService.setLocalStorage("indicatorUser", id);
            this.helpService.setLocalStorage("storeId-" + id, storeId);
            this.helpService.setLocalStorage("superadmin", superadmin);
            if(last_login === null) {
              this.helpService.setSessionStorage('first_login', true);
            }
            this.getConfigurationFromDatabase(id);
          }
        } else {
          this.loginInfo = JSON.parse(localStorage.getItem("language"))[
            "notCorrectPass"
          ];
          this.loading = false;
        }
      }
    );
  }

  signUp(form) {
    console.log(this.data);
    this.errorInfo = "";
    this.loginInfo = "";
    if (
      this.data.email !== "" &&
      this.data.shortname &&
      this.data.password !== ""
    ) {
      this.service.signUp(this.data, (val) => {
        if (!val.success) {
          this.errorInfo = val.info;
        } else {
          this.data["language"] = this.packLanguage.getLanguageForConfirmMail();
          this.mailService.sendMail(this.data, function () {
            console.log("Mail uspesno poslat");
          });
          this.signUpInfo = JSON.parse(localStorage.getItem("language"))[
            "checkMailForActive"
          ];
          setTimeout(() => {
            this.loginActive();
          }, 3000);
        }
        // form.reset();
      });
    } else {
      this.errorInfo = JSON.parse(localStorage.getItem("language"))[
        "fillFields"
      ];
    }
  }

  forgotPassword() {
    const thisObject = this;
    thisObject.data["language"] = this.packLanguage.getLanguageForForgotMail();
    if (this.data.email !== "") {
      this.service.forgotPassword(this.data, function (exist, notVerified) {
        setTimeout(() => {
          if (exist) {
            thisObject.mailService
              .sendForgetMail(thisObject.data)
              .subscribe((data) => {
                console.log("test");
              });

            if (!exist) {
              thisObject.emailValid = false;
            } else {
              document.getElementById("textClass").innerHTML = JSON.parse(
                localStorage.getItem("language")
              )["sendForgotMail"];
            }
          }
        }, 100);
      });
    } else {
      this.errorInfo = JSON.parse(localStorage.getItem("language"))[
        "fillFields"
      ];
    }
  }

  hideShowPassword() {
    if (this.hideShow === "password") {
      this.hideShow = "text";
      this.hideShowEye = "fa-eye";
    } else {
      this.hideShow = "password";
      this.hideShowEye = "fa-eye-slash";
    }
  }

  getConfigurationFromDatabase(id) {
    this.mongo.getConfiguration(Number(id)).subscribe((data) => {
      this.setConfiguration(data, id);
    });
  }

  setConfiguration(data, id) {
    // this.helpService.setLocalStorage("theme", data.theme);
    // this.helpService.setLocalStorage("defaultLanguage", data.language);
    if (data.selectedStore !== null && data.selectedStore.length !== 0) {
      // this.helpService.setLocalStorage("selectedStore-" + id, JSON.stringify(data.selectedStore[0]));
      this.storageService.setSelectedStore(
        id,
        JSON.stringify(data.selectedStore[0])
      );
    }
    if (data.usersFor !== null && data.usersFor.length !== 0) {
      this.setUsersForConfiguration(data.usersFor);
    }
    if (data.storeSettings) {
      this.helpService.setLocalStorage(
        "storeSettings",
        JSON.stringify(data.storeSettings)
      );
    }

    if (
      data.langauge !== this.helpService.getLocalStorage("defaultLanguage") ||
      this.helpService.getLocalStorage("language") == undefined
    ) {
      this.helpService.setLocalStorage("defaultLanguage", data.language);
      this.getTranslationByCountryCode(data.language);
    } else {
      this.router.navigate(["/dashboard/home/task"]);
    }
  }

  setUsersForConfiguration(data) {
    for (let i = 0; i < data.length; i++) {
      this.helpService.setLocalStorage(
        data[i].key,
        JSON.stringify(data[i].value)
      );
    }
  }
}
