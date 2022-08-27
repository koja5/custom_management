import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { ParameterItemComponent } from "src/app/component/dashboard/parameters/parameter-item/parameter-item.component";
import { FormGuardData } from "src/app/models/formGuard-data";

@Injectable()
export class FormGuard implements CanDeactivate<FormGuardData> {
  canDeactivate(
    component: FormGuardData,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (component.isFormDirty) {
      component.openConfirmModal();
      return component.isDataSaved$;
    } else {
      return true;
    }
  }
}
