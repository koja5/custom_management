import { Component, ViewChild, OnInit } from '@angular/core';
import { HelpTopicModel } from 'src/app/models/help-topic-model';
import { FaqService } from 'src/app/service/faq.service';
import { Modal } from 'ngx-modal';
import { HelpService } from 'src/app/service/help.service';
import { MessageService } from 'src/app/service/message.service';
import { DynamicService } from 'src/app/service/dynamic.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  @ViewChild("helpTopicModal") helpTopicModal: Modal;

  public language: any;
  public languages: [];
  public topics: HelpTopicModel[] = [];
  public topic = new HelpTopicModel();

  public operationMode = 'add';
  public userSuperAdmin = false;

  private superAdminId;
  private userId;
  public loading: boolean;
  public selectedUser: string;

  public data: any;
  public fields: Object = {
    text: "language",
    value: "countryCode"
  };
  public height: string = "400px";
  public countryCodeValue: any;
  public selectedLanguage: any;

  constructor(private service: FaqService,
    private helpService: HelpService,
    private messageService: MessageService,
    private dynamicService: DynamicService) {}

  ngOnInit() {  
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    this.superAdminId =this.helpService.getSuperadmin();
    this.userId=this.helpService.getMe();
    
    this.userSuperAdmin = this.superAdminId==this.userId;
    this.initializationConfig();
  }

  changeLanguageEvent(event: any) {
    this.countryCodeValue = event.itemData.countryCode;
    this.loadTopics();
  }

  getAllLanguages() {
    this.loading = true;
    this.dynamicService
      .callApiGet(
        "/api/getAllTranslationsByDemoAccount",
        this.helpService.getLocalStorage("demoAccountLanguage")
      )
      .subscribe((data) => {
        console.log(data);
        this.data = data;
        this.translateTextValue();
      });
  }

  translateTextValue() {
    const languageConfig = JSON.parse(
      this.helpService.getLocalStorage("language")
    );
    if (languageConfig) {
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < languageConfig["languages"].length; j++) {
          if (
            this.data[i].countryCode ===
            languageConfig["languages"][j].countryCode
          ) {
            this.data[i].language = languageConfig["languages"][j].language;
            break;
          }
        }
      }
    }

    this.loading = false;
  }

  loadTopics(){
    this.service.getFaqTopics(this.superAdminId,this.countryCodeValue).subscribe((data)=>{
      this.topics=data
    });
  }
  
  addNewModal() {
    this.helpTopicModal.open();
    this.topic = new HelpTopicModel();
    this.topic.name = "";
    this.topic.superAdminId=this.superAdminId;
    this.topic.countryCode=this.countryCodeValue;
    this.operationMode = 'add';
  }  

  openEditTemplateModal(event): void {
    this.topic = event;
    this.operationMode = 'edit';
    this.helpTopicModal.open();
  }

  closeHelpTopicModal(): void {
    this.helpTopicModal.close();
  }

  createHelpTopic(): void{
    this.service.createFaqTopic(this.topic).then(result=>{
      this.loadTopics();
      this.closeHelpTopicModal();
      if (result) {
        this.helpService.successToastr(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);
      } else {
        this.helpService.errorToastr(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText)
      }
    });
  }

  updateHelpTopic(){
    this.service.updateFaqTopic(this.topic).then(result=>{
      this.closeHelpTopicModal();
      if (result) {
        this.helpService.successToastr(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
      } else {
        this.helpService.errorToastr(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteHelpTopic(topic){
    this.service.deleteFaqTopic(topic).then(result=>{
      if (result) {
        this.helpService.successToastr(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
        this.loadTopics();
      } else {
        this.helpService.errorToastr(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  initializationConfig() {
    this.getAllLanguages();
    this.checkDefaultLanguage();
    this.loadTopics();
  }

  checkDefaultLanguage() {
    
      if (this.helpService.getLocalStorage("defaultLanguage")) {
        this.countryCodeValue = this.helpService.getLocalStorage("defaultLanguage");
      } else {
        this.countryCodeValue = "US";
      }  
    }  
}
