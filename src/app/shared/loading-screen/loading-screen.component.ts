import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MessageService } from 'src/app/service/message.service';
import { LoadingScreenService } from './loading-screen.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit, OnDestroy {

  public loading: boolean = false;
  public loadingSubscription: Subscription;
  public language: any;

  constructor(private loadingScreenService: LoadingScreenService,
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.initializationConfig();
    this.loadingSubscription = this.loadingScreenService.loadingStatus.pipe(
      debounceTime(100)
    ).subscribe((value) => {
      this.loading = value;
    });
  }

  public initializationConfig(): void {
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

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }
}
