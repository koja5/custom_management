import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaqModel } from 'src/app/models/faq-question-model';
import { FaqService } from 'src/app/service/faq.service';

import { PanelBarExpandMode } from "@progress/kendo-angular-layout";
import { Modal } from 'ngx-modal';
import { HelpService } from 'src/app/service/help.service';
import { HelpTopicModel } from 'src/app/models/help-topic-model';
import { MessageService } from 'src/app/service/message.service';
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: 'app-list-faq',
  templateUrl: './list-faq.component.html',
  styleUrls: ['./list-faq.component.scss']
})
export class ListFaqComponent implements OnInit {
  @ViewChild("faqModal") faqModal: Modal;
  @ViewChild("panelbar") panelRef;

  topicId: number;
  public kendoPanelBarExpandMode = PanelBarExpandMode.Multiple;
  public list: FaqModel[]=[];
  public filterList: FaqModel[]=[];
  public language: any;
  public faqTopic: HelpTopicModel;

  public faq = new FaqModel();
  public operationMode = 'add';

  public userSuperAdmin = false;
  private userId;
  checkIfInputValid = checkIfInputValid;

  constructor(private service: FaqService,
    private route: ActivatedRoute,
    private helpService: HelpService,
    private messageService: MessageService) { }

  ngOnInit() {
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    this.userId = this.helpService.getMe();
    this.userSuperAdmin = this.userId==4 && this.helpService.getType()==0;

    this.topicId = this.route.snapshot.params["id"];
    this.service.getFaqTopic(this.topicId).subscribe(data => {
      if (data && data["length"] > 0) {
        this.faqTopic = data[0];
      }      
    });
    this.faq.helpTopicId = this.topicId;
    this.loadFaqs();
    this.initializationConfig();
  }

  public loadFaqs() {
    this.service.getFaqsByTopic(this.topicId).subscribe(data => {
      this.list = data;
      this.filterList = data;
    });
  }

  public onFilter(inputValue: string): void {
    inputValue = inputValue.toLowerCase();
    this.filterList = this.list.filter(r => r.question.toLowerCase().includes(inputValue) || r.answer.toLowerCase().includes(inputValue));
  }

  addNewModal() {
    this.faqModal.open();
    this.faq = new FaqModel();
    this.faq.helpTopicId = this.topicId;
    this.faq.question = "";
    this.faq.answer = "";
    this.operationMode = 'add';
  }
 
  onIconEvent(value, event, iconEventType) {
    //To stop expand/collaps panel
    event.stopPropagation();

    if(iconEventType==="edit")
      this.openEditFaqModal(value) 
    else if(iconEventType==="delete")
      this.deleteQuestion(value);
 }

  openEditFaqModal(value): void {    
    this.faq = value;
    this.operationMode = 'edit';
    this.faqModal.open();
  }

  closeFaqModal(): void {
    this.faqModal.close();
  }

  createFaq(): void {
    this.service.createFaq(this.faq).then(result => {
      this.loadFaqs();
      this.closeFaqModal();
      if (result) {
        this.helpService.successToastr(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);
      } else {
        this.helpService.errorToastr(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateFaq() {
    this.service.updateFaq(this.faq).then(result => {
      this.closeFaqModal();
      if (result) {
        this.helpService.successToastr(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);
      } else {
        this.helpService.errorToastr(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  deleteQuestion(value) {
    this.service.deleteFaq(value).then(result => {

      if (result) {
        this.helpService.successToastr(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);
        this.loadFaqs();
      } else {
        this.helpService.errorToastr(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);
      }
    });;
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
}