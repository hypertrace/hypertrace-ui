import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[htDropZone]'
})
export class DropZoneDirective {
  @Output()
  public readonly dropped: EventEmitter<FileList> = new EventEmitter();

  @Output()
  public readonly dragHover: EventEmitter<boolean> = new EventEmitter();

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropped.emit(event.dataTransfer?.files);
    this.dragHover.emit(false);
  }

  @HostListener('dragover', ['$event'])
  public onDragover(event: DragEvent): void {
    event.preventDefault();
    this.dragHover.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragleave(event: DragEvent): void {
    event.preventDefault();
    this.dragHover.emit(false);
  }
}
