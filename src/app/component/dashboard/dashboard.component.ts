import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ng2-cookies';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private sidebar = '';
  private profile = '';
  private type: number;

  constructor(private router: Router, private cookie: CookieService) { }

  ngOnInit() {
    this.type = Number(localStorage.getItem('type'));
  }
  
  hideShowSidebar() {
    if(this.sidebar === '') {
      this.sidebar = 'enlarged';
    } else {
      this.sidebar = '';
    }
  }

  showHideProfile() {
    if(this.profile === '') {
      this.profile = 'show';
    } else {
      this.profile = '';
    }
  }

  logout() {
    console.log('usao sam ovdeee!');
    this.router.navigate(['login']);
    this.cookie.deleteAll();
    console.log(this.cookie.get('user'));
  }

}
