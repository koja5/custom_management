import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { UsersService } from '../../../service/users.service';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { StandardUrlSerializer } from '../../../standardUrlSerializer';
import { UrlTree, Router, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { throttleTime } from 'rxjs/operators';
import { UserModel } from '../../../models/user-model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild('user') user: Modal;
  public data = new UserModel();
  public userType = ['Employee', 'Manager', 'Admin'];
  public gridData: any;
  public currentLoadData: any;
  public state: State = {
    skip: 0,
    take: 5,
    filter: null
  };
  public hideShow = 'password';
  public hideShowEye = 'fa-eye-slash';
  public storeLocation: any;
  public sort: SortDescriptor[] = [
    {
      field: 'id',
      dir: 'asc'
    }
  ];
  public unamePattern = '^[a-z0-9_-]{8,15}$';
  public passwordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#])[A-Za-z\d$@$!%*?&].{8,}';
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  public loading = true;

  constructor(
    public service: UsersService,
    public storeService: StoreService,
    public url: StandardUrlSerializer,
    public router: Router
  ) { }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.service.getUsers(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      this.loading = false;
    });
  }

  newUser() {
    this.initializeParams();
    this.storeService.getStore(localStorage.getItem('idUser'), val => {
      console.log(val);
      this.storeLocation = val;
    });
    this.user.open();
  }

  initializeParams() {
    this.data.firstname = '';
    this.data.lastname = '';
    this.data.street = '';
    this.data.zipcode = '';
    this.data.place = '';
    this.data.telephone = '';
    this.data.mobile = '';
    this.data.birthday = '';
    this.data.incompanysince = '';
    this.data.active = 0;
  }

  createUser(form) {
    console.log(this.data);
    this.service.createUser(this.data, val => {
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
    } else if (event === 'Admin') {
      this.data.type = '1';
    } else {
      this.data.type = event;
    }
  }

  selectionChangeStore(event) {
    console.log(event);
    if (event !== undefined) {
      this.data.storeId = event.id;
    } else {
      this.data.storeId = event;
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
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
      data: this.currentLoadData.slice(
        this.state.skip,
        this.state.skip + this.state.take
      ),
      total: this.currentLoadData.length
    };
  }

  sortChangeData() {
    this.currentLoadData = {
      data: orderBy(this.currentLoadData, this.sort),
      total: this.currentLoadData.length
    };
  }

  hideShowPassword() {
    if (this.hideShow === 'password') {
      this.hideShow = 'text';
      this.hideShowEye = 'fa-eye';
    } else {
      this.hideShow = 'password';
      this.hideShowEye = 'fa-eye-slash';
    }
  }

  serializeUrl(root, queryParams) {
    const three = new UrlTree();
    three.root = root;
    three.queryParams = queryParams;
    console.log(three);

    console.log(this.url.serialize(three));
  }

  routing(id) {
    // this.router.navigate(['user-details'], {queryParams: id});
    const tree = new UrlTree();
    const url = new UrlSegment('/dashboard/user-details', id);
    tree.root = new UrlSegmentGroup([url], null);
    console.log(tree);
    return tree;
    console.log(this.url.serialize(tree));
  }
}
