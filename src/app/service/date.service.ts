import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }


  public get currentDateFormatted(): string {
    const date = new Date().toLocaleDateString('en-GB');

    return this.formatDateWithDot(date);
  }


  public formatDate(value) {
    // console.log(value);
    let date: string;

    if (value.indexOf('/') != -1) {
      date = value.split('/')[0];

    } else if (value.indexOf(' ') != -1) {
      date = value.split(' ')[0];
    } else if (value.indexOf('T') != -1) { // 2022-03-29T06:00:00.000Z
      date = value.split('T')[0];

      // console.log(date.split("-").reverse().join("-"));
      date = date.split("-").reverse().join("-");
    } else {
      date = value.split("-").reverse().join("-");;
    }

    // console.log(date);
    return this.formatDateWithDot(date.trim());
  }

  private formatDateWithDot(str) {
    // Step 1. Use the split() method to return a new array
    var splitString;
    if (str.indexOf('.') != -1) {
      splitString = str.split(".");
    } else if (str.indexOf('-') != -1) {
      splitString = str.split("-");
    } else if (str.indexOf('/') != -1) {
      splitString = str.split("/");
    }

    // console.log(splitString);

    // Step 2. Use the reverse() method to reverse the new created array
    // var reverseArray = splitString.reverse();
    // console.log(reverseArray)

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = splitString.join(".");
    // console.log(joinArray)

    //Step 4. Return the reversed string
    return joinArray;
  }
}
