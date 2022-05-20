import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { FileDisplayComponent } from './file-display.component';

describe('File Display Component', () => {
  const createComponent = createComponentFactory({
    component: FileDisplayComponent,
    shallow: true,
    imports: [FormattingModule],
    declarations: [MockComponent(IconComponent), MockComponent(ProgressBarComponent)]
  });

  test('should render everything correctly', () => {
    const spectator = createComponent();
    expect(spectator.query('.file-display')).not.toExist();

    // File with no progress bar
    spectator.setInput({ file: { data: new File([new Blob(['text'])], 'file.txt') } });
    expect(spectator.query('.file-display')).toExist();
    expect(spectator.query('.file-name')).toHaveText('file.txt');
    expect(spectator.query('.file-size')).toHaveText('4');
    expect(spectator.query(ProgressBarComponent)).not.toExist();

    // Delete file action
    spyOn(spectator.component.deleteClick, 'emit');
    spectator.click(spectator.query('.delete-icon') as Element);
    expect(spectator.component.deleteClick.emit).toHaveBeenCalled();

    // File with progress bar and in progress is false/undefined
    spectator.setInput({ file: { data: new File([new Blob(['text'])], 'file.txt'), progress: 40 } });
    expect(spectator.query(ProgressBarComponent)?.progress).toBe(40);

    // In progress is true
    spectator.setInput({ file: { data: new File([new Blob(['text'])], 'file.txt'), progress: 40, inProgress: true } });
    expect(spectator.query('.delete-icon.disabled')).toExist();
  });
});
