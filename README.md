<p align="center">
  <a href="https://github.com/hypertrace/hypertrace-ui">
    <img src="https://avatars.githubusercontent.com/u/65374698?s=200&v=4" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Hypertrace-UI</h3>
  <p align="center">
    User interface for an open source distributed tracing & observability platform!
    <br />
    <a href="https://docs.hypertrace.org"><strong>More about hypertrace »</strong></a>
    <br />
  </p>
</p>

## Table of Contents

- [Setup](#setup)
- [Technologies](#technologies)
- [Code Architecture](#code-architecture)
- [The Essentials](#the-essentials)
  - [Angular Specifics](#angular-specifics)
  - [Tables](#tables)
    - [Cell Renderers](#cell-renderers)
  - [Dashboards](#dasboards)
    - [Widget](#widget)
    - [Widget Renderer](#widget-renderer)
    - [Data Source](#data-source)
  - [Graphql Handlers](#graphql-handlers)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Contributions](#contributions)
- [Others](#others)
  - [Building Image locally](#building-image-locally)
  - [Docker Image Source](#docker-image-source)

## Setup

Install `Node` and `npm`, if not done already ([Node and Npm](https://www.npmjs.com/get-npm)). Recommended node version is `16+`.<br />
[Fork](<(https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)>) or clone the repository and Use following commands.

```sh
cd <dir_path>
npm ci
```

once done, start a development server

```sh
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To run unit test cases (execute the unit tests via Jest)

```sh
npm run test
```

## Technologies

Hypertrace-ui uses `angular` as the framework. On top of angular, following technologies are being used.

1. `Typescript` : As a core language, hypertrace-ui uses typescript instead of traditional javascript. Learn more about Typescript [here](https://www.typescriptlang.org/docs/)
2. `RxJS` : For reactive programming, hypertrace-ui uses RxJs library. Learn more about RxJs [here](https://rxjs.dev/api)
3. `D3.js` : Charts are the core part for hypertrace-ui. Charts are custom build here and use D3.js library. Learn more about D3.js [here](https://d3js.org/)
4. `Spectator`: For unit testing, hypertrace-ui uses spectator library. Learn more about Spectator [here](https://github.com/ngneat/spectator)
5. `Hyperdash & Hyperdash-Angular`: Hyperdash is dashboarding framework/library and hyperdash-angular is a wrapper, specific to angular. Learn more about dasboards in [dashboards](#dashboards) section.

## Code Architecture

Hypertrace-UI code is divided into many smaller projects which gives the code base a better structure. Here are the projects.

1. `Assest Library` : This consists of the assets which are being used in the application. For example; images, icons etc. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/assets-library)
2. `Common` : This consists of the common code/features such as application constants, colors, telemetry, utilities (with common angular pipes) etc. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/common)
3. `Components` : Hypertrace-ui has a wide variety of custom made angular components. This is the place for generic components (eg. `Input` Component) and directives(eg. `LoadAsync` Directive). Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/components)
4. `Dashboards` : This consists of the common code for dashboards such as base model, properties etc. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/dashboards)
5. `Graphql-Client` : Hypertrace-ui uses [apollo graphql](https://www.apollographql.com/) for API calls. This is the place where all the base graphql request related code is present such as graphql arguments, resolvers, builders etc. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/graphql-client)
6. `Observability` : This consists of all the different pages, components, services related to distributed tracing and observability. This project is the home for charts as well. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/observability)
7. `Test Utils` : This consists of some unit test utilities for dashboards etc.. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/projects/test-utils)
8. `UI App` : This is not a project but a entry point for hypertrace-ui app. This consists home page, routes, config module etc. Check this out [here](https://github.com/hypertrace/hypertrace-ui/tree/main/src)

`NOTE` : Each project, consists a barrel file named `public-api.ts`. This handles all the exports at single place which improves the importing in the app.
For example

```ts
@import { Color } from '@hypertrace/common'
```

## The Essentials

Let's talk about the essentials for the development in the hypertrace-ui.

### Angular Specifics

Since hypertrace-ui uses `angular` as core framework, all the concepts specific to angular are being used and applied in hypertrace-ui. Such as `components`, `directives`, `pipes`, `dependency injection`, `services`, `modules`, `lazy loading` etc. Check out the angular [docs](https://angular.io/docs) for more info.

`NOTE` : Test file name ends with `.test.ts` instead of `.spec.ts` for better readability.

### Dashboards

Hypertrace-UI uses dashboards to build custom pages. These dashboards are widely used in the application. These dashboards are build using `Hyperdash` and `Hyperdash-Angular` libraries. Check out both here ([Hyperdash](https://github.com/hypertrace/hyperdash/blob/main/README.md) & [Hyperdash angular](https://github.com/hypertrace/hyperdash-angular/blob/main/README.md))
<br />
Let's check this example.

`in Template`

```html
<ht-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </ht-navigable-dashboard>
```

`in Component`

```ts
public readonly location: string = 'HELLO_LOCATION';
public readonly defaultJson: ModelJson = {
  type: 'hello-widget',
  name: 'name'
  children: [],
  data: {
    'upper-case': false,
    type: 'hello-data-source'
  }
}
```

Now let's break this down.

- It will create a dasboard for an unique location.
- Dasboards are designed in a way that, it takes a modal json as input property and renders the corresponding widgets.
- There are 3 core concepts - widget , widget renderer and data source.

Let's talk about these individually.

#### Widget

To create a widget, we need to create model class.
<br />
Continue with the above `ModelJson`. Let's create `hello-widget.model.ts`

```ts
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'hello-widget'
})
export class HelloWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'name',
    required: false
  })
  public name?: string;
}
```

Now let's break this down.

- We have used decorator `Model` by which we're registering this widget (on build) for usage.
- `type` property is the unique string to define each widget. If we look closely we have used the same string as a type in the model json as well.
- We have used decorator `ModelProperty` for defining the custom properties like in this case `name`.

But the question is how this class will render the dom? let's find out in next section!

#### Widget Renderer

Now after creating the widget model, let's create widget renderer component.
<br />
Using the same example. Let's create `hello-widget-renderer.component.ts

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { HelloWidgetModel } from './hello-widget.model';

@Renderer({ modelClass: HelloWidgetModel })
@Component({
  selector: 'ht-hello-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div *htLoadAsync="this.data$ as data">{{ data }} {{ this.model.name }}</div> `
})
export class HelloWidgetRendererComponent extends WidgetRenderer<HelloWidgetModel> {
  protected fetchData(): Observable<string> {
    return this.api.getData();
  }
}
```

Now let's break this down.

- We have used decorator `Renderer` by which we're registering this widget renderer (on build) for usage.
- `modelClass` property is the same class for which we're building this renderer, inour case it is `HelloWidgetModel`.
- Now after extending the `WidgetRenderer` class, we have the access of `name` property which we defined in the model class.
- `fetchData` method is used to give us the access of `this.data$` observable.
- `htLoadAsync` directive is used to resolve the data observable, which can be done with `async` pipe as well.

How are we getting data? Now let's understand this in the next section.

#### Data Source

Now after creating the widget renderer we need the data which we are using in the renderer component.
<br />
Continue with the above `ModelJson`. Let's create `hello-data-source.model.ts`

```ts
import { Model, ModelProperty, STRING_PROPERTY} from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';

@Model({
  type: 'hello-data-source'
})
export class HelloDataSourceModel {
  @ModelProperty({
    key: 'upper-case',
    required: false,
    type: STRING_PROPERTY.type
  })
  public upperCase: boolean = false;

  public getData(): Observable<string> {
    return of(this.upperCase ? 'HELLO' ? 'Hello')
  }
}
```

Now let's break this down.

- We have used decorator `Model` by which we're registering this data source (on build) for usage.
- `type` property is the unique string to define each data source. If we look closely we have used the same string as a type in the model json as well for key `data`.
- We have used decorator `ModelPropery` for defining the custom properties like in this case `upper-case`.
- We have implemented `getData` Method, and the same menthod we're using in the renderer component `return this.api.getData()`.

Now after implemening all this we can use these as shown above and render the custom data.

_Why we're doing this_? Answer is simple, once we do all this now, we can just write few lines we can render whole widget. This can be used at any place now with just few lines of code. This is a simple example foe more complex examples please check `home.dashboard.ts` and underlying all the widgets.

### Tables

Table is custom component in the hypertrace-ui. The following example shows how to add table inside another component.
<br />
Here is what table API Says:

```ts
@Input()
public data?: TableDataSource<TableRow>;
```

```ts
@Input()
public columnConfigs?: TableColumnConfig[];
```

So Let's use this.
`in Template`

```html
<ht-table [data]="this.datasource" [columnConfigs]="this.columnConfigs"> </ht-table>
```

`in Component`

```ts
public datasource?: TableDataSource<TableRow> = {
  getData : () => of({
    data: [{name: 'test-name1'}, {name: 'test-name2'}],
    totalCount: 2
  })
};
public readonly columnConfigs: TableColumnConfig[] = [
  {
    id: 'name',
    title: 'Name'
    visible: true,
    sortable: false,
    width: '48px',
  }
];
```

Now let's break this down.

- It will create a table with a single column (In column configs we have only mentioned one column) and two rows (in the data source we have mentioned data as array of two objects.).
- Now if we look closely, table column config's id is same as the key we have used the key in data which is `name`. This is must for the table to render the data correctly.

There is a lot there in the tables, like custom controls, configurations (for pagination and many other). We highly recommend you to check out the `table.component.ts` to learn about tables and check out all the different examples present in the application.

#### Cell Renderers

As we have talked about tables, now let's talk about the custom table cell renderers. in hypertrace-ui, we can create a custom table cell renderer to display the data in specifc format. These are nothing but angular component with another decorator `TableCellRenderer`
<br />
Now let's see how we can create a custom cell renderer. for example `hello-table-cell-renderer.component.ts`

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-hello-table-cell-renderer',
  styleUrls: ['./hello-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div>Hello {{ this.value }}</div> `
})
@TableCellRenderer({
  type: 'hello',
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.NoOp
})
export class HelloTableCellRendererComponent extends TableCellRendererBase<string> {}
```

Now let's break this down.

- We have used decorator `TableCellRenderer` by which we're registering this cell renderer (on build) for usage.
- `type` property is the unique string to define each cell renderer.
- `alignment` is used for the cell alignment, could be - left, right and center
- `parser` is used to parse the data. It can also be defined similar to a cell renderer. Suppose we are getting data as `['test1', 'test2']` and we want it to be marshalled into `{value1: 'test1', value2: 'test2'}` then we can create a custom parser and can handle the transformation. For no operation we use `CoreTableCellParserType.NoOp`

`Usage` : Once this is done, we can use this in our table using `display` property. This will be same as the type of the cell renderer.

`Module import`

```ts
TableModule.withCellRenderers([HelloTableCellRendererComponent]);
```

`in Component`

```ts
public readonly columnConfigs: TableColumnConfig[] = [
  {
    id: 'name',
    title: 'Name'
    display: 'hello'
    visible: true,
    sortable: false,
    width: '48px',
  }
];
```

`NOTE`: We highly recommend you to check out all the existing example of table and cell renderers to learn more.

## GraphQl Handlers

There are two type of graphql handlers we use.

1. `Query` : To get the data from server / backend.
2. `Mutation` : For delete, post and put use cases.

Let's see an example of a query graphql-handler:

```ts
import { Injectable } from '@angular/core';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';

@Injectable({ providedIn: 'root' })
export class HelloGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlHelloRequest, GraphQlHelloResponse> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public matchesRequest(request: unknown): request is GraphQlHelloRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlHelloRequest>).requestType === HELLO_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlHelloRequest): GraphQlSelection {
    return {
      path: 'getHello',
      children: [
        {
          path: 'result'
        }
      ]
    };
  }

  public convertResponse(response: ExportSpansResponse): string | undefined {
    return response.result;
  }
}

export const HELLO_GQL_REQUEST = Symbol('GraphQL Hello Request');

export interface GraphQlHelloRequest {
  requestType: typeof HELLO_GQL_REQUEST;
}

export interface GraphQlHelloResponse {
  result: string;
}
```

Let's break this down.

- We have used a unique symbol, as a type for the request.
- Two interfaces `GraphQlHelloRequest` and `GraphQlHelloResponse` for request and response.
- `matchesRequest` method is used to verify the request.
- `convertRequest` method is used for converting request into graphql selection.
- `convertResponse` method is used to convert the response into desired format.

`Usage` : Now once this is done, we can use this in the service/component

`Module import`

```ts
GraphQlModule.withHandlerProviders([HelloGraphQlQueryHandlerService]);
```

`in Component/Service`

```ts
// Injection
private readonly graphQlQueryService: GraphQlRequestService

// Usage
this.graphQlQueryService.query<HelloGraphQlQueryHandlerService>({
  requestType: HELLO_GQL_REQUEST
})
```

## Testing

Testing is an integral part of hypertrace-ui and hypertrace-ui maintains a good amount of code coverage using unit tests! We use `Spectator` library to test components. services, directives, pipes, dashboards etc. We always write `shallow` tests.

## Best Pratices

1. `Naming`: Always write a file and class name which is easy to understand and specific to use case. for example - asynchronous loading -> directive name is `LoadAsyncDirective`. Use `ht` as prefix in component selectors, pipes, directives etc. There is lint rule as well.
2. `Linting`: For a consistent in file code structure, linting is used and a requirement before merging the code.

## Contributions

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## Others

These are some extra things that might be useful.

#### Building Image locally

Hypertrace UI uses gradle to build a docker image. Gradle wrapper is already part of the source code. To build Hypertrace UI image, run:

```sh
./gradlew dockerBuildImages
```

#### Docker Image Source:

- [DockerHub > Hypertrace UI](https://hub.docker.com/r/hypertrace/hypertrace-ui)
