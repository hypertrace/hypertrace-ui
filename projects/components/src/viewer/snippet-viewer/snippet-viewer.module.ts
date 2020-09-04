import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SnippetViewerComponent } from './snippet-viewer.component';

@NgModule({
  declarations: [SnippetViewerComponent],
  imports: [CommonModule],
  exports: [SnippetViewerComponent]
})
export class SnippetViewerModule {}
