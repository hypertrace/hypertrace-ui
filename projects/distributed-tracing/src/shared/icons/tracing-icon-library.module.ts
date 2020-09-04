import { NgModule } from '@angular/core';
import { IconLibraryModule } from '@hypertrace/assets-library';
import { TracingIconType } from './tracing-icon-type';

const iconsRootPath = 'assets/icons';

@NgModule({
  imports: [
    IconLibraryModule.withIcons([
      { key: TracingIconType.EntrySpan, url: `${iconsRootPath}/entry-span.svg` },
      { key: TracingIconType.ExitSpan, url: `${iconsRootPath}/exit-span.svg` },
      { key: TracingIconType.InternalSpan, url: `${iconsRootPath}/internal-span.svg` },
      { key: TracingIconType.OpenTracing, url: `${iconsRootPath}/open-tracing.svg` }
    ])
  ]
})
export class TracingIconLibraryModule {}
