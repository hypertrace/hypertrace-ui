import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../../icon/icon.component';
import { FileUploadState } from './file-display';
import { FileDisplayComponent } from './file-display.component';

describe('File Display Component', () => {
  const createComponent = createComponentFactory({
    component: FileDisplayComponent,
    shallow: true,
    imports: [FormattingModule],
    declarations: [MockComponent(IconComponent)]
  });

  test('should render everything correctly', () => {
    const file = new File([new Blob(['text'])], 'file.txt');
    const spectator = createComponent();
    expect(spectator.query('.file-display')).not.toExist();

    // File with no progress bar
    spectator.setInput({ file: file });
    expect(spectator.query('.file-display')).toExist();
    expect(spectator.query('.file-name')).toHaveText('file.txt');
    expect(spectator.query('.file-size')).toHaveText('4');

    // Delete file action
    spyOn(spectator.component.deleteClick, 'emit');
    spectator.click(spectator.query('.delete-icon') as Element);
    expect(spectator.component.deleteClick.emit).toHaveBeenCalled();

    // Success state
    spectator.setInput({ file: file, state: FileUploadState.Success, showState: true });
    expect(spectator.query('.success-icon')).toExist();
    expect(spectator.query('.delete-icon')).not.toExist();

    // Failure state
    spectator.setInput({ file: file, state: FileUploadState.Failure, showState: true });
    expect(spectator.query('.file-display.error')).toExist();
    expect(spectator.query('.failure-icon')).toExist();
  });
});
