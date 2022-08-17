import { Component, Injectable, OnInit } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpProgressEvent,
  HttpEventType,
  HttpResponse,
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { of } from "rxjs/observable/of";
import { concat } from "rxjs/observable/concat";
import { delay } from "rxjs/operators/delay";
import { UsersService } from "./service/users.service";
import * as io from "socket.io-client";
import { HelpService } from "./service/help.service";
import { LoginService } from "./service/login.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "management-app-development";
}

@Injectable()
export class UploadInterceptor implements OnInit {
  socket;
  numberOfOnlineUsers: number;

  constructor(
    public service: UsersService,
    private helpService: HelpService,
    private loginService: LoginService
  ) {
    this.initializationLanguage();
    this.socket = io();
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(req);
    if (req.url === "uploadImage") {
      const events: Observable<HttpEvent<any>>[] = [0, 30, 60, 100].map((x) =>
        of(<HttpProgressEvent>{
          type: HttpEventType.UploadProgress,
          loaded: x,
          total: 100,
        }).pipe(delay(1000))
      );

      const success = of(new HttpResponse({ status: 200 })).pipe(delay(1000));
      events.push(success);

      return concat(...events);
    }

    if (req.url === "removeUrl") {
      return of(new HttpResponse({ status: 200 }));
    }

    return next.handle(req);
  }

  ngOnInit() {
    // this.socket.on('/', (numberOfOnlineUsers) => {
    //   this.numberOfOnlineUsers = numberOfOnlineUsers;
    //   console.log(this.numberOfOnlineUsers);
    // });
  }

  initializationLanguage() {
    this.loginService.checkCountryLocation().subscribe(
      (data: any) => {
        if (
          data.location.country.code !== this.helpService.getSelectionLanguage()
        ) {
          this.helpService.getAllLangs().subscribe((langs) => {
            this.setLanguageByLocation(data.location.country, langs);
          });
        }
      },
      (error: any) => {
        this.getLanguageByCode("english", "EN");
      }
    );
  }

  setLanguageByLocation(location: any, langs: any) {
    for (let i = 0; i < langs.length; i++) {
      for (let j = 0; j < langs[i].similarCode.length; j++) {
        if (langs[i].similarCode[j] === location.code) {
          this.getLanguageByCode(langs[i].name, location.code);
          break;
        }
      }
    }
  }

  getLanguageByCode(language: string, code: string) {
    this.helpService.getLanguageForLanding().subscribe((data) => {
      this.helpService.setLanguageForLanding(data);
      this.helpService.setSelectionLanguage(code);
    });
  }
}
