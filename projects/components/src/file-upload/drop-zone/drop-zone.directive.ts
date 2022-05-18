import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[htDropZone]'
})
export class DropZoneDirective {
  @Output()
  private readonly dropped: EventEmitter<FileList> = new EventEmitter();

  @Output()
  private readonly dragOver: EventEmitter<boolean> = new EventEmitter();

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropped.emit(event.dataTransfer?.files);
    this.dragOver.emit(false);
  }

  @HostListener('dragover', ['$event'])
  public onDragover(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragleave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.emit(false);
  }
}
