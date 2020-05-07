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
import { SenderService } from '../sender.service';

@Component({
  selector: 'app-server-conf',
  templateUrl: './server-conf.component.html',
  styleUrls: ['./server-conf.component.scss']
})
export class ServerConfComponent implements OnInit, AfterViewInit {

  constructor(
    private formBuilder: FormBuilder,
    private senderSerivce: SenderService
  ) { }

  defaultConfig: any;
  configForm: FormGroup;
  errorMessage = '';
  message = '';

  ngOnInit(): void {
    this.configForm = this.formBuilder.group({
      host: ['', [Validators.required]],
//      port: [587, [Validators.required, Validators.pattern('[0-9]{2,5}')]],
      port: [587, [Validators.required]],
      secure: [false, [Validators.required]],
      auth: this.formBuilder.group({
        user: ['', Validators.required],
        pass: ['', Validators.required]
      }),
      authMethod: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    this.senderSerivce.getConfig().subscribe((res) => {
      this.defaultConfig = res;
      this.configForm.patchValue(res);
    });
  }

  getErrorMessage(formControlName: string): string {
    let retMessage = '';

    if (this.configForm.get(formControlName).hasError('required')) {
      retMessage = `入力してください。`;
    }

    return retMessage;
  }

  onUpdate(): void {
    console.log(this.configForm.value);
    this.senderSerivce.updateConfig(this.configForm.value).subscribe((res) => {
      if (res.status === 'error') {
        this.errorMessage = res.content.response || res.content.code;
      } else if (res.status === 'done') {
        this.message = '設定の変更が完了しました。';
      }
      console.log(res);
    });
  }

  reset(): void {
    this.configForm.patchValue(this.defaultConfig);
  }
}
