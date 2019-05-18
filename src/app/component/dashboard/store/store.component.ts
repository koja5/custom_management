import { Component, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { StoreService } from '../../../service/store.service';
import { process, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  PageChangeEvent
} from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

  @ViewChild('store') store: Modal;
  public data = {
    'id': '',
    'storename': '',
    'street': '',
    'zipcode': '',
    'place': '',
    'email': '',
    'telephone': '',
    'mobile': '',
    'comment': '',
    'superadmin': ''
  };
  private currentLoadData: any;
  private gridData: any;
  public state: State = {
    skip: 0,
    take: 5,
    filter: null
  };
  private idUser: string;

  constructor(private service: StoreService) {

  }

  ngOnInit() {
    this.idUser = localStorage.getItem('idUser');
    this.service.getStore(this.idUser, (val) => {
      console.log(val);
      this.gridData = process(val, this.state);
      this.currentLoadData = this.gridData.data;
      console.log(this.gridData);
    });
  }

  newStore() {
    console.log(localStorage.getItem('idUser'));
    this.data = {
      'id': '',
      'storename': '',
      'street': '',
      'zipcode': '',
      'place': '',
      'email': '',
      'telephone': '',
      'mobile': '',
      'comment': '',
      'superadmin': this.idUser
    };
    this.store.open();
  }

  createStore(form) {
    console.log(this.data);
    this.service.createStore(this.data, (val) => {
      console.log(val);
      this.gridData.data.push(this.data);
      this.store.close();
      // form.reset();
    });

  }

}
