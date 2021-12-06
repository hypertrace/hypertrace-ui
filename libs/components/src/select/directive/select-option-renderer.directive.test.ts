import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { SelectOptionRendererDirective } from './select-option-renderer.directive';

describe('Select Option Renderer directive', () => {
  let spectator: SpectatorDirective<SelectOptionRendererDirective>;

  const createDirective = createDirectiveFactory<SelectOptionRendererDirective>({
    directive: SelectOptionRendererDirective
  });

  beforeEach(() => {
    spectator = createDirective(`
      <div class="content" *htSelectOptionRenderer>content</div>
    `);
  });

  test('should render content', () => {
    const content = spectator.directive.getTemplateRef();
    expect(content).toExist();
  });
});
