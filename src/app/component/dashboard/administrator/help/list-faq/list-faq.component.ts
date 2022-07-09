import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaqModel } from 'src/app/models/faq-question-model';
import { FaqService } from 'src/app/service/faq.service';

import { PanelBarExpandMode } from "@progress/kendo-angular-layout";
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { Modal } from 'ngx-modal';

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

  overrideMessage: Partial<IndividualConfig> = { timeOut: 7000, positionClass: "toast-bottom-right" };

  constructor(private service: FaqService, 
    private route: ActivatedRoute,
    private toastrService: ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem("language") !== null) {
      this.language = JSON.parse(localStorage.getItem("language"));
    }

    this.topicId = this.route.snapshot.params["id"];

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
    this.faq.question = "";
    this.faq.answer = "";
    this.operationMode = 'add';
    // this.data.language = "";
  }  

  openEditTemplateModal(event): void {
    this.faq = event;
    this.operationMode = 'edit';
    this.faqModal.open();
  }

  closeHelpTopicModal(): void {
    this.faqModal.close();
  }

  createHelpTopic(): void{
    this.service.createFaq(this.faq).then(result=>{
      this.loadFaqs();
      this.closeHelpTopicModal();
      if (result) {
        this.displaySuccessMessage(this.language.adminSuccessCreateTitle, this.language.adminSuccessCreateText);

      } else {
        this.displayErrorMessage(this.language.adminErrorCreateTitle, this.language.adminErrorCreateText);
      }
    });
  }

  updateHelpTopic(){
    this.service.updateFaq(this.faq).then(result=>{
      this.closeHelpTopicModal();
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
}