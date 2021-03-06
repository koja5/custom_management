import { Component, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ng2-cookies';
import { Router, ActivatedRoute } from '@angular/router';
import { Modal } from 'ngx-modal';
import { MessageService } from '../../service/message.service';
import { DashboardService } from '../../service/dashboard.service';
import { UsersService } from '../../service/users.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationMenuModel } from '../../models/navigation-menu';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('settings') settings: Modal;
  public sidebar = '';
  public profile = '';
  public type: number;
  public theme: string;
  public languageName;
  public language: any;
  public allThemes: any;
  public allLanguage: any;
  public imagePath: any;
  public selectedNode = 'calendar';
  public selectedNodeModel = new NavigationMenuModel();

  constructor(
    public router: Router,
    public cookie: CookieService,
    public message: MessageService,
    public service: DashboardService,
    public users: UsersService,
    public sanitizer: DomSanitizer,
    public activatedRouter: ActivatedRoute
  ) { }

  ngOnInit() {

    console.log(this.activatedRouter.snapshot['_routerState'].url.split('/')[2]);

    this.selectedNode = this.activatedRouter.snapshot['_routerState'].url.split('/')[2];

    this.selectedNodeModel[this.selectedNode] = 'active';

    if (localStorage.getItem('theme') !== null) {
      this.theme = localStorage.getItem('theme');
    } else {
      this.theme = 'Theme2';
      localStorage.setItem('theme', this.theme);
    }
    this.type = Number(localStorage.getItem('type'));

    if (localStorage.getItem('allThemes') !== undefined) {
      this.service.getThemeConfig().subscribe(data => {
        console.log(data);
        this.allThemes = data;
        localStorage.setItem('allThemes', JSON.stringify(this.allThemes));
      });
    } else {
      this.allThemes = localStorage.getItem('allThemes');
    }

    if (localStorage.getItem('allLanguage') === null) {
      this.service.getLanguageConfig().subscribe(data => {
        this.allLanguage = data;
        localStorage.setItem('allLanguage', JSON.stringify(this.allLanguage));
      });
    } else {
      this.allLanguage = JSON.parse(localStorage.getItem('allLanguage'));
    }

    // defined default language
    setTimeout(() => {
      if (localStorage.getItem('defaultLanguage') !== null) {
        console.log('usao sam ovde!');
        this.languageName = localStorage.getItem('defaultLanguage');
      } else {
        console.log(this.allLanguage);
        for (let i = 0; i < this.allLanguage.length; i++) {
          if (this.allLanguage[i].default) {
            this.languageName = this.allLanguage[i].name;
            localStorage.setItem('defaultLanguage', this.languageName);
            console.log(this.languageName);
          }
        }
      }
    }, 500);

    if (localStorage.getItem('language') !== null) {
      this.language = JSON.parse(localStorage.getItem('language'));
    } else {
      console.log('english!');
      this.service.getTranslation('english').subscribe(data => {
        console.log(data);
        this.language = data;
        localStorage.setItem('language', JSON.stringify(this.language));
      });
    }

    this.getMe();

    this.message.getImageProfile().subscribe(mess => {
      this.getMe();
    });
  }

  getMe() {
    this.users.getMe(localStorage.getItem('idUser'), val => {
      console.log(val);
      if (val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        const base64String = btoa(STRING_CHAR);
        const path = this.sanitizer.bypassSecurityTrustUrl(
          'data:image/png;base64,' + base64String
        );
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
    sessionStorage.clear();
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
    this.service.getTranslation(this.languageName).subscribe(data => {
      this.language = data;
      localStorage.setItem('language', JSON.stringify(this.language));
      this.message.sendLanguage();
    });
  }

  returnActiveNode(node) {
    this.selectedNodeModel[this.selectedNode] = '';
    this.selectedNode = node;
    this.selectedNodeModel[this.selectedNode] = 'active';
  }
}
