import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../service/login.service";
import { MailService } from "../../service/mail.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CookieService } from "ng2-cookies";
import { DashboardService } from "../../service/dashboard.service";
import { MongoService } from "../../service/mongo.service";

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
    public service: LoginService,
    public mailService: MailService,
    public cookie: CookieService,
    public router: Router,
    public dashboardService: DashboardService,
    public mongo: MongoService
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
        localStorage.setItem("language", JSON.stringify(data));
        this.language = data["login"];
      });*/
    }
  }

  initialization() {
    this.service.checkCountryLocation().subscribe(
      (data) => {
        this.service.getTranslationByCountryCode(data["countryCode"]).subscribe(
          (language) => {
            if (language !== null) {
              this.language = language["config"];
              localStorage.setItem("language", JSON.stringify(this.language));
            } else {
              this.service.getDefaultLanguage().subscribe(
                (language) => {
                  if (language !== null) {
                    this.language = language["config"];
                    localStorage.setItem(
                      "language",
                      JSON.stringify(this.language)
                    );
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
      },
      (error) => {
        console.log(error);
        this.service.getDefaultLanguage().subscribe((language) => {
          this.language = language["config"];
          localStorage.setItem("language", JSON.stringify(this.language));
        });
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
      (isLogin, notActive, user, type, id, storeId, superadmin) => {
        console.log("login" + notActive);
        if (isLogin) {
          if (!notActive) {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))[
              "checkMailForActive"
            ];
            this.loading = false;
          } else {
            console.log(user);
            this.cookie.set("user", type);
            localStorage.setItem("type", type);
            localStorage.setItem("idUser", id);
            localStorage.setItem("indicatorUser", id);
            localStorage.setItem("storeId-" + id, storeId);
            localStorage.setItem("superadmin", superadmin);
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
      this.router.navigate(["/dashboard/home/task"]);
      // this.loading = false;
    });
  }

  setConfiguration(data, id) {
    localStorage.setItem("theme", data.theme);
    localStorage.setItem("defaultLanguage", data.language);
    if (data.selectedStore !== null && data.selectedStore.length !== 0) {
      localStorage.setItem("selectedStore-" + id, data.selectedStore[0]);
    }
    if (data.usersFor !== null && data.usersFor.length !== 0) {
      this.setUsersForConfiguration(data.usersFor);
    }
  }

  setUsersForConfiguration(data) {
    for (let i = 0; i < data.length; i++) {
      localStorage.setItem(data[i].key, JSON.stringify(data[i].value));
    }
  }
}
