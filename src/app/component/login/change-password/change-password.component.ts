import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../../service/login.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public hideShow = 'password';
  public hideShowEye = 'fa-eye-slash';
  public loginForm = 'active';
  public loading = false;
  public errorInfo: string;
  public changeInfo: string;
  public mail;
  public passMatch;
  public data = {
    'email': '',
    'password': '',
    'password2': ''
  };

  constructor(public route: ActivatedRoute, public service: LoginService, public router: Router) { }

  ngOnInit() {
    console.log(this.route);
    this.mail = this.route.snapshot.params.id;
    this.passMatch = true;
    this.data.email = this.mail;
  }

  changePass() {
    const thisObj = this;
    if (thisObj.data.password !== thisObj.data.password2) {
      this.passMatch = false;
      this.errorInfo = 'The email is not the same';
    } else {
      this.service.changePass(this.data, function (res) {
        console.log(res);
        if (res.code === 'true') {
          this.changeInfo = res.message;
          setTimeout(() => {
            thisObj.router.navigate(['login']);
          }, 10);
        }
      });
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
