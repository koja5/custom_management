import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getThemeConfig() {
    return this.http.get('../assets/configuration/theme-config.json')
      .map(res => res);
  }

  getLanguageConfig() {
    return this.http.get('../assets/configuration/language-config.json')
      .map(res => res);
  }

  getTranslation(language: string) {
    return this.http.get('../assets/configuration/translation/' + language + '.json')
      .map(res => res);
  }
}
