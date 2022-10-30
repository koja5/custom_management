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
  public email: string;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private customerService: CustomersService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadLanguage();
    this.email = this.activatedRoute.snapshot.paramMap.get('userEmail');
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
      "email": this.email,
      "value": 0
    };

    this.customerService.unsubscribeUserFromMassiveEmail(obj).subscribe((data) => {
      this.router.navigate(['/login']);
    });
  }

  redirectUser(): void {
    this.router.navigate(['/login']);
  }
}

