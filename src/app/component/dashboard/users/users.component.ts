import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { UsersService } from '../../../service/users.service';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  @ViewChild('user') user: Modal;
  public data = {
    'id': '',
    'shortname': '',
    'password': '',
    'firstname': '',
    'lastname': '',
    'street': '',
    'zipcode': '',
    'place': '',
    'email': '',
    'telephone': '',
    'mobile': '',
    'birthday': '',
    'incompanysince': '',
    'type': '',
    'companyId': '',
    'active': 0
  };
  private userType = ['Employee', 'Manager', 'Admin'];
  private gridData: any;
  private currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 5,
    filter: null
  };
  private storeLocation: any;
  private sort: SortDescriptor[] = [{
    field: 'id',
    dir: 'asc'
  }];

  constructor(private service: UsersService, private storeService: StoreService) { }

  ngOnInit() {
    this.service.getUsers(localStorage.getItem('idUser'), (val) => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      console.log(this.gridData);
    })
  }

  newUser() {
    this.storeService.getStore(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.storeLocation = val;
    });
    this.data = {
      'id': '',
      'shortname': '',
      'password': '',
      'firstname': '',
      'lastname': '',
      'street': '',
      'zipcode': '',
      'place': '',
      'email': '',
      'telephone': '',
      'mobile': '',
      'birthday': '',
      'incompanysince': '',
      'type': '',
      'companyId': '',
      'active': 0
    };
    this.user.open();
  }

  createUser(form) {
    console.log(this.data);
    this.service.createUser(this.data, (val) => {
      console.log(val);
      this.gridData.data.push(this.data);
      this.user.close();
      // form.reset();
    });

  }

  selectionChange(event) {
    console.log(event);
    if (event === 'Employee') {
      this.data.type = '3';
    } else if (event === 'Manager') {
      this.data.type = '2';
    } else {
      this.data.type = '1';
    }
  }

  selectionChangeStore(event) {
    console.log(event);
    this.data.companyId = event.id;
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state)
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadProducts();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortChangeData();
}

  loadProducts(): void {
    this.gridData = {
        data: this.currentLoadData.slice(this.state.skip, this.state.skip + this.state.take),
        total: this.currentLoadData.length
    };

    console.log(this.gridData);
  }

  sortChangeData() {
    this.currentLoadData = {
      data:  orderBy(this.currentLoadData, this.sort),
      total: this.currentLoadData.length
    };
  }

}
