import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelpTopicModel } from '../models/help-topic-model';
import { FaqModel } from '../models/faq-question-model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(public httpClient: HttpClient) { }

  public getFaqTopics(superAdminId): Observable<HelpTopicModel[]> {
    return this.httpClient
      .get<HelpTopicModel[]>("/api/getFaqTopics/"+superAdminId).map((res) => res);
  }

  public getFaqTopic(topicId, superAdminId): Observable<HelpTopicModel>{
    return this.httpClient
    .get<HelpTopicModel>("/api/getFaqTopic/"+topicId+"/"+superAdminId).map((res) => res);
  }

  public createFaqTopic(data) {
    return this.httpClient.post("/api/createFaqTopic", data).toPromise();
  }

  public updateFaqTopic(data) {
    return this.httpClient.post("/api/updateFaqTopic", data).toPromise();
  }

  public deleteFaqTopic(data) {
    return this.httpClient.post("/api/deleteFaqTopic/", data).toPromise();
  }

  public createFaq(data) {
    return this.httpClient.post("/api/createFaq", data).toPromise();
  }

  public getFaqsByTopic(topicId: number, superAdminId: number): Observable<FaqModel[]> {
    return this.httpClient
      .get<FaqModel[]>("/api/getFaqQuestions/" + topicId+"/"+superAdminId).map((res) => res);
  }

  public updateFaq(data) {
    return this.httpClient.post("/api/updateFaq", data).toPromise();
  }

  public deleteFaq(data) {
    return this.httpClient.post("/api/deleteFaq/", data).toPromise();
  }
}
