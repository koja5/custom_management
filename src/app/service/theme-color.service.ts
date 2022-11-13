import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const DEFAULT_THEME_COLOR = '#091467';

@Injectable({
  providedIn: 'root'
})
export class ThemeColorsService {
  
  constructor(private http: HttpClient) { }

  createThemeColors(data) {
    return this.http.post('/api/createThemeColors', data)
      .map(res => res);
  }

  updateThemeColors(data) {
    return this.http.post('/api/updateThemeColors', data)
      .map(res => res);
  }

  deleteThemeColors(id) {
    return this.http.get('/api/deleteThemeColors/' + id)
      .map(res => res);
  }

  getThemeColors(superadmin) {
    return this.http.get('/api/getThemeColors/' + superadmin)
      .map(res => res);
  }

  insertFromExcel(data) {
    return this.http.post('/api/insertFromExcel', data)
      .map(res => res);
  }

  setThemeColors(data) {
    if(data) {
      document.body.style.setProperty("--theme-color", data.color);
      document.body.style.setProperty("--header-color", data.color);
      document.body.style.setProperty("--sidebar-font-color", data.fontColor);
      document.body.style.setProperty("--sidebar-selected-color", data.selectedColor);
      document.body.style.setProperty("--sidebar-group-color", data.groupColor);
      document.body.style.setProperty("--navbar-background-color", data.navbarColor);
      document.body.style.setProperty("--navbar-font-color", data.navbarFontColor);
    }
  }

  resetThemeColors() {
    document.body.style.setProperty("--theme-color", DEFAULT_THEME_COLOR);
    document.body.style.setProperty("--header-color", DEFAULT_THEME_COLOR);
  }
}
