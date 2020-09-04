import { SpanType } from '../../graphql/model/schema/span';
import { TracingIconType } from '../../icons/tracing-icon-type';
import { TracingIconLookupService } from './tracing-icon-lookup.service';

describe('Tracing Icon Lookup Service', () => {
  const service = new TracingIconLookupService();

  test('determines correct icon type for span types', () => {
    expect(service.forSpanType(SpanType.Entry)).toBe(TracingIconType.EntrySpan);
    expect(service.forSpanType(SpanType.Exit)).toBe(TracingIconType.ExitSpan);
  });
});
