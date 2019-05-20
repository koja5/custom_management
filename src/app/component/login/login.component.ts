import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { MailService } from '../../service/mail.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private loginForm = 'active';
  private signupForm: string;
  private recoverForm: string;
  private loading = false;
  private hideShow = 'password';
  private hideShowEye = 'fa-eye-slash';
  private loginInfo: string;
  private errorInfo: string;
  public emailValid = true;

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
  // private data: LoginData;

  constructor(private service: LoginService, private mailService: MailService, public cookie: CookieService, private router: Router) { }

  ngOnInit() {
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
    this.service.login(this.data, (isLogin, notActive, user, type, id, companyId) => {
      console.log('login' + notActive);
      if (isLogin) {
        if (!notActive) {
          this.loginInfo = 'Check your mail and active account!';
        } else {
          console.log(user);
          this.cookie.set('user', type);
          localStorage.setItem('type', type);
          localStorage.setItem('idUser', id);
          localStorage.setItem('companyId', companyId);
          thisObject.router.navigate(['dashboard', {outlets: {'dashboard': ['task']}}]);
        }
        this.loading = false;
      } else if (!isLogin) {
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
