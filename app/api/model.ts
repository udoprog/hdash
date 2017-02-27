import { decode, field, clone, TypeField, ArrayField } from 'mapping';
import { Optional, ofNullable } from 'optional';

// TODO: change to something better;
var randomId = 0;

export interface DataSource {
}

export class DataSourceData implements DataSource {
  @field()
  readonly query: string;

  constructor(values: any) {
    this.query = values.query;
  }

  static type = 'embedded';
}

export class DataSourceReference implements DataSource {
  @field()
  readonly id: string;

  constructor(values: any) {
    this.id = values.id;
  }

  static type = 'reference';
}

export const DataSourceType = TypeField.of<DataSource>([DataSourceData, DataSourceReference]);

export interface Visualization {
  typeTitle(): string;
}

export class BarChart implements Visualization {
  typeTitle(): string {
    return "Bar Chart";
  }

  static type = "bar-chart";
}

export class VisualizationReference implements Visualization {
  @field()
  readonly id: string;

  constructor(values: any) {
    this.id = values.id;
  }

  typeTitle(): string {
    return "Reference title";
  }

  static type = 'reference';
}

export const VisualizationType = TypeField.of<Visualization>([BarChart, VisualizationReference]);

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
  @field()
  readonly showTitle: boolean;
  @field({ type: VisualizationType })
  visualization: Visualization;
  /**
   * Either an embedded data source, or a reference to one.
   */
  @field({ type: DataSourceType })
  datasource: DataSourceReference | DataSourceData;

  constructor(values: any) {
    this.id = values.id;
    this.title = values.title;
    this.showTitle = values.showTitle;
    this.visualization = values.visualization;
    this.datasource = values.datasource;
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

  public getLayout(id: string): Optional<LayoutEntry> {
    return ofNullable(this.layout.find(c => c.i === id));
  }

  public withNewComponent(): Dashboard {
    const newComponents = this.components.slice();
    const layout = this.layout.slice();

    const newComponent = decode({
      id: (randomId++).toString(),
      title: "",
      showTitle: true,
      visualization: {
        type: 'bar-chart'
      },
      datasource: {
        type: 'embedded',
        query: ""
      }
    }, Component);

    newComponents.push(newComponent);

    layout.push(decode({
      i: newComponent.id,
      x: 0,
      y: 0,
      w: 6,
      h: 2,
    }, LayoutEntry));

    return clone(this, {
      components: newComponents,
      layout: layout
    });
  }

  public withoutComponent(component: Component) {
    const components = this.components.slice().filter(c => c.id !== component.id);
    return clone(this, { components: components });
  }

  public withReplacedComponent(component: Component) {
    const components = this.components.slice().map(c => {
      if (c.id === component.id) {
        return component;
      }

      return c;
    });

    return clone(this, { components: components });
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
