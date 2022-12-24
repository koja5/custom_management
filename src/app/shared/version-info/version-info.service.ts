import { Injectable } from '@angular/core';
import { LoginService } from 'src/app/service/login.service';

@Injectable({
  providedIn: 'root'
})
export class VersionInfoService {

  private _languageVersion:string;

  constructor(private loginService:LoginService) { }

  public get languageVersion():string{
    return this._languageVersion;
  }

  public setLanguageVersion() : Promise<void>{
    this._languageVersion =  localStorage.getItem("languageVersion");

    console.log('language version', this._languageVersion)
    return Promise.resolve();
  }

  public getVersion(item:string){

    return this.loginService.getTranslationByLanguage(item);
  }
}
