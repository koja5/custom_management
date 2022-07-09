import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelpTopicModel } from 'src/app/models/help-topic-model';

@Component({
  selector: 'app-topic-card',
  templateUrl: './topic-card.component.html',
  styleUrls: ['./topic-card.component.scss']
})
export class TopicCardComponent implements OnInit {
  @Input() topic: HelpTopicModel;
  @Output() editEmmiter = new EventEmitter<any>();
  @Output() deleteEmmiter = new EventEmitter<any>();

  constructor(private router: Router) { }

  ngOnInit() {
  }

  public generateLink(link) {
    this.router.navigate([link, this.topic.id]);
  }

  public editHelpTopic(){
    this.editEmmiter.emit(this.topic);
  }

  public deleteHelpTopic(){
    this.deleteEmmiter.emit(this.topic);
  }
}