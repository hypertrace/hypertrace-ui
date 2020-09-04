import { TraceStatusType } from '../../../../../model/schema/trace';
import { TraceStatusSpecificationBuilder } from './trace-status-specification-builder';

describe('TraceStatusSpecificationBuilder', () => {
  const traceSpecificationBuilder = new TraceStatusSpecificationBuilder();

  test('correctly builds trace status specification', () => {
    const traceSpecification = traceSpecificationBuilder.build();

    expect(traceSpecification.asGraphQlSelections()).toEqual([
      {
        path: 'attribute',
        alias: 'status',
        arguments: [
          {
            name: 'key',
            value: 'status'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'statusCode',
        arguments: [
          {
            name: 'key',
            value: 'statusCode'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'statusMessage',
        arguments: [
          {
            name: 'key',
            value: 'statusMessage'
          }
        ]
      }
    ]);

    expect(
      traceSpecification.extractFromServerData({
        status: TraceStatusType.FAIL,
        statusCode: '404',
        statusMessage: 'Not Found'
      })
    ).toEqual({
      status: TraceStatusType.FAIL,
      statusCode: '404',
      statusMessage: 'Not Found'
    });
  });
});
