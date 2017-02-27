import { decode, field, clone, TypeField, ArrayField } from 'mapping';
import { Optional, ofNullable } from 'optional';

// TODO: change to something better;
var randomId = 0;

export class DataSource {
  @field()
  readonly query: string;

  constructor(values: any) {
    this.query = values.query;
  }

  static visualizationType: string = 'embedded';
}

export class DataSourceReference {
  @field()
  readonly id: string;

  constructor(values: any) {
    this.id = values.id;
  }

  static visualizationType: string = 'reference';
}

export class Visualization {
  /**
   * Either an embedded data source, or a reference to one.
   */
  @field({
    type: new TypeField(
      input => (<any>input).constructor.visualizationType,
      [
        { type: 'reference', target: DataSourceReference },
        { type: 'embedded', target: DataSource }
      ]
    )
  })
  datasource: DataSourceReference | DataSource;

  constructor(values: any) {
    this.datasource = values.datasource;
  }

  static componentType: string = 'embedded';
}

export class VisualizationReference {
  @field()
  readonly id: string;

  constructor(values: any) {
    this.id = values.id;
  }

  static componentType: string = 'reference';
}

export class LayoutEntry {
  @field()
  readonly i: string;
  @field()
  readonly x: number;
  @field()
  readonly y: number;
  @field()
  readonly w: number;
  @field()
  readonly h: number;

  constructor(values: any) {
    this.i = values.i;
    this.x = values.x;
    this.y = values.y;
    this.w = values.w;
    this.h = values.h;
  }
}

export class Component {
  @field()
  readonly id: string;
  @field()
  readonly title: string;
  @field({
    type: new TypeField(
      input => (<any>input).constructor.visualizationType,
      [
        { type: VisualizationReference.componentType, target: VisualizationReference },
        { type: Visualization.componentType, target: Visualization }
      ]
    )
  })
  visualization: VisualizationReference | Visualization;

  constructor(values: any) {
    this.id = values.id;
    this.title = values.title;
    this.visualization = values.visualization;
  }
}

export class Dashboard {
  @field()
  readonly id: string;
  @field()
  readonly title: string;
  @field()
  readonly metadata: { [key: string]: string; };
  @field({ type: new ArrayField(Component) })
  readonly components: Component[];
  @field()
  readonly layout: Array<LayoutEntry>;

  constructor(values: any) {
    this.id = values.id;
    this.title = values.title;
    this.metadata = values.metadata;
    this.components = values.components;
    this.layout = values.layout;
  }

  public getComponent(id: string): Optional<Component> {
    return ofNullable(this.components.find(c => c.id === id));
  }

  public withNewComponent(): Dashboard {
    const newComponents = this.components.slice();

    newComponents.push(decode({
      id: (randomId++).toString(), title: "", visualization: {
        type: 'embedded',
        datasource: {
          type: 'embedded',
          query: ""
        }
      }
    }, Component));

    return clone(this, { components: newComponents });
  }

  public withLayout(layout: Array<LayoutEntry>): Dashboard {
    return clone(this, { layout: layout });
  }
}

export class DashboardEntry {
  @field()
  id: string;
  @field()
  title: string;
  @field()
  metadata: { [key: string]: string; };
  @field()
  starred: boolean;
}
