import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IconLibraryModule } from '../icon-library.module';

@NgModule({
  imports: [IconLibraryModule, MatIconTestingModule, HttpClientTestingModule]
})
export class IconLibraryTestingModule {}
