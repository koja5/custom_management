import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../service/login.service";
import { MailService } from "../../service/mail.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CookieService } from "ng2-cookies";
import { DashboardService } from "../../service/dashboard.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
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
    storeId: 0
  };
  // public data: LoginData;

  constructor(
    public service: LoginService,
    public mailService: MailService,
    public cookie: CookieService,
    public router: Router,
    public dashboardService: DashboardService
  ) { }

  ngOnInit() {
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"))["login"];
    } else {
      this.dashboardService.getTranslation("english").subscribe(data => {
        console.log(data);
        localStorage.setItem("language", JSON.stringify(data));
        this.language = data["login"];
      });
    }
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
    this.signupForm = "";
    this.recoverForm = "";
    this.loginForm = "active";
    this.forgotInfo = "Link to recovery password is send on your mail!";
  }*/

  recoveryActive() {
    this.signupForm = "";
    this.loginForm = "";
    this.recoverForm = "active";
  }

  login(form) {
    this.loading = true;
    const thisObject = this;
    this.service.login(
      this.data,
      (isLogin, notActive, user, type, id, storeId, superadmin) => {
        console.log("login" + notActive);
        if (isLogin) {
          if (!notActive) {
            this.loginInfo = JSON.parse(localStorage.getItem("language"))["login"]['checkMailForActive'];
          } else {
            console.log(user);
            this.cookie.set("user", type);
            localStorage.setItem("type", type);
            localStorage.setItem("idUser", id);
            localStorage.setItem("indicatorUser", id);
            localStorage.setItem("storeId-" + id, storeId);
            localStorage.setItem("superadmin", superadmin);
            thisObject.router.navigate([
              "dashboard",
              { outlets: { dashboard: ["task"] } }
            ]);
          }
          this.loading = false;
        } else {
          this.loginInfo = JSON.parse(localStorage.getItem("language"))["login"]['notCorrectPass'];
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
      this.service.signUp(this.data, val => {
        if (!val.success) {
          this.errorInfo = val.info;
        } else {
          this.mailService.sendMail(this.data, function () {
            console.log("Mail uspesno poslat");
          });
          this.signUpInfo = JSON.parse(localStorage.getItem("language"))["login"]['checkMailForActive'];
          setTimeout(() => {
            this.loginActive();
          }, 3000);
        }
        // form.reset();
      });
    } else {
      this.errorInfo = JSON.parse(localStorage.getItem("language"))["login"]['fillFields'];
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
              .subscribe(data => {
                console.log("test");
              });

            if (!exist) {
              thisObject.emailValid = false;
            } else {
              document.getElementById('textClass').innerHTML = JSON.parse(localStorage.getItem("language"))["login"]['sendForgotMail'];
            }
          }
        }, 100);
      });
    } else {
      this.errorInfo = JSON.parse(localStorage.getItem("language"))["login"]['fillFields'];
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
}
