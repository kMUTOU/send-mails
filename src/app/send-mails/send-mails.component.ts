import { Input, Component, NgZone, ViewChild, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SelectionModel } from '@angular/cdk/collections';

import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Element, MailMessage } from '../common/dataformat';
import { SenderService } from '../sender.service';


@Component({
  selector: 'app-send-mails',
  templateUrl: './send-mails.component.html',
  styleUrls: ['./send-mails.component.scss'],
  providers: [
    {provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}},
  ]
})
export class SendMailsComponent implements OnInit, AfterViewInit {

  /**
   *
   * @params controlService
   */
  constructor(
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private controlService: SenderService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  // https://stackblitz.com/angular/gxmmxogbgmp
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @Output() execSend = new EventEmitter<object>();

  title = 'メール送信フォーム';
  mail: MailMessage;
  files: any = [];

  addressFormGroup: FormGroup;
  mailFormGroup: FormGroup;
  dataSource = new MatTableDataSource<Element>();
  selection = new SelectionModel<Element>(true, []);

  // material stepper configure
  isLinear = false;
  isNonEditable = false;

  displayedColumns = [
    'select',
    'corporation',
    'name',
    'address'
  ];

  // Progress Bar
  postProgress = 0;
  hasPosted = false;

  // Status Message
  hasMessage = false;
  statusMessage = '';
  statusMessages = [];

  ngOnInit(): void {
    // message init
    this.mailMessageInit();

    this.controlService.getAddresses().subscribe((res: Array<Element>) => {
      this.dataSource.data = res;
    });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.mailFormGroup = this._formBuilder.group({
      subject: ['', Validators.required],
      mailBody: ['', Validators.required],
    });

    this.addressFormGroup = this._formBuilder.group({
      addressCtrl: [this.selection, Validators.required]
    });
  }

  ngAfterViewInit(): void {
    /* 送信先一覧を読み込む */
    this.controlService.messageTemplate().subscribe((res: MailMessage) => {
      this.mail = res;
      this.mailFormGroup.setValue({
        subject: this.mail.subject,
        mailBody: this.mail.text
      });
    });
  }

  onSend(): void {

    // mailのbodyが空欄であるか確認する。本来はDirectivesで確認後に、
    // どの様に修正すべきか表示する様なerror表示が欲しいところ。
    if (!this.validationBody()) {
      console.error('MailBody is invalid.');
    }

    if (this.files.reduce( (p, n) => p + n.size, 0) > 5 * 1024 * 1024) {
      this.hasMessage = true;
      this.statusMessage = '添付ファイルのサイズが5MByteを超えています。';
      this.statusMessages.push({type: 'error', content: `添付ファイルのサイズが5MByteを超えています。`});
      console.error('添付ファイルのサイズが5MByteを超えています。');

      return;
    }

    const addrs = this.addressFormGroup.get('addressCtrl').value.selected;

    if (addrs.length === 0) {
      this.hasMessage = true;
      this.statusMessage = '宛先が一つも選択されていません。';
      this.statusMessages.push({type: 'error', content: `宛先が一つも選択されていません。`});
      return;
    } else {
      this.hasPosted = true;
      addrs.forEach(addr => {
        // nodemailerにくべるmessageを組み立てる。
        const sendMessage = {
          message: {
            from: this.mail.from,
            to: addr.address,
            subject: this.mailFormGroup.get('subject').value,
            text: `${addr.corporation} ${addr.name}様\n\n` + this.mailFormGroup.get('mailBody').value,
          }
        };

        // 添付ファイルが存在すれば、attachmentsに追加する。
        if (this.files.length > 0) {
          sendMessage.message['attachments'] = this.files;
        }

        // this.execSend.emit(message);
        this.controlService.posting(sendMessage).subscribe(
          (res: any) => {

            // ProgressBarを進める。
          this.postProgress += 100 / addrs.length;
          this.hasMessage = true;
          this.statusMessage = `${res.to}に送信しました。`;
          this.statusMessages.push({type: 'info', content: `${res.to}にメールを送信しました。`});
        }, (err: any) => {
          this.hasMessage = true;
          this.statusMessage = `エラー: ${err}`;
          this.statusMessages.push({type: 'info', content: `${err}が生じました。`});
          console.error(err);
        });
      });
    }
  }

  /**
   * mailの内容を確認する
   * @method
   */
  validationBody(): boolean {
    if ((this.mailFormGroup.get('subject').value.length === 0) ||
    (this.mailFormGroup.get('mailBody').value.length === 0)) {
      return false;
    } else {
      return true;
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this.ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  upload(file: any): Observable<any> {
    return new Observable((ob) => { ob.next(file)});
  }

  /**
   * 添付ファイルのためのFile API
   *
   * https://mi12cp.hatenablog.com/entry/2018/08/10/002344
   * @desc メールに添付するためのファイルをFile APIで選択するもの
   * @version 0.0.1
   */
  attacheFiles(event: File[]): void {
    const files = event;  // FileList object

    for (const file of files) {
      if (!file.type.match('application/.*')) {
        continue;
      }
      const reader = new FileReader();

      reader.onload = (e) => {
        const sendData = {
          filename: file.name,
          type: file.type,
          size: file.size,
          path: e.target['result'],
        };

        this.upload(sendData).subscribe(
          data => {
            console.log(data);
            this.files.push(data);
          },
          error => {
            console.log(error);
          }
        );
      };

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
    }
  }

  removeFile(num: number): void {
    this.files.splice(num, 1);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  slideLabel(row?: Element, num?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${num + 1}`;
  }

  mailMessageInit(): void {
    this.mail = {
      from: '',
      subject: '',
      text: ''
    };
  }
}
