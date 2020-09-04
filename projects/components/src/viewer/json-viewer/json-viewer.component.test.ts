import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { IconModule } from '../../icon/icon.module';
import { JsonRecordsPipe } from './json-records.pipe';
import { JsonViewerComponent } from './json-viewer.component';

describe('Json Tree Component', () => {
  let spectator: Spectator<JsonViewerComponent>;

  const createHost = createHostFactory({
    component: JsonViewerComponent,
    declarations: [JsonRecordsPipe],
    imports: [CommonModule, IconModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [mockProvider(NavigationService)]
  });

  test('should display all properties', () => {
    const inputJson = JSON.parse(
      '{"comment":"product comment","created":0,"modified":0,"productId":"5c92fccd6eba99ac466c178e","stars":4,"username":"Foo Bar"}'
    );
    const expectedKeyValues = [
      ['comment', 'product comment'],
      ['created', '0'],
      ['modified', '0'],
      ['productId', '5c92fccd6eba99ac466c178e'],
      ['stars', '4'],
      ['username', 'Foo Bar']
    ];
    spectator = createHost(`<htc-json-viewer></htc-json-viewer>`);
    spectator.setInput({
      json: inputJson
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(6);

    propertiesElement.forEach((propertyElement, index) => {
      const keyElement = propertyElement.querySelector('.key');
      const valueElement = propertyElement.querySelector('.value');

      expect(keyElement).toExist();
      expect(valueElement).toExist();
      expect(keyElement).toHaveText(expectedKeyValues[index][0]);
      expect(valueElement).toHaveText(expectedKeyValues[index][1]);
    });
  });

  test('should display string fields with correct style', () => {
    const inputJson = JSON.parse('{"comment":"product comment"}');

    spectator = createHost(`<htc-json-viewer></htc-json-viewer>`);
    spectator.setInput({
      json: inputJson
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(1);

    const keyElement = propertiesElement[0].querySelector('.key');
    const valueElement = propertiesElement[0].querySelector('.value');

    expect(keyElement).toExist();
    expect(valueElement).toExist();

    expect(keyElement).toHaveText('comment:');
    expect(valueElement).toHaveText('"product comment"');

    const stringValueElement = propertiesElement[0].querySelector('.string-value');
    expect(stringValueElement).toExist();
    expect(stringValueElement).toEqual(valueElement);

    const expandedObjectElement = propertiesElement[0].querySelector('.expanded-object');
    expect(expandedObjectElement).not.toExist();
  });

  test('should display numeric fields  with correct style', () => {
    const inputJson = JSON.parse('{"total":10001}');

    spectator = createHost(`<htc-json-viewer></htc-json-viewer>`);
    spectator.setInput({
      json: inputJson
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(1);

    const keyElement = propertiesElement[0].querySelector('.key');
    const valueElement = propertiesElement[0].querySelector('.value');

    expect(keyElement).toExist();
    expect(valueElement).toExist();

    expect(keyElement).toHaveText('total:');
    expect(valueElement).toHaveText('10001');

    const stringValueElement = propertiesElement[0].querySelector('.primitive-value');
    expect(stringValueElement).toExist();
    expect(stringValueElement).toEqual(valueElement);

    const expandedObjectElement = propertiesElement[0].querySelector('.expanded-object');
    expect(expandedObjectElement).not.toExist();
  });

  test('should display boolean fields with correct style', () => {
    const inputJson = JSON.parse('{"isHTTP":true}');

    spectator = createHost(`<htc-json-viewer></htc-json-viewer>`);
    spectator.setInput({
      json: inputJson
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(1);

    const keyElement = propertiesElement[0].querySelector('.key');
    const valueElement = propertiesElement[0].querySelector('.value');

    expect(keyElement).toExist();
    expect(valueElement).toExist();

    expect(keyElement).toHaveText('isHTTP:');
    expect(valueElement).toHaveText('true');

    const stringValueElement = propertiesElement[0].querySelector('.primitive-value');
    expect(stringValueElement).toExist();
    expect(stringValueElement).toEqual(valueElement);

    const expandedObjectElement = propertiesElement[0].querySelector('.expanded-object');
    expect(expandedObjectElement).not.toExist();
  });

  test('should display array fields  with correct style and no default expansion', () => {
    const inputJson = JSON.parse('{"results":[{"name": "Test Item 1"}, {"name": "Test Item 2"}]}');

    spectator = createHost(`<htc-json-viewer [json]="json" [showExpanded]="showExpanded"></htc-json-viewer>`, {
      hostProps: {
        json: inputJson,
        showExpanded: false
      }
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(1);
    const resultPropertyElement = propertiesElement[0];

    const resultsKeyElement = resultPropertyElement.querySelector('.key');
    const resultsValueElement = resultPropertyElement.querySelector('.value');

    expect(resultsKeyElement).toHaveText('results:');
    expect(resultsValueElement).toHaveText('[ 2 Items ]');

    let expandedObjectElement = resultPropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).not.toExist();

    // Trigger change to expand results property element
    const resultsRecordElement = resultPropertyElement.querySelector('.record')!;

    spectator.click(resultsRecordElement);

    // Now the expanded object should be displayed and it should be recursive
    expandedObjectElement = resultPropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).toExist();

    const childPropertiesElement = expandedObjectElement!.querySelectorAll('.property');
    expect(childPropertiesElement.length).toEqual(2);

    // Check if record summary is correct
    const resultChildPropertyKeyElement = childPropertiesElement[0].querySelector('.key');
    const resultChildPropertyValueElement = childPropertiesElement[0].querySelector('.value');

    expect(resultChildPropertyValueElement).toExist();
    expect(resultChildPropertyKeyElement).toExist();

    expect(resultChildPropertyKeyElement).toHaveText('Item 0:');
    expect(resultChildPropertyValueElement).toHaveText('{ 1 Key }');
  });
  test('should display array fields with correct style', () => {
    const inputJson = JSON.parse('{"results":[{"name": "Test Item 1"}, {"name": "Test Item 2"}]}');

    spectator = createHost(`<htc-json-viewer [json]="json" ></htc-json-viewer>`, {
      hostProps: {
        json: inputJson
      }
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(5);
    const resultPropertyElement = propertiesElement[0];

    const resultsKeyElement = resultPropertyElement.querySelector('.key');
    const resultsValueElement = resultPropertyElement.querySelector('.value');

    expect(resultsKeyElement).toHaveText('results:');
    expect(resultsValueElement).toHaveText('[ 2 Items ]');

    // The exapnded object should be displayed and it should be recursively displayed
    const expandedObjectElement = resultPropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).toExist();

    const childPropertiesElement = expandedObjectElement!.querySelectorAll('.property');
    expect(childPropertiesElement.length).toEqual(4);

    // Check if record summary is correct
    const resultChildPropertyKeyElement = childPropertiesElement[0].querySelector('.key');
    const resultChildPropertyValueElement = childPropertiesElement[0].querySelector('.value');

    expect(resultChildPropertyValueElement).toExist();
    expect(resultChildPropertyKeyElement).toExist();

    expect(resultChildPropertyKeyElement).toHaveText('Item 0:');
    expect(resultChildPropertyValueElement).toHaveText('{ 1 Key }');
  });

  test('should display object fields with correct style', () => {
    const inputJson = JSON.parse('{"employee":{"name": "Test 1", "id": "12345"}}');

    spectator = createHost(`<htc-json-viewer></htc-json-viewer>`);
    spectator.setInput({
      json: inputJson
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(3);
    const employeePropertyElement = propertiesElement[0];

    const employeeKeyElement = employeePropertyElement.querySelector('.key');
    const employeeValueElement = employeePropertyElement.querySelector('.value');

    expect(employeeKeyElement).toHaveText('employee:');
    expect(employeeValueElement).toHaveText('{ 2 Keys }');

    // The exapanded object should be displayed and it should be recursively displayed
    const expandedObjectElement = employeePropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).toExist();

    const childPropertiesElement = expandedObjectElement!.querySelectorAll('.property');
    expect(childPropertiesElement.length).toEqual(2);

    // Check if record summary is correct
    const employeeNameChildPropertyKeyElement = childPropertiesElement[0].querySelector('.key');
    const employeeNameChildPropertyValueElement = childPropertiesElement[0].querySelector('.value');

    expect(employeeNameChildPropertyKeyElement).toExist();
    expect(employeeNameChildPropertyValueElement).toExist();

    // Following should fail as properties are sorted
    expect(employeeNameChildPropertyKeyElement).not.toHaveText('name:');
    expect(employeeNameChildPropertyValueElement).not.toHaveText('"Test 1"');

    // This should not fail
    expect(employeeNameChildPropertyKeyElement).toHaveText('id:');
    expect(employeeNameChildPropertyValueElement).toHaveText('"12345"');

    // Check if record summary is correct
    const employeeIdChildPropertyKeyElement = childPropertiesElement[1].querySelector('.key');
    const employeeIdChildPropertyValueElement = childPropertiesElement[1].querySelector('.value');

    expect(employeeIdChildPropertyKeyElement).toExist();
    expect(employeeIdChildPropertyValueElement).toExist();

    expect(employeeIdChildPropertyKeyElement).toHaveText('name:');
    expect(employeeIdChildPropertyValueElement).toHaveText('"Test 1"');
  });

  test('should display object fields with correct style and no default expansion', () => {
    const inputJson = JSON.parse('{"employee":{"name": "Test 1", "id": "12345"}}');

    spectator = createHost(`<htc-json-viewer [json]="json" [showExpanded]="showExpanded"></htc-json-viewer>`, {
      hostProps: {
        json: inputJson,
        showExpanded: false
      }
    });

    const propertiesElement = spectator.queryAll<HTMLElement>('.property');
    expect(propertiesElement.length).toEqual(1);
    const employeePropertyElement = propertiesElement[0];

    const employeeKeyElement = employeePropertyElement.querySelector('.key');
    const employeeValueElement = employeePropertyElement.querySelector('.value');

    expect(employeeKeyElement).toHaveText('employee:');
    expect(employeeValueElement).toHaveText('{ 2 Keys }');

    let expandedObjectElement = employeePropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).not.toExist();

    // Trigger change to expand results property element
    const resultsRecordElement = employeePropertyElement.querySelector('.record')!;

    spectator.click(resultsRecordElement);

    // Now the exapanded object should be displayed and it should be recursive
    expandedObjectElement = employeePropertyElement.querySelector('.expanded-object');
    expect(expandedObjectElement).toExist();

    const childPropertiesElement = expandedObjectElement!.querySelectorAll('.property');
    expect(childPropertiesElement.length).toEqual(2);

    // Check if record summary is correct
    const employeeNameChildPropertyKeyElement = childPropertiesElement[0].querySelector('.key');
    const employeeNameChildPropertyValueElement = childPropertiesElement[0].querySelector('.value');

    expect(employeeNameChildPropertyKeyElement).toExist();
    expect(employeeNameChildPropertyValueElement).toExist();

    // Following should fail as properties are sorted
    expect(employeeNameChildPropertyKeyElement).not.toHaveText('name:');
    expect(employeeNameChildPropertyValueElement).not.toHaveText('"Test 1"');

    // This should not fail
    expect(employeeNameChildPropertyKeyElement).toHaveText('id:');
    expect(employeeNameChildPropertyValueElement).toHaveText('"12345"');

    // Check if record summary is correct
    const employeeIdChildPropertyKeyElement = childPropertiesElement[1].querySelector('.key');
    const employeeIdChildPropertyValueElement = childPropertiesElement[1].querySelector('.value');

    expect(employeeIdChildPropertyKeyElement).toExist();
    expect(employeeIdChildPropertyValueElement).toExist();

    expect(employeeIdChildPropertyKeyElement).toHaveText('name:');
    expect(employeeIdChildPropertyValueElement).toHaveText('"Test 1"');
  });
});
