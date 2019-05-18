import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { CookieService } from 'ng2-cookies';

@Injectable()
export class LoggedGuard implements CanActivate {

    constructor(public _router: Router, public http: Http, public cookie: CookieService) { }

    /* Kada se bude menjao loginGuard, cookie.check('üser') proverava samo da li postoji,
    a cookie.get('user') da koji je tip usera. Ukoliko ne postoji cookie.get('user') vraca prazan string*/

    canActivate() {
        if (!this.cookie.check('user')) {
            return true;
        } else {
            if (this.cookie.get('user') === '1') {
                 this._router.navigate(['/dashboard', {outlets: {'dash': ['admin']}}]);
                 console.log('Ja sam admin');
                 // ako je admin
            } else {
                console.log('ja sam obican user');
                 this._router.navigate(['user-main']);
                 // ako je obican korisnik
            }
            return false;
        }


    }

}
