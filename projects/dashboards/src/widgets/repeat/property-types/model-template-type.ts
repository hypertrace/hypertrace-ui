import { Injectable } from '@angular/core';
import { ModelJson, ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { ModelPropertyTypeService } from '@hypertrace/hyperdash-angular';

@Injectable({
  providedIn: 'root'
})
export class ModelTemplatePropertyType implements ModelPropertyTypeRegistrationInformation<ModelJson, ModelJson> {
  public static readonly TYPE: string = 'model-template';
  public readonly type: string = ModelTemplatePropertyType.TYPE;

  public constructor(private readonly modelPropertyType: ModelPropertyTypeService) {}

  public validator(value: unknown, allowUndefinedOrNull: boolean): string | undefined {
    // Same validation as a regular model property
    return this.modelPropertyType.validator(value, allowUndefinedOrNull);
  }

  public serializer(value: ModelJson): ModelJson {
    return value;
  }

  public deserializer(value: ModelJson): ModelJson {
    return value;
  }
}
