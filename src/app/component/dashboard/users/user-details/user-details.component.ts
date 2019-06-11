import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../service/users.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  private id: string;
  private data: any;
  private imagePath: any;
  private userType = ['Employee', 'Manager', 'Admin'];
  private selectedValue: string;

  constructor(private route: ActivatedRoute, private service: UsersService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log(this.route.snapshot.params['id']);
    this.id = this.route.snapshot.params['id'];
    this.service.getUserWithId(this.id, (val) => {
      console.log(val);
      this.data = val[0];
      this.modelData();
      if(val[0].img.data.length !== 0) {
        const TYPED_ARRAY = new Uint8Array(val[0].img.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        let path = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base64String);
        console.log(path);
        this.imagePath = path;
      } else {
        this.imagePath = '../../../../../assets/images/users/defaultUser.png';
        console.log(this.imagePath);
      }
    });
  }

  updateUser(user) {

  }

  modelData() {
    this.data.birthday = new Date(this.data.birthday);
    this.data.incompanysince = new Date(this.data.incompanysince);
    if(this.data.type === 1) {
      this.selectedValue = 'Admin'
    } else  if(this.data.type === 2) {
      this.selectedValue = 'Manager';
    } else {
      this.selectedValue = 'Employee';
    }
  }

}
