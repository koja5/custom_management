import { Injectable } from '@angular/core';
import { VersionInfoService } from '../version-info/version-info.service';

@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {

  private interval:any;

  constructor(private versionInfoService:VersionInfoService) { }

  public initializeVersionChecker():void{
    this.interval = setInterval(()=>{
      this.versionInfoService.getVersion(localStorage.getItem("languageName")).subscribe( data =>{
        if(data["timestamp"] > this.versionInfoService.languageVersion ){
          
          localStorage.setItem( "language", JSON.stringify(data["config"]));
          localStorage.setItem("languageVersion", data["timestamp"]);

          window.location.reload();
        }
      });
    }, 3600000)
    // 1 hour
  }

  public stopVersionChecker():void{
    clearInterval(this.interval);
  }
}
