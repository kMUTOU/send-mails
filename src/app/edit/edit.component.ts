import {
  Component,
  NgZone,
  ViewChild,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SenderService } from '../sender.service';
import { Element, MailMessage } from '../common/dataformat';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit  {

  mail: MailMessage;

  // addressFormGroup: FormGroup;
  messageFormGroup: FormGroup;
  dataSource = new MatTableDataSource<Element>();
  selection = new SelectionModel<Element>(true, []);

  displayedColumns = [
    //    'position',
    'corporation',
    'name',
    'address',

    // 編集・削除用ボタン
    'mod',
    'del'
  ];

  dialogData: Element;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;


  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
    private senderService: SenderService,
  ) { }

  ngOnInit(): void {
    // messageFormGroupのattributeを初期化する.
    this.initMessageForm();

    // dialogDataを初期化する.
    this.initDialogData();

    this.messageFormGroup = this.formBuilder.group({
      from: [this.mail.from, [Validators.required, Validators.email]],
      subject: [this.mail.subject, Validators.required],
      text: [this.mail.text, Validators.required],
    });

  }


  ngAfterViewInit(): void {
    this.senderService.getAddresses().subscribe((res: Array<Element>) => {
      this.dataSource.data = res;
    });

    this.senderService.messageTemplate().subscribe((res: MailMessage) => {
      this.mail = res;
      this.messageFormGroup.setValue({
        from: this.mail.from,
        subject: this.mail.subject,
        text: this.mail.text
      });
      this.mail = res;
    });

    // MatTableのPaginatorとSortをinitalize
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // dialogDataを初期化する.
    this.initDialogData();
  }

  /**
   * エラーメッセージを
   * @method
   * @param formControlName: The name for formControl
   * @returns string: error message
   */
  getErrorMessage(formControlName: string): string {
    let retMessage = '';

    if (formControlName === 'from') {
      retMessage = this.messageFormGroup.get(formControlName).hasError('email') ?
      `アドレスの指定に問題があります` : '';
    }

    if (this.messageFormGroup.get(formControlName).hasError('required')) {
      retMessage = `入力してください。`;
    }

    return retMessage;
  }


  /**
   * messageFormGroupの内容を確認する
   * @method
   * @returns bool
   */
  validationBody(): boolean {
    if (this.messageFormGroup.dirty || this.messageFormGroup.invalid) {
      return false;
    } else {
      return true;
    }
  }


  /**
   * メッセージテンプレートを更新する.
   */
  updateMessageTemplate(): void {
    if (this.validationBody) {
      const msgTemp = this.messageFormGroup.value;
      this.senderService.updateMessageTemplate(msgTemp).subscribe((res) => {
        console.log(res);
      });
    } else {
      return ;
    }
  }

  /**
   * 送信先一覧を更新する。
   */
  updateAddresses(): void {
    const addressList = this.dataSource.data;
    this.senderService.updateAddresses(addressList).subscribe((res) => {
      console.log(res);
    });
  }


  /**
   * @param row: Element
   */
  dropRow(row?: Element, index?: number): void {
    // dataArrayからspliceで削る
    this.dataSource.data.splice(index, 1);

    // dataSourceを更新する
    this.updateTable();
  }


  /**
   * @returns void
   */
  updateTable(): void {
    this.dataSource = new MatTableDataSource<Element>(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Open a Dialog
   * @method
   */
  openDialog(row?: Element): void {
    // dialogのデータを初期化する.
    this.initDialogData();

    // 編集ボタンを押して、rowのデータがある場合はそれを利用する。
    if (row) {
      Object.assign(this.dialogData, row)
    }

    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '600px',
      data: this.dialogData
    });

    // レコードの追加
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // rowがない場合は追加
        if (row) {
          Object.assign(row, result);
        } else {
          this.dataSource.data.push(result);
        }
        this.updateTable();
        this.initDialogData();
      }
    });

  }

  initDialogData(): void {
    this.dialogData = {
      name: '',
      corporation: '',
      address: '',
      send: true
    };
  }

  initMessageForm(): void {
    this.mail = {
      from: '',
      subject: '',
      text: ''
    };
  }
}


/**
 *
 * @classdesc
 */
@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
})
export class EditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Element
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

}
