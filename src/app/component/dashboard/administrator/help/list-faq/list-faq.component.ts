import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaqModel } from 'src/app/models/faq-question-model';
import { FaqService } from 'src/app/service/faq.service';

import { PanelBarExpandMode } from "@progress/kendo-angular-layout";
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { Modal } from 'ngx-modal';
import { HelpService } from 'src/app/service/help.service';

@Component({
  selector: 'app-list-faq',
  templateUrl: './list-faq.component.html',
  styleUrls: ['./list-faq.component.scss']
})
export class ListFaqComponent implements OnInit {
  @ViewChild("faqModal") faqModal: Modal;

  topicId: number;
  public kendoPanelBarExpandMode = PanelBarExpandMode.Multiple;
  public list: FaqModel[];
  public filterList: FaqModel[];
  public language: any;

  public faq = new FaqModel();
  public operationMode = 'add';

  public userSuperAdmin=false;
  private superAdminId;
  private userId;

  overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };

  constructor(private service: FaqService, 
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private helpService: HelpService) { }
  
  ngOnInit() {  
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }   
    
    this.superAdminId = this.helpService.getSuperadmin();
    this.userId = this.helpService.getMe();
    this.userSuperAdmin = this.superAdminId == this.userId;

    this.topicId = this.route.snapshot.params["id"];
    this.faq.helpTopicId=this.topicId;
    this.loadFaqs();
  }

  public loadFaqs(){
    this.service.getFaqsByTopic(this.topicId).subscribe(data=>{
      this.list = data; 
      this.filterList=data;     
    });
  }

  public onFilter(inputValue: string): void {
    inputValue = inputValue.toLowerCase();
    this.filterList=this.list.filter(r=>r.question.toLowerCase().includes(inputValue) || r.answer.toLowerCase().includes(inputValue));
  }

  addNewModal() {
    this.faqModal.open();
    this.faq = new FaqModel();
    this.faq.helpTopicId=this.topicId;
    this.faq.superAdminId=this.superAdminId;
    this.faq.question = "";
    this.faq.answer = "";
    this.operationMode = 'add';
    // this.data.language = "";
  }  

  openEditFaqModal(event): void {
    this.faq = event;
    this.operationMode = 'edit';
    this.faqModal.open();
  }

  closeFaqModal(): void {
    this.faqModal.close();
  }

  createFaq(): void{
    this.service.createFaq(this.faq).then(result=>{
      this.loadFaqs();
      this.closeFaqModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateFaq(){
    this.service.updateFaq(this.faq).then(result=>{
      this.closeFaqModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessUpdateTitle, this.language.adminSuccessUpdateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorUpdateTitle, this.language.adminErrorUpdateText);
      }
    });
  }

  private displaySuccessMessage(message: string, title: string): void {
    this.toastrService.success(message, title, { timeOut: 7000, positionClass: "toast-bottom-right" });
  }

  private displayErrorMessage(message: string, title: string): void {
    this.toastrService.error(message, title, this.overrideMessage);
  }

  deleteQuestion(event){
    this.service.deleteFaq(event).then(result => {

      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessDeleteTitle, this.language.adminSuccessDeleteText);
        this.loadFaqs();
      } else {
        this.displaySuccessMessage(this.language.adminErrorDeleteTitle, this.language.adminErrorDeleteText);

      }
    });;
  }
}