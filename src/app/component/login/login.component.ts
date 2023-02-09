import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../service/login.service";
import { MailService } from "../../service/mail.service";
import { Router } from "@angular/router";
import { CookieService } from "ng2-cookies";
import { DashboardService } from "../../service/dashboard.service";
import { MongoService } from "../../service/mongo.service";
import { HelpService } from "src/app/service/help.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { StorageService } from "src/app/service/storage.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public loginForm = "active";
  public signupForm: string;
  public recoverForm: string;
  public userAccessForm: string;
  public loading = false;
  public hideShow = "password";
  public hideShowEye = "fa-eye-slash";
  public loginInfo: any;
  public signUpInfo: any;
  public forgotInfo = false;
  public errorInfo: string;
  public emailValid = true;
  public language: any;
  private superadmin: number;
  public userAccessId: number;
  public userAccessDevice: string;
  public agreeValue = false;

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
    ipAddress: "",
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
    private storageService: StorageService,
    public http: HttpClient
  ) {}

  ngOnInit() {
    this.initialization();
    // ovde treba da se napravi da se ocita lokacija korisnika i na osnovu toga povuce odgovarajuci jezik
    // kada se korisnik loguje, povlaci se ona konfiguracija koju je on sacuvao...
  }

  initialization() {
    if (
      this.helpService.getSelectionLanguageCode() &&
      this.helpService.getLanguage()
    ) {
      this.language = this.helpService.getLanguage();
    } else if (
      this.helpService.getLocalStorage("countryCode") &&
      this.helpService.getLanguage()
    ) {
      this.language = this.helpService.getLanguage();
    } else {
      this.checkCountryLocation();
    }
    if (this.helpService.getLocalStorage("registrationData")) {
      const registrationData = JSON.parse(
        this.helpService.getLocalStorage("registrationData")
      );
      this.data.email = registrationData["email"];
      this.data.password = registrationData["password"];
    }
    this.helpService.setDefaultBrowserTabTitle();
    this.initializeIpAddress();
  }

  initializeIpAddress() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((res: any) => {
      this.data.ipAddress = res.ip;
    });
  }

  checkCountryLocation() {
    this.service.checkCountryLocation().subscribe(
      (data) => {
        this.helpService.setLocalStorage("countryCode", data["countryCode"]);
        this.getTranslationByCountryCode(data["countryCode"]);
        this.helpService.setLocalStorage("countryCode", data["countryCode"]);
      },
      (error) => {
        console.log(error);
        this.service.getDefaultLanguage().subscribe((language) => {
          this.language = language["config"];
          this.helpService.setLocalStorage(
            "language",
            JSON.stringify(this.language)
          );

          this.helpService.setLocalStorage(
            "languageVersion",
            language["timestamp"]
          );
          this.helpService.setLocalStorage(
            "languageName",
            language["language"]
          );
        });
        this.helpService.setLocalStorage("countryCode", "US");
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
          this.helpService.setLocalStorage(
            "languageVersion",
            language["timestamp"]
          );
          this.helpService.setLocalStorage(
            "languageName",
            language["language"]
          );
          this.helpService.setLocalStorage(
            "accountLanguage",
            language["countryCode"]
          );
          this.router.navigate(["/dashboard/home/task"]);
        } else {
          this.service.getDefaultLanguage().subscribe(
            (language) => {
              if (language !== null) {
                console.log("language", language);

                this.language = language["config"];
                this.helpService.setLocalStorage(
                  "language",
                  JSON.stringify(this.language)
                );
                this.helpService.setLocalStorage("accountLanguage", "AT");
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

  getTranslationByLanguage(language?: any) {
    this.service.getTranslationByLanguage(language).subscribe(
      (language) => {
        if (language !== null) {
          this.language = language["config"];
          this.helpService.setLocalStorage(
            "language",
            JSON.stringify(this.language)
          );
          this.helpService.setLocalStorage(
            "languageVersion",
            language["timestamp"]
          );
          this.helpService.setLocalStorage(
            "languageName",
            language["language"]
          );
          this.helpService.setLocalStorage(
            "accountLanguage",
            language["countryCode"]
          );
          this.router.navigate(["/dashboard/home/task"]);
        } else {
          this.service.getDefaultLanguage().subscribe(
            (language) => {
              if (language !== null) {
                console.log("language", language);
                this.language = language["config"];
                this.helpService.setLocalStorage(
                  "language",
                  JSON.stringify(this.language)
                );
                this.helpService.setLocalStorage("accountLanguage", "US");
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

  getTranslationByDemoCode(demoCode) {
    this.dashboardService
      .getTranslationByDemoAccount(demoCode)
      .subscribe((language) => {
        this.language = language["config"];
        this.helpService.setLocalStorage(
          "language",
          JSON.stringify(this.language)
        );
        this.helpService.setLocalStorage(
          "accountLanguage",
          language["countryCode"]
        );
        this.helpService.setLocalStorage("countryCode", language["demoCode"]);
        this.helpService.setLocalStorage(
          "demoAccountLanguage",
          language["demoAccount"]
        );
        this.router.navigate(["/dashboard/home/task"]);
      });
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
      (
        isLogin,
        notActive,
        user,
        type,
        id,
        storeId,
        superadmin,
        last_login,
        info,
        user_access_id
      ) => {
        if (isLogin) {
          if (!notActive) {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))[
              "checkMailForActive"
            ];
            this.loading = false;
          } else {
            this.setUserInfoToLocalStorage(type, id, storeId, superadmin);
            this.superadmin = superadmin;
            if (last_login === null) {
              console.log("last login NULL");
              this.helpService.setSessionStorage("first_login", true);
            }
            this.getConfigurationFromDatabase(id);
            if (this.helpService.getLocalStorage("registrationData")) {
              this.helpService.clearLocalStorage("registrationData");
            }
          }
        } else {
          if (info === "deny_access") {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))[
              "needToSuperadminApproveAccess"
            ];
            if (user_access_id) {
              this.userAccessId = user_access_id;
              this.loginForm = "";
              this.userAccessForm = "active";
            }
          } else if (info === "licence_expired") {
            this.router.navigate(["/access-forbiden"]);
          } else if (info === "licence_expired_owner") {
            this.setUserInfoToLocalStorage(type, id, storeId, superadmin);
            this.router.navigate(["/licence"]);
          } else {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))[
              "notCorrectPass"
            ];
          }
          this.loading = false;
        }
      }
    );
  }

  setUserInfoToLocalStorage(type, id, storeId, superadmin) {
    this.cookie.set("user", type);
    this.helpService.setLocalStorage("type", type);
    this.helpService.setLocalStorage("idUser", id);
    this.helpService.setLocalStorage("indicatorUser", id);
    this.helpService.setLocalStorage("storeId-" + id, storeId);
    this.helpService.setLocalStorage("superadmin", superadmin);
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
      if (this.agreeValue) {
        this.service.signUp(this.data, (val) => {
          if (!val.success) {
            this.errorInfo = val.info;
          } else {
            this.data["language"] =
              this.packLanguage.getLanguageForConfirmMail();
            this.mailService.sendMail(this.data, function () {});
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
          "needToAgree"
        ];
      }
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
      delete this.data.password;
      this.service.forgotPassword(
        this.data,
        function (exist, notVerified, superadmin, firstname) {
          setTimeout(() => {
            if (exist) {
              thisObject.data["superadmin"] = superadmin;
              thisObject.data["firstname"] = firstname;
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
        }
      );
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
      if (data) {
        this.setConfiguration(data, id);
      } else {
        this.checkDemoAccountLanguage();
      }
    });
  }

  setConfiguration(data, id) {
    if (data.selectedStore && data.selectedStore.length !== 0) {
      this.storageService.setSelectedStore(
        id,
        JSON.stringify(data.selectedStore[0])
      );
    }
    if (data.usersFor && data.usersFor.length !== 0) {
      this.setUsersForConfiguration(data.usersFor);
    }
    if (data.storeSettings) {
      this.helpService.setLocalStorage(
        "storeSettings",
        JSON.stringify(data.storeSettings)
      );
    }
    if (data.language) {
      // actually this will check user settings for account language, not the country code
      this.getTranslationByCountryCode(data.language);
    } else {
      this.checkDemoAccountLanguage();
    }

    /*if (
      data.language !== this.helpService.getLocalStorage("countryCode") ||
      this.helpService.getLocalStorage("language") == undefined
    ) {
      this.demoAccountLanguage(data.language);
    } else {
      this.router.navigate(["/dashboard/home/task"]);
    }*/
  }

  checkDemoAccountLanguage() {
    this.service.getDemoAccountLanguage(this.superadmin).subscribe((res) => {
      if (res && res["length"] > 0) {
        const language = res[0]["language"];
        this.getTranslationByLanguage(language);
      } else {
        this.getTranslationByCountryCode(
          this.helpService.getLocalStorage("countryCode")
        );
      }
    });
  }

  /*demoAccountLanguage(language) {
    this.service
      .getDemoAccountLanguage(this.superadmin)
      .subscribe((demoAccount) => {
        if (language) {
          this.helpService.setLocalStorage("countryCode", language);
          this.getTranslationByLanguage(language);
        } else if (demoAccount && demoAccount["length"] > 0) {
          this.getTranslationByLanguage(demoAccount[0]["language"]);
          this.helpService.setLocalStorage(
            "countryCode",
            demoAccount[0]["language"]
          );
        } else {
          this.getTranslationByCountryCode("US");
        }
        if (demoAccount && demoAccount["length"] > 0) {
          this.helpService.setLocalStorage(
            "demoAccountLanguage",
            demoAccount[0]["language"]
          );
        } else {
          this.helpService.clearLocalStorage("demoAccountLanguage");
        }
      });
  }*/

  setUsersForConfiguration(data) {
    for (let i = 0; i < data.length; i++) {
      this.helpService.setLocalStorage(
        data[i].key,
        JSON.stringify(data[i].value)
      );
    }
  }

  createUserAccessDevice(event) {
    const data = {
      id: this.userAccessId,
      device_name: this.userAccessDevice,
    };
    this.service.updateUserAccessDevice(data).subscribe((data) => {
      this.userAccessForm = "";
      this.loginForm = "active";
      this.loginInfo = this.language.successUserAccessDeviceName;
    });
  }

  backToLanding() {
    this.router.navigate(["./"]);
  }
}
