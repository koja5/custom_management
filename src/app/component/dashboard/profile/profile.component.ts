import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../service/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public data: any;

  constructor(private service: UsersService) { }

  ngOnInit() {
    this.service.getMe(localStorage.getItem('idUser'), (val) => {
      console.log(val);
      this.data = val[0];
    })
  }

}
