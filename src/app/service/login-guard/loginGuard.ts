import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { CookieService } from 'ng2-cookies';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(public _router: Router, public http: Http, public cookie: CookieService) { }

    /* Kada se bude menjao loginGuard, cookie.check("üser") proverava samo da li postoji,
    a cookie.get("user") da koji je tip usera. Ukoliko ne postoji cookie.get("user") vraca prazan string*/

    canActivate() {
        if (this.cookie.check('user') !== null && this.cookie.check('user') !== undefined) {
            console.log('usao sam ovde!');
            return true;
        } else {
            console.log('prosao sam!');
            this._router.navigate(['dashboard']);
            return false;
        }


    }

}
