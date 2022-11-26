import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { CookieService } from "ng2-cookies";
import { HelpService } from "../help.service";

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    public _router: Router,
    public cookie: CookieService,
    public helpService: HelpService) { }

  /* Kada se bude menjao loginGuard, cookie.check("üser") proverava samo da li postoji,
    a cookie.get("user") da koji je tip usera. Ukoliko ne postoji cookie.get("user") vraca prazan string*/

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem("idUser")) {
      return true;
    } else {
      console.log(window.location);
      this.helpService.setSessionStorage('defaultLink', state.url);
      this._router.navigate(["/login"]);
      return false;
    }
  }
}
