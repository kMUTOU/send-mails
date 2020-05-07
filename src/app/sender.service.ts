import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MailMessage, Element } from './common/dataformat';

const sendMailApiUri = 'http://localhost:3000/send';
const messageApiUri = 'http://localhost:3000/message';
const addressesApiUri = 'http://localhost:3000/addresses';
const smtpConfigApiUri = 'http://localhost:3000/smtp_conf'

@Injectable({
   providedIn: 'root'
})
// @Injectable()
export class SenderService {

  constructor(private http: HttpClient) { }
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  posting(body: object): Observable<any> {
    return this.http.post(sendMailApiUri, body, {headers: this.headers});
  }

  messageTemplate(): Observable<any> {
    return this.http.get(messageApiUri);
  }

  getAddresses(): Observable<any> {
    return this.http.get(addressesApiUri);
  }

  updateMessageTemplate(messageTemplate: MailMessage): Observable<any> {
    return this.http.post(messageApiUri, messageTemplate, {headers: this.headers});
  }

  updateAddresses(addresses: Element[]): Observable<any> {
    return this.http.post(addressesApiUri, addresses, {headers: this.headers});
  }

  getConfig(): Observable<any> {
    return this.http.get(smtpConfigApiUri);
  }

  updateConfig(data: any): Observable<any> {
    return this.http.post(smtpConfigApiUri, data, {headers: this.headers});
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
