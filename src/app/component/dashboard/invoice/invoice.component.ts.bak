import { ParameterItemService } from "src/app/service/parameter-item.service";
import { Component, HostListener, OnInit } from "@angular/core";
import { CustomerModel } from "src/app/models/customer-model";
import { CustomersService } from "src/app/service/customers.service";
import { DateRangeService } from "@progress/kendo-angular-dateinputs";
import { FormGroup } from "@angular/forms";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { HelpService } from "src/app/service/help.service";
import { MessageService } from "src/app/service/message.service";
import { PDFService } from "./../../../service/pdf.service";
import { saveAs } from "file-saver";
import { SortDescriptor, State, process } from "@progress/kendo-data-query";
import { StoreModel } from "src/app/models/store-model";
import { StoreService } from "src/app/service/store.service";
import { TaskService } from "src/app/service/task.service";
import { UserModel } from "src/app/models/user-model";
import { UserType } from "../../enum/user-type";
import Docxtemplater from "docxtemplater";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-invoice",
  providers: [DateRangeService],
  templateUrl: "./invoice.component.html",
  styleUrls: ["./invoice.component.scss"],
})
export class InvoiceComponent implements OnInit {
  isDateSet: boolean;

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.displayToolbar) {
      this.height = 75;
    } else {
      this.height = 95;
    }
  }

  private invoiceID: number;
  private height: number;
  public currentLoadData: any[] = [];
  public customerLoading = false;
  public customerUser: CustomerModel;
  public customerUsers: CustomerModel[] = [];
  public data = new UserModel();
  public displayToolbar = true;
  public formGroup: FormGroup;
  public gridViewData: GridDataResult;
  public isAllChecked = false;
  public language: any;
  public loading = false;
  public loggedInUserId: number;
  public range = { start: null, end: null };
  public selectedItemIDs = [];
  public selectedTherapies: any;
  public store: StoreModel;
  public superadmin: string;
  public therapyValue: any;
  public type: UserType;
  public userType = UserType;
  public vatTaxList;

  public pageSize = 10;
  public state: State = {
    skip: 0,
    take: this.pageSize,
    filter: null,
    sort: [
      {
        field: "sequence",
        dir: "asc",
      },
    ],
  };

  public get noDataSelected(): boolean {
    return !this.customerUser;
  }

  public get isWordOrPDFEnabled(): boolean {
    return this.selectedItemIDs.length > 0;
  }

  public get gridHeight(): number {
    if (this.displayToolbar) {
      this.height = 75;
    } else {
      this.height = 95;
    }

    return this.height;
  }
  constructor(
    private helpService: HelpService,
    private customerService: CustomersService,
    private messageService: MessageService,
    private storeService: StoreService,
    private taskService: TaskService,
    private parameterItemService: ParameterItemService,
    private pdfService: PDFService
  ) {}

  ngOnInit() {
    this.initializationConfig();
    this.initializationData();

    this.helpService.setDefaultBrowserTabTitle();
    this.invoiceID = Math.ceil(Math.random() * 10000);
  }

  public initializationConfig(): void {
    if (localStorage.getItem("language") !== undefined) {
      this.language = JSON.parse(localStorage.getItem("language"));
    } else {
      this.messageService.getLanguage().subscribe(() => {
        this.language = undefined;
        setTimeout(() => {
          this.language = JSON.parse(localStorage.getItem("language"));
        }, 10);
      });
    }
  }

  public initializationData(): void {
    this.type = this.helpService.getType();
    this.loggedInUserId = this.helpService.getMe();
    this.superadmin = this.helpService.getSuperadmin();

    this.getParameters();
  }

  public getParameters(): void {
    this.customerService
      .getParameters("Therapy", this.superadmin)
      .subscribe((data: []) => {
        this.therapyValue = data.sort(function (a, b) {
          return a["sequence"] - b["sequence"];
        });
      });

    this.parameterItemService.getVATTex(this.superadmin).subscribe((data: []) => {
      this.vatTaxList = data;
      // console.log(data);
    });
  }

  public searchCustomer(event): void {
    if (event !== "" && event.length > 2) {
      this.customerLoading = true;

      const searchFilter = {
        superadmin: this.superadmin,
        filter: event,
      };

      this.customerService.searchCustomer(searchFilter).subscribe((val: []) => {
        this.customerUsers = val.sort((a, b) =>
          String(a["shortname"]).localeCompare(String(b["shortname"]))
        );
        this.customerLoading = false;
      });
    } else {
      this.customerUsers = [];
    }
  }

  public onValueChange(event: CustomerModel): void {
    if (event !== undefined) {
      this.customerUser = event;
    }
  }

  public selectAll(): void {
    this.isAllChecked = !this.isAllChecked;
    this.selectedItemIDs = [];

    if (this.isAllChecked) {
      this.selectedItemIDs = this.currentLoadData.map((elem) => elem.taskId);
    }

    this.currentLoadData.forEach((elem) => {
      elem.checked = this.isAllChecked;
    });
  }

  public setSelectedItem(dataItem): void {
    if (dataItem.checked) {
      let index: number = this.selectedItemIDs.indexOf(dataItem.taskId);
      if (index !== -1) {
        this.selectedItemIDs.splice(index, 1);
      }
    } else {
      this.selectedItemIDs.push(dataItem.taskId);
    }

    dataItem.checked = !dataItem.checked;
    this.currentLoadData.every((elem) => elem.checked === true)
      ? (this.isAllChecked = true)
      : (this.isAllChecked = false);
  }

  public showFilterPanel(): void {
    this.displayToolbar = !this.displayToolbar;
  }

  public openFilterPanel(): void {
    if (!this.displayToolbar) {
      this.displayToolbar = true;
    }
  }

  public getDataForMassiveInvoice(): void {
    const patientId = this.customerUser.id;
    this.loading = true;

    this.taskService.getDataForMassiveInvoice(patientId).then((data) => {
      // console.log('getDataForMassiveInvoice : ', data);
      this.currentLoadData = [];

      if (this.range.start && this.range.end) {
        data.forEach((element) => {
          const startDate = this.range.start.getTime();
          const endDate = this.range.end.getTime();
          const start = element.start;
          const end = element.end;

          element.start = new Date(start);
          element.end = new Date(end);

          element.checked = false;

          if (
            element.start.getTime() >= startDate &&
            element.end.getTime() <= endDate
          ) {
            this.currentLoadData.push(element);
          }
        });
      } else {
        data.forEach((elem) => {
          elem.checked = false;
        });
        this.currentLoadData = data;
      }

      if (this.currentLoadData.length > 0) {
        this.storeService
          .getStoreById(this.currentLoadData[0].storeId)
          .then((data) => {
            // console.log(data);
            this.store = data[0];
          });
      }

      this.gridViewData = process(this.currentLoadData, this.state);
      this.loading = false;
    });
  }

  public get isCheckBoxDisabled(): boolean {
    return this.currentLoadData.length === 0 || this.loading;
  }

  public pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.state.take = event.take;
    this.pageSize = event.take;
    this.gridViewData = process(this.currentLoadData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridViewData = process(this.currentLoadData, this.state);
  }

  public filter(): void {
    if (this.noDataSelected) {
      return;
    }

    this.state = {
      skip: 0,
      take: this.pageSize,
      filter: null,
      sort: [
        {
          field: "sequence",
          dir: "asc",
        },
      ],
    };

    this.getDataForMassiveInvoice();
  }

  public downloadPDF(): void {
    const docDefinition = this.setupPDF();

    // pass file name
    pdfMake
      .createPdf(docDefinition)
      .download(this.customerUser["firstname"] + this.customerUser["lastname"]);
  }

  public printPDF(): void {
    const docDefinition = this.setupPDF();
    pdfMake.createPdf(docDefinition).print();
  }

  private setupPDF() {
    const dotSign = " • ";
    const data = this.getTherapyAndPricesData();

    const therapies = data.therapies;
    const netPrices = data.netPrices.filter(num => !isNaN(parseFloat(num)));
    const brutoPrices = data.brutoPrices.filter(num => !isNaN(parseFloat(num)));

    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    let docDefinition = {
      content: [
        // Header
        {
          columns: [
            // {
            //   image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABkCAYAAABkW8nwAAAKQWlDQ1BJQ0MgUHJvZmlsZQAASA2dlndUU9kWh8+9N73QEiIgJfQaegkg0jtIFQRRiUmAUAKGhCZ2RAVGFBEpVmRUwAFHhyJjRRQLg4Ji1wnyEFDGwVFEReXdjGsJ7601896a/cdZ39nnt9fZZ+9917oAUPyCBMJ0WAGANKFYFO7rwVwSE8vE9wIYEAEOWAHA4WZmBEf4RALU/L09mZmoSMaz9u4ugGS72yy/UCZz1v9/kSI3QyQGAApF1TY8fiYX5QKUU7PFGTL/BMr0lSkyhjEyFqEJoqwi48SvbPan5iu7yZiXJuShGlnOGbw0noy7UN6aJeGjjAShXJgl4GejfAdlvVRJmgDl9yjT0/icTAAwFJlfzOcmoWyJMkUUGe6J8gIACJTEObxyDov5OWieAHimZ+SKBIlJYqYR15hp5ejIZvrxs1P5YjErlMNN4Yh4TM/0tAyOMBeAr2+WRQElWW2ZaJHtrRzt7VnW5mj5v9nfHn5T/T3IevtV8Sbsz55BjJ5Z32zsrC+9FgD2JFqbHbO+lVUAtG0GQOXhrE/vIADyBQC03pzzHoZsXpLE4gwnC4vs7GxzAZ9rLivoN/ufgm/Kv4Y595nL7vtWO6YXP4EjSRUzZUXlpqemS0TMzAwOl89k/fcQ/+PAOWnNycMsnJ/AF/GF6FVR6JQJhIlou4U8gViQLmQKhH/V4X8YNicHGX6daxRodV8AfYU5ULhJB8hvPQBDIwMkbj96An3rWxAxCsi+vGitka9zjzJ6/uf6Hwtcim7hTEEiU+b2DI9kciWiLBmj34RswQISkAd0oAo0gS4wAixgDRyAM3AD3iAAhIBIEAOWAy5IAmlABLJBPtgACkEx2AF2g2pwANSBetAEToI2cAZcBFfADXALDIBHQAqGwUswAd6BaQiC8BAVokGqkBakD5lC1hAbWgh5Q0FQOBQDxUOJkBCSQPnQJqgYKoOqoUNQPfQjdBq6CF2D+qAH0CA0Bv0BfYQRmALTYQ3YALaA2bA7HAhHwsvgRHgVnAcXwNvhSrgWPg63whfhG/AALIVfwpMIQMgIA9FGWAgb8URCkFgkAREha5EipAKpRZqQDqQbuY1IkXHkAwaHoWGYGBbGGeOHWYzhYlZh1mJKMNWYY5hWTBfmNmYQM4H5gqVi1bGmWCesP3YJNhGbjS3EVmCPYFuwl7ED2GHsOxwOx8AZ4hxwfrgYXDJuNa4Etw/XjLuA68MN4SbxeLwq3hTvgg/Bc/BifCG+Cn8cfx7fjx/GvyeQCVoEa4IPIZYgJGwkVBAaCOcI/YQRwjRRgahPdCKGEHnEXGIpsY7YQbxJHCZOkxRJhiQXUiQpmbSBVElqIl0mPSa9IZPJOmRHchhZQF5PriSfIF8lD5I/UJQoJhRPShxFQtlOOUq5QHlAeUOlUg2obtRYqpi6nVpPvUR9Sn0vR5Mzl/OX48mtk6uRa5Xrl3slT5TXl3eXXy6fJ18hf0r+pvy4AlHBQMFTgaOwVqFG4bTCPYVJRZqilWKIYppiiWKD4jXFUSW8koGStxJPqUDpsNIlpSEaQtOledK4tE20Otpl2jAdRzek+9OT6cX0H+i99AllJWVb5SjlHOUa5bPKUgbCMGD4M1IZpYyTjLuMj/M05rnP48/bNq9pXv+8KZX5Km4qfJUilWaVAZWPqkxVb9UU1Z2qbapP1DBqJmphatlq+9Uuq43Pp893ns+dXzT/5PyH6rC6iXq4+mr1w+o96pMamhq+GhkaVRqXNMY1GZpumsma5ZrnNMe0aFoLtQRa5VrntV4wlZnuzFRmJbOLOaGtru2nLdE+pN2rPa1jqLNYZ6NOs84TXZIuWzdBt1y3U3dCT0svWC9fr1HvoT5Rn62fpL9Hv1t/ysDQINpgi0GbwaihiqG/YZ5ho+FjI6qRq9Eqo1qjO8Y4Y7ZxivE+41smsImdSZJJjclNU9jU3lRgus+0zwxr5mgmNKs1u8eisNxZWaxG1qA5wzzIfKN5m/krCz2LWIudFt0WXyztLFMt6ywfWSlZBVhttOqw+sPaxJprXWN9x4Zq42Ozzqbd5rWtqS3fdr/tfTuaXbDdFrtOu8/2DvYi+yb7MQc9h3iHvQ732HR2KLuEfdUR6+jhuM7xjOMHJ3snsdNJp9+dWc4pzg3OowsMF/AX1C0YctFx4bgccpEuZC6MX3hwodRV25XjWuv6zE3Xjed2xG3E3dg92f24+ysPSw+RR4vHlKeT5xrPC16Il69XkVevt5L3Yu9q76c+Oj6JPo0+E752vqt9L/hh/QL9dvrd89fw5/rX+08EOASsCegKpARGBFYHPgsyCRIFdQTDwQHBu4IfL9JfJFzUFgJC/EN2hTwJNQxdFfpzGC4sNKwm7Hm4VXh+eHcELWJFREPEu0iPyNLIR4uNFksWd0bJR8VF1UdNRXtFl0VLl1gsWbPkRoxajCCmPRYfGxV7JHZyqffS3UuH4+ziCuPuLjNclrPs2nK15anLz66QX8FZcSoeGx8d3xD/iRPCqeVMrvRfuXflBNeTu4f7kufGK+eN8V34ZfyRBJeEsoTRRJfEXYljSa5JFUnjAk9BteB1sl/ygeSplJCUoykzqdGpzWmEtPi000IlYYqwK10zPSe9L8M0ozBDuspp1e5VE6JA0ZFMKHNZZruYjv5M9UiMJJslg1kLs2qy3mdHZZ/KUcwR5vTkmuRuyx3J88n7fjVmNXd1Z752/ob8wTXuaw6thdauXNu5Tnddwbrh9b7rj20gbUjZ8MtGy41lG99uit7UUaBRsL5gaLPv5sZCuUJR4b0tzlsObMVsFWzt3WazrWrblyJe0fViy+KK4k8l3JLr31l9V/ndzPaE7b2l9qX7d+B2CHfc3em681iZYlle2dCu4F2t5czyovK3u1fsvlZhW3FgD2mPZI+0MqiyvUqvakfVp+qk6oEaj5rmvep7t+2d2sfb17/fbX/TAY0DxQc+HhQcvH/I91BrrUFtxWHc4azDz+ui6rq/Z39ff0TtSPGRz0eFR6XHwo911TvU1zeoN5Q2wo2SxrHjccdv/eD1Q3sTq+lQM6O5+AQ4ITnx4sf4H++eDDzZeYp9qukn/Z/2ttBailqh1tzWibakNml7THvf6YDTnR3OHS0/m/989Iz2mZqzymdLz5HOFZybOZ93fvJCxoXxi4kXhzpXdD66tOTSna6wrt7LgZevXvG5cqnbvfv8VZerZ645XTt9nX297Yb9jdYeu56WX+x+aem172296XCz/ZbjrY6+BX3n+l37L972un3ljv+dGwOLBvruLr57/17cPel93v3RB6kPXj/Mejj9aP1j7OOiJwpPKp6qP6391fjXZqm99Oyg12DPs4hnj4a4Qy//lfmvT8MFz6nPK0a0RupHrUfPjPmM3Xqx9MXwy4yX0+OFvyn+tveV0auffnf7vWdiycTwa9HrmT9K3qi+OfrW9m3nZOjk03dp76anit6rvj/2gf2h+2P0x5Hp7E/4T5WfjT93fAn88ngmbWbm3/eE8/syOll+AAAIwUlEQVR4Ae2bZ28UOxSGHXrvvXcQ4iP8/z8QiQ+AQCBBqKH33gLPoLN61zu7m2zGm+N7jyWYsX3sOeUZt9nMzM7OLqRI4YGOPbCq4/6iu/BA44EAK0Ao4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9MAKxgo4oEAq4hbo9P/BVg/fvxIv3//riraCwsL6fv37xPrvNI2r5lY80U2/PXrV7p27dqA9K5du9KxY8cGyrXgyZMn6fnz51rUd3/48OG0d+/evjLLEJhHjx6lt2/fpi9fvqSZmZm0ZcuWdODAgbRz504TK3J9/PhxevHixUDfFy9eTOvWrRso14IPHz6kp0+fpnfv3jUvA/Lbt29vfLV69WoVHbhfSZtzZYqDxQPb3ryfP3/mugzkP3/+3NrWBEeNQg8ePEjPnj0z0YTTCdrHjx/T+fPn07Zt23p1Xd/wMrXZjA6j0rdv39Lt27cT7S3RD5ByPXfuXPOCWF1+XUmbc12mMhUyWvBvqaktOIvp4/Xr131Q6ZtOcAkeU0XJtFSb0evOnTt9UKnejGCMwMOSB5tVt+IjFs65cuVK88y5ubmRU5sqxj1vMIkgXb58ubnX/4bBOj8/3xNjGjlz5kzT140bN5qRi5Hu1atXzbTYE+zwhimef8B79erVRfUMOIzQli5cuNBM3ffu3Wt0pZyRi+l/1arB8WClbTa97TqoodWs8JXg26jCOsNGAL22qUibT58+9aoIBHBv2rQpsa6zxNrLU1J9eBmYqgEI/S2xfFDbrNyjzW7B0mlw/fr15sOxV3U8QLFgt0TALKmcla3kVfVRPTds2JDUfpUzfbXMi83/ObDYAVoiKJo0P2yBjTzrnWEL7WHl+pxJ7hert8rZc7RMbaRe86Nstr66uroFy9ZXGKpv7DjDbfpEbu3atX3ieV5HRRMEHNaCd+/eHYAL+evXrzdHGCbfxZWA6w4311PzbTov1+YubMj7cAuWOnBSsJgWNOV5DYjJsWVnkcziXuFCn5s3bzZnYuze3r9/b02Wfc31yPXUfC7Lw7VMZanL8ypLfalUfFc4qeI6YrHj4Qxq48aNaceOHSNHMD0fy3dPuZP1vMj0pH8OZRm5gIt05MiRdOvWrd4ulekFXbpKqjN9jtI7l0Vey0a1RbbNZsq7Tm7B0hGLbbhtxR8+fJiOHz8+9MRdp5TcyfnxhMqaY1k4cxDJWZfBxRmRra0AiqMAnZ6s7aRX69vaj9I7l6WN2jGqbS5rzytxdTsVMmIBQu4onMjZTtsnExzU5nh1nMI1TNbgMlmTKwEVuikY5O253JM0b7r8q/n3f1uZ1o9rr7Jd3bsdsRgV7LsakPHd8OXLlz27+R63e/fuAfDUyerQXkO5yQMqVc1Ux6ikIydnYWvWdO8y1Vl1sHu1o01nba+y1l6vbe21vqt7tyMWC3acxD/WNKdOneqb/gj4mzdvBvygjlWHDwj+LVBZradv1lQKFfX5gl7bLOd+mB7Wp9rRJqtlKmvt9aqyWt71vVuw2gw9dOhQX7Ge31jFOMep49tkDaqvX782XTL9AbXJloDL+jYbVEfKNJ/LUt9WRrmlce1NrstrVWAxiunOTneO5hRdk6lDqc/zKmvtOW5QqJiS9+zZk86ePdsLIHC1jZbWx1KvuR65nprPZXmWlqksdXleZakvlaoCCyfYuot73WaTJyl4+dY6X1+o7L/WKZ04caL5rpgv1DmGMLgOHjzY993R2k56zfXI9dR8LssztWwSmyfVe1S77leio57WQZ06TiGzrvUYQGWpz/Mqa+1ZnDNK8abn9cB16dKlTs+weG7+nFxPzeeyeXuVpS7Pt7VHrutUFVgEW0+Ox4GVj2jaFke2tad81M6PkazrxPNYJ9m0leup+TadFZZJbe7apqqmQk7fzfk4ou1TjwY+X4NpnrVGW5C6dvBi+1us3ipnfWuZ2ki95qdpc1Vg8VtwS7zhbT8v5qzJEm+6LcQpA0xLyI3bTZnsNK6qt+qZ26ByppeW5fLa1zRtdgkWzuBk3RatrBPu37/f96sCdmptIw6jmL7BBiNThB6wsl7ylFQfPiHZGZp9t0RXRpytW7cOqO3RZpdrLLbzOHTu789XgAcn6xSIZ9mZDUv79+9v2lJPP/wQjinBFrIEiFN7Twmw1Fb+sokRRkcc/iIJ3duSN5vbtWzTfIpl9jNdYAIIhYqtNR+J9QdsuWr79u3rAwewdFF7+vTp1vVZ3s808wCDXQYOL4FCtXnz5nT06NGhKnmz2d2IBUQ4iakwX3jyM2N+2aBT3TBPnzx5sllDAalBBYy82aX/rnCYTuPKGaGAnu+i9nNjQGMtyfmaQTesH082z8zOzo7+Y7dhVkyhnCkQuNiOA8Uki21A5Sc3bMnb1mRTMGOiR/AysPEAtnFA5Q/wYLO7EUudBAjLhQEYmUZqS7xM+ocgS9Hfg80u11hLcWLI+vRAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVYBVvUh9GlAgOUzLtVrFWBVH0KfBgRYPuNSvVZ/AAbP9rbguAtlAAAAAElFTkSuQmCC',
            //   width: 150
            // },

            [
              {
                text: this.language.invoiceTitle,
                style: "invoiceTitle",
                width: "*",
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: this.language.invoiceSubTitle,
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: this.invoiceID,
                        style: "invoiceSubValue",
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: this.language.dateTitle,
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: this.currentDateFormatted,
                        style: "invoiceSubValue",
                        width: 130,
                      },
                    ],
                  },

                  {
                    columns: [
                      {
                        text: "\n",
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: "\n",
                        style: "invoiceSubValue",
                        width: "*",
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        // Billing Headers
        {
          columns: [
            {
              text: this.language.invoiceBillingTitleFrom + "\n \n",
              style: "invoiceBillingTitleLeft",
            },
            {
              text: this.language.invoiceBillingTitleTo + "\n \n",
              style: "invoiceBillingTitleRight",
            },
          ],
        },
        // Billing Details
        {
          columns: [
            {
              text: this.store.storename,
              style: "invoiceBillingDetailsLeft",
            },
            {
              text: this.customerUser.lastname + this.customerUser.firstname,
              style: "invoiceBillingDetailsRight",
            },
          ],
        },
        // Billing Address
        {
          columns: [
            {
              text:
                this.store.street +
                "\n " +
                this.store.zipcode +
                " " +
                this.store.place,
              style: "invoiceBillingAddressLeft",
            },
            {
              text:
                this.customerUser["street"] +
                " " +
                this.customerUser["streetnumber"] +
                "\n" +
                this.customerUser["city"] +
                "\n",
              style: "invoiceBillingAddressRight",
            },
          ],
        },
        // Line breaks
        "\n\n",
        // Items
        {
          layout: {
            // code from lightHorizontalLines:
            hLineWidth: function (i, node) {
              if (i === 0) {
                return 0;
              }
              return i === node.table.headerRows ? 2 : 1;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i) {
              return "black";
            },
            paddingLeft: function (i) {
              return i === 0 ? 0 : 8;
            },
            paddingRight: function (i, node) {
              return i === node.table.widths.length - 1 ? 0 : 8;
            },
            // // code for zebra style:
            // fillColor: function (i) {
            //   return i % 2 === 0 ? "#CCCCCC" : null;
            // },
          },
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ["*", "*", "auto", "auto", "auto"],

            body: this.pdfService.createItemsTable(therapies),
          }, // table
          //  layout: 'lightHorizontalLines'
        },
        // Line break
        "\n",
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ["*", 80],

            body: [
              // Total
              [
                {
                  text: this.language.invoiceSubtotal,
                  style: "itemsFooterSubTitle",
                },
                {
                  text: netPrices.length === 0 ? this.language.noDataAvailable : (this.language.euroSign + " " + subtotal),
                  style: "itemsFooterSubValue",
                },
              ],
              [
                {
                  text: this.language.invoiceTotal,
                  style: "itemsFooterTotalTitle",
                },
                {
                  text: brutoPrices.length === 0 ? this.language.noDataAvailable : (this.language.euroSign + " " + total),
                  style: "itemsFooterTotalValue",
                },
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },
        // {
        //   text: this.language.notesTitle,
        //   style: 'notesTitle'
        // },
        // {
        //   text: this.language.notesText,
        //   style: 'notesTextBold'
        // },
        // {
        //   text: "\n \n",
        //   style: 'notesText'
        // },
        // {
        //   text: this.language.notesDate + new Date().toLocaleDateString() + ", " + this.store.storename,
        //   style: 'notesTextBold'
        // }
      ],
      footer: {
        columns: [
          {
            text:
              this.store.storename +
              dotSign +
              this.store.street +
              dotSign +
              this.store.zipcode +
              " " +
              this.store.place +
              "\n" +
              this.store.telephone +
              dotSign +
              this.store.email,
            style: "documentFooter",
          },
        ],
      },
      styles: this.pdfService.getStyles(),
      defaultStyle: {
        columnGap: 20,
      },
    };

    return docDefinition;
  }

  private getTherapyAndPricesData() {
    const therapies = [];
    const netPrices = [];
    const brutoPrices = [];
    let selectedTherapies = [];
    let bruto = 0;

    this.currentLoadData.forEach((element) => {
      if (this.selectedItemIDs.indexOf(element.taskId) === -1) {
        return;
      }

      selectedTherapies = [];
      this.isDateSet = false;
      // console.log(element);

      if (element.therapies) {
        selectedTherapies =
          element.therapies.indexOf(";") != -1
            ? element.therapies.split(";")
            : [element.therapies];

        selectedTherapies = selectedTherapies.filter((elem) => elem != "");
      }
      // console.log(selectedTherapies)

      if (selectedTherapies.length > 0) {
        for (let i = 0; i < selectedTherapies.length; i++) {
          const id = selectedTherapies[i];
          const therapy = this.therapyValue.find((therapy) => therapy.id == id);

          // console.log(therapy)
          if (therapy) {
            const vatDefinition = this.vatTaxList.find(
              (elem) => elem.id === therapy.vat
            );
            // console.log(vatDefinition);

            therapy.date = element.date;

            const isNaNPrice = isNaN(parseFloat(therapy.net_price));

            if (isNaNPrice) {
              console.log('Not a number: ', therapy.net_price);
            }

            netPrices.push(parseFloat(therapy.net_price));

            if (vatDefinition) {
              bruto =
                parseFloat(therapy.net_price) *
                (1 + Number(vatDefinition.title) / 100);
            } else {
              bruto = parseFloat(therapy.net_price) * (1 + 20 / 100);
            }
            brutoPrices.push(bruto);

            const shouldSetDate =
              (selectedTherapies.length > 1 && i == 0) ||
              selectedTherapies.length === 1 ||
              !this.isDateSet;

            therapies.push({
              title: therapy.title,
              description: therapy.description ? therapy.description : '',
              date: shouldSetDate ? this.formatDate(therapy.date) : '',
              net_price: isNaNPrice ? this.language.noDataAvailable : this.language.euroSign + ' ' + parseFloat(therapy.net_price).toFixed(2),
              vat: vatDefinition ? vatDefinition.title : 20,
              gross_price: isNaNPrice ? this.language.noDataAvailable : this.language.euroSign + ' ' + bruto.toFixed(2)
            });
          }
        }
      }
    });

    return {
      therapies: therapies,
      netPrices: netPrices,
      brutoPrices: brutoPrices,
    };
  }

  private formatDate(value) {
    this.isDateSet = true;
    let date: string;

    if (value.indexOf('/') != -1) {
      date = value.split('/')[0];

    } else if (value.indexOf(' ') != -1) {
      date = value.split(' ')[0];
    }

    // console.log(date);
    return this.reverseString(date.trim());
  }

  private reverseString(str) {
    // Step 1. Use the split() method to return a new array
    var splitString;
    if (str.indexOf('.') != -1) {
      splitString = str.split(".");
    } else if (str.indexOf('-') != -1) {
      splitString = str.split("-");
    }

    // console.log(splitString);

    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse();
    // console.log(reverseArray)

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join("/");
    // console.log(joinArray)

    //Step 4. Return the reversed string
    return joinArray;
  }

  public downloadWord(): void {
    const componentRef = this;

    const data = this.getTherapyAndPricesData();

    const therapies = data.therapies;
    const netPrices = data.netPrices.filter(num => !isNaN(parseFloat(num)));
    const brutoPrices = data.brutoPrices.filter(num => !isNaN(parseFloat(num)));

    const subtotal = netPrices.reduce((a, b) => a + b, 0).toFixed(2);
    const total = brutoPrices.reduce((a, b) => a + b, 0).toFixed(2);

    this.loadFile("http://127.0.0.1:8887/Invoice_template.docx",
      // this.loadFile("http://app-production.eu:8080/assets/Invoice_template.docx", //CORS
      function (error, content) {
        if (error) {
          throw error;
        }

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: function () {
            return "";
          },
        });

        doc.setData({
          invoice_title: componentRef.language.invoiceTitle,
          invoice_number: componentRef.language.invoiceSubTitle,
          invoice_id: componentRef.invoiceID,
          invoice_generated_date: componentRef.currentDateFormatted,
          billing_from_title: componentRef.language.invoiceBillingTitleFrom,
          billing_to_title: componentRef.language.invoiceBillingTitleTo,
          clinic_name: componentRef.store.storename,
          customer_lastname: componentRef.customerUser.lastname,
          customer_firstname: componentRef.customerUser.firstname,
          clinic_street: componentRef.store.street,
          customer_street: componentRef.customerUser.street,
          customer_streetnumber: componentRef.customerUser.streetnumber,
          clinic_zipcode: componentRef.store.zipcode,
          clinic_city: componentRef.store.place,
          customer_city: componentRef.customerUser.city,
          clinic_telephone: componentRef.store.telephone,
          clinic_email: componentRef.store.email,
          subtotal_title: componentRef.language.invoiceSubtotal,
          total_title: componentRef.language.invoiceTotal,
          products: therapies,
          subtotal_price: netPrices.length === 0 ? componentRef.language.noDataAvailable : (componentRef.language.euroSign + " " + subtotal),
          total_price: brutoPrices.length === 0 ? componentRef.language.noDataAvailable : (componentRef.language.euroSign + " " + total),
          item_date: componentRef.language.date,
          item_title: componentRef.language.invoiceItem,
          netto_price_title: componentRef.language.invoiceNetPrice,
          vat: componentRef.language.vat + " (%)",
          gross_price_title: componentRef.language.invoiceGrossPrice,
          date_title: componentRef.language.dateTitle,
          price_title: componentRef.language.invoiceNetPrice,
          // notes_title: componentRef.language,
          // notes_text: componentRef.language
        });

        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
          this.replaceErrors();
          // console.log(JSON.stringify({ error: error }, replaceErrors));

          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
              .map(function (error) {
                return error.properties.explanation;
              })
              .join("\n");
            console.log("errorMessages", errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }
        const out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        // Output the document using Data-URI

        const filename =
          componentRef.customerUser.lastname +
          componentRef.customerUser.firstname +
          ".docx";
        saveAs(out, filename);
      }
    );
  }

  replaceErrors(value) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function (error, key) {
        error[key] = value[key];
        return error;
      }, {});
    }
    return value;
  }

  private loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
  }

  private get currentDateFormatted(): string {
    return new Date().toLocaleString().replace(/(.*)\D\d+/, "$1");
  }
}
