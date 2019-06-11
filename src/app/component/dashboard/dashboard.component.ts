import { Component, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ng2-cookies';
import { Router } from '@angular/router';
import { Modal } from 'ngx-modal';
import { MessageService } from '../../service/message.service';
import { DashboardService } from '../../service/dashboard.service';
import { UsersService } from '../../service/users.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('settings') settings: Modal;
  private sidebar = '';
  private profile = '';
  private type: number;
  private theme: string;
  private languageName: string;
  private language: any;
  private allThemes: any;
  private allLanguage: any;
  private imagePath: any;

  constructor(private router: Router, private cookie: CookieService, private message: MessageService, private service: DashboardService, private users: UsersService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (localStorage.getItem('theme') !== null) {
      this.theme = localStorage.getItem('theme');
    } else {
      this.theme = 'theme1';
    }
    this.type = Number(localStorage.getItem('type'));

    if (localStorage.getItem('allThemes') !== undefined) {
      this.service.getThemeConfig().subscribe(
        data => {
          console.log(data);
          this.allThemes = data;
          localStorage.setItem('allThemes', JSON.stringify(this.allThemes));
        }
      );
    } else {
      this.allThemes = localStorage.getItem('allThemes');
    }

    if (localStorage.getItem('allLanguage') !== undefined) {
      this.service.getLanguageConfig().subscribe(
        data => {
          this.allLanguage = data;
          localStorage.setItem('allLangugage', JSON.stringify(this.allLanguage));
        }
      )
    } else {
      this.allLanguage = localStorage.getItem('allLanguage');
    }

    if (localStorage.getItem('language') !== null) {
      this.languageName = localStorage.getItem('language');
    } else {
      for (let i = 0; i < this.allLanguage.length; i++) {
        if (this.allLanguage[i].default) {
          this.languageName = this.allLanguage[i].name;
        }
      }
    }

    if (localStorage.getItem('translation') !== null) {
      this.language = JSON.parse(localStorage.getItem('translation'));
    } else {
      console.log('english!');
      this.service.getTranslation('english').subscribe(
        data => {
          console.log(data);
          this.language = data;
          localStorage.setItem('translation', JSON.stringify(this.language));
        }
      );
    }

    this.getMe();

    this.message.getImageProfile().subscribe(
      mess => {
        this.getMe();
      }
    )

  }

  getMe() {
    this.users.getMe(localStorage.getItem('idUser'), (val) => {
      console.log(val);
      if(val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base64String);
        console.log(path);
        this.imagePath = path;
      } else {
        this.imagePath = '../../../assets/images/users/defaultUser.png';
      }
    });
  }

  hideShowSidebar() {
    if (this.sidebar === '') {
      this.sidebar = 'enlarged';
    } else {
      this.sidebar = '';
    }
  }

  showHideProfile() {
    if (this.profile === '') {
      this.profile = 'show';
    } else {
      this.profile = '';
    }
  }

  logout() {
    this.cookie.deleteAll('/');
    this.cookie.deleteAll('/dashboard');
    this.router.navigate(['login']);
    console.log(this.cookie.get('user'));
  }

  changeTheme(name: string) {
    console.log(name);
    localStorage.setItem('theme', name);
    this.theme = name;
    this.message.sendTheme(name);
  }

  changeLanguage(name: string) {
    this.languageName = name;
    localStorage.setItem('language', name);
    this.language = undefined;
    this.service.getTranslation(this.languageName).subscribe(
      data => {
        this.language = data;
        localStorage.setItem('translation', JSON.stringify(this.language));
        this.message.sendLanguage();
      });
  }

}
