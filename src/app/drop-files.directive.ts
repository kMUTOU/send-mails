import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appDropFiles]'
})
export class DropFilesDirective {

  private attachments: any = [];
  private elem: HTMLElement;

  @Output()
  public selectedFiles: EventEmitter<File[]> = new EventEmitter<File[]>();

  constructor(private element: ElementRef) {
      this.elem = this.element.nativeElement;
  }

  @Input('appDropFiles')
  set fileUploadQueue(value: any) {
      if (value) {
        this.attachments = value;
      }
  }

  @HostListener('change')
  public onChange(): any {
    const files = this.element.nativeElement.files;
    this.selectedFiles.emit(files);

    for (const file of files) {
      this.attachments.push(file);
    }

    this.element.nativeElement.value = '';
  }

  @HostListener('drop', [ '$event' ])
  public onDrop(event: any): any {
    const files = event.dataTransfer.files;
    this.selectedFiles.emit(files);

    for (const file of files) {
      this.attachments.push(file);
    }

    event.preventDefault();
    event.stopPropagation();
    this.element.nativeElement.value = '';
  }

  @HostListener('dragover', [ '$event' ])
  public onDropOver(event: any): any {
      event.preventDefault();
  }

}
