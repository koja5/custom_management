import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';
import { StoreModel } from 'src/app/models/store-model';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {
  @ViewChild('store') store: Modal;
  @ViewChild('storeEdit') storeEdit: Modal;
  public data = new StoreModel();
  public currentLoadData: any;
  public gridData: any;
  public dialogOpened = false;
  public state: State = {
    skip: 0,
    take: 5,
    filter: null
  };
  public idUser: string;
  public loading = true;

  constructor(public service: StoreService) { }

  ngOnInit() {
    this.idUser = localStorage.getItem('idUser');
    this.getStore();
  }

  getStore() {
    this.service.getStore(this.idUser, val => {
      console.log(val);
      this.currentLoadData = val;
      this.gridData = process(val, this.state);
      this.loading = false;
    });
  }

  newStore() {
    this.initialParams();
    this.store.open();
  }

  initialParams() {
    this.data = {
      storename: '',
      street: '',
      zipcode: '',
      place: '',
      telephone: '',
      mobile: '',
      comment: '',
      superadmin: this.idUser
    };
  }

  createStore(form) {
    console.log(this.data);
    this.service.createStore(this.data, val => {
      console.log(val);
      this.data.id = val.id;
      this.gridData.data.push(this.data);
      this.store.close();
    });
  }

  updateStore(store) {
    console.log(this.data);
    this.service.editStore(this.data).subscribe(data => {
      console.log(data);
      if(data) {
        this.storeEdit.close();
      }
    });
  }

  deleteStore(store) { }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.currentLoadData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadProducts();
  }

  loadProducts(): void {
    this.gridData = {
      data: this.currentLoadData.slice(
        this.state.skip,
        this.state.skip + this.state.take
      ),
      total: this.currentLoadData.length
    };

    console.log(this.gridData);
  }

  editStore(store) {
    console.log(store);
    this.data = store;
    this.storeEdit.open();
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  open(component, id) {
    this[component + 'Opened'] = true;
    this.data.id = id;
  }

  action(event) {
    console.log(event);
    if (event === 'yes') {
      console.log(this.data);
      this.service.deleteStore(this.data.id).subscribe(data => {
        console.log(data);
        if (data) {
          this.state = {
            skip: 0,
            take: 5
          };
          this.getStore();
        }
        this.dialogOpened = false;
      });
    } else {
      this.dialogOpened = false;
    }
  }
}
