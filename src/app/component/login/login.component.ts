import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { MailService } from '../../service/mail.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ng2-cookies';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm = 'active';
  public signupForm: string;
  public recoverForm: string;
  public loading = false;
  public hideShow = 'password';
  public hideShowEye = 'fa-eye-slash';
  public loginInfo: string;
  public errorInfo: string;
  public emailValid = true;
  public language: any;

  public data = {
    'id': '',
    'shortname': '',
    'password': '',
    'street': '',
    'zipcode': '',
    'place': '',
    'email': '',
    'telephone': '',
    'mobile': '',
    'comment': ''
  };
  // public data: LoginData;

  constructor(public service: LoginService, public mailService: MailService, public cookie: CookieService, public router: Router, public dashboardService: DashboardService) { }

  ngOnInit() {
    if (localStorage.getItem('language') !== null) {
      this.language = JSON.parse(localStorage.getItem('language'))['login'];
    } else {
      console.log('english!');
      this.dashboardService.getTranslation('english').subscribe(
        data => {
          console.log(data);
          localStorage.setItem('translation', JSON.stringify(data));
          this.language = data['login'];
        }
      );
    }
  }

  signUpActive() {
    this.loginForm = '';
    this.recoverForm = '';
    this.signupForm = 'active';
  }

  loginActive() {
    this.signupForm = '';
    this.recoverForm = '';
    this.loginForm = 'active';
  }

  recoveryActive() {
    this.signupForm = '';
    this.loginForm = '';
    this.recoverForm = 'active';
  }

  login(form) {
    this.loading = true;
    const thisObject = this;
    this.service.login(this.data, (isLogin, notActive, user, type, id, storeId) => {
      console.log('login' + notActive);
      if (isLogin) {
        if (!notActive) {
          this.loginInfo = 'Check your mail and active account!';
        } else {
          console.log(user);
          this.cookie.set('user', type);
          localStorage.setItem('type', type);
          localStorage.setItem('idUser', id);
          localStorage.setItem('storeId', storeId);
          thisObject.router.navigate(['dashboard', { outlets: { 'dashboard': ['task'] } }]);
        }
        this.loading = false;
      } else {
        this.loginInfo = 'Username or password is not correct!';
        this.loading = false;
      }
    });
  }

  signUp(form) {
    console.log(this.data);
    this.errorInfo = '';
    this.loginInfo = '';
    if (this.data.email !== '' && this.data.shortname && this.data.password !== '') {
      this.service.signUp(this.data, (val) => {

        this.mailService.sendMail(this.data, function () {
          console.log('Mail uspesno poslat');
        });
        if (!val.success) {
          this.errorInfo = val.info;
        } else {
          this.loginInfo = 'Check your mail and active your account!';
          this.loginActive();
        }
        // form.reset();
      });
    } else {
      this.errorInfo = 'Fill in all fields!';
    }
  }

  forgotPassword() {
    console.log(this.data.email);
    const thisObject = this;
    if (this.data.email !== '') {
      this.service.forgotPassword(this.data, function (exist, notVerified) {
        if (exist) {
          thisObject.mailService.sendForgetMail(thisObject.data, function () {
          });
          // this.loginInfo = 'Link to recovery password is send on your mail!';
        }
        if (!exist) {
          thisObject.emailValid = false;
        }
      });
    } else {
      this.errorInfo = 'Fill in all fields!';
    }
  }

  hideShowPassword() {
    if (this.hideShow === 'password') {
      this.hideShow = 'text';
      this.hideShowEye = 'fa-eye'
    } else {
      this.hideShow = 'password';
      this.hideShowEye = 'fa-eye-slash';
    }
  }


}
