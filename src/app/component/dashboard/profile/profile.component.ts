import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../../service/users.service';
import { Modal } from 'ngx-modal';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '../../../service/message.service';
import { UploadEvent, RemoveEvent } from '@progress/kendo-angular-upload';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  
  @ViewChild('user') user: Modal;
  public data: any;
  public companyData: any;
  public currentTab = 'profile';
  public imagePath: any;
  public uploadSaveUrl: string; // should represent an actual API endpoint
  public uploadRemoveUrl: string;
  
  constructor(private service: UsersService, private sanitizer: DomSanitizer, private message: MessageService) { }

  ngOnInit() {
    this.service.getMe(localStorage.getItem('idUser'), (val) => {
      console.log(val);
      this.data = val[0];
      if(val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base64String);
        console.log(path);
        this.imagePath = path;
      } else {
        this.imagePath = '../../../../assets/images/users/defaultUser.png';
      }
    });

    this.service.getCompany(localStorage.getItem('companyId'), val => {
      console.log(val);
      this.companyData = val[0];
    })
  }

  changeTab(value: string) {
    this.currentTab = value;
  }

  uploadEventHandler(event: UploadEvent) {
    console.log(event);
    const object = {
      'id': localStorage.getItem('idUser'),
      'img': event.files[0].name
    };
    console.log(object);
    this.service.uploadImage(object, (val) => {
      console.log(val);
      const TYPED_ARRAY = new Uint8Array(val.img.data);
      const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
      let base64String = btoa(STRING_CHAR);
      let path = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base64String);
      console.log(path);
      this.imagePath = path;
      this.message.sendImageProfile();
    });
  }

  removeEventHandler(event) {

  }
}
