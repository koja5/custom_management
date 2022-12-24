import { CustomersService } from 'src/app/service/customers.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/service/message.service';

@Component({
  selector: 'app-massive-unsubscribe',
  templateUrl: './massive-unsubscribe.component.html',
  styleUrls: ['./massive-unsubscribe.component.scss']
})
export class MassiveUnsubscribeComponent implements OnInit {
  public language: any;
  public customerId: string;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private customerService: CustomersService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadLanguage();
    this.customerId = window.atob(this.activatedRoute.snapshot.paramMap.get('customerId'));
  }

  loadLanguage() {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
    } else {
      this.messageService.getLanguage().subscribe(() => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
        }, 10);
      });
    }
  }

  unsubscribeUser(): void {
    const obj = {
      "customerId": this.customerId,
      "value": 0
    };
    
    if(this.router.url.indexOf('unsubscribeSMS') !== -1){
      this.customerService.unsubscribeUserFromMassiveSMS(obj).subscribe((data) => {
        this.router.navigate(['/login']);
      });
    } else if(this.router.url.indexOf('unsubscribeEmail')!== -1){
      this.customerService.unsubscribeUserFromMassiveEmail(obj).subscribe((data) => {
        this.router.navigate(['/login']);
      });
    }
  }

  redirectUser(): void {
    this.router.navigate(['/login']);
  }
}

