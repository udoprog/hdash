import { field, clone, TypeField, ArrayType } from 'mapping';

// TODO: change to something better;
var randomId = 0;

export class DataSource {
  @field() query: string;
}

export class DataSourceReference {
  @field() id: string;
}

export class Visualization {
  /**
   * Either an embedded data source, or a reference to one.
   */
  @field({
    type: new TypeField([
      { type: 'reference', target: DataSourceReference },
      { type: 'immediate', target: DataSource }
    ])
  })
  datasource: DataSourceReference | DataSource;
}

export class LayoutEntry {
  @field()
  i: string;
  @field()
  x: number;
  @field()
  y: number;
  @field()
  w: number;
  @field()
  h: number;
}

export class Component {
  @field()
  id: string;
  @field()
  title: string;
}

export class Dashboard {
  @field()
  id: string;
  @field()
  title: string;
  @field()
  metadata: { [key: string]: string; };
  @field({ type: new ArrayType(Component) })
  components: Component[];
  @field()
  layout: Array<LayoutEntry>;

  public withNewComponent(): Dashboard {
    const newComponents = this.components.slice();
    newComponents.push({id: (randomId++).toString(), title: ""});

    const newInstance = clone(this, Dashboard);
    newInstance.components = newComponents;
    return newInstance;
  }

  public withLayout(layout: Array<LayoutEntry>): Dashboard {
    const newInstance = clone(this, Dashboard);
    newInstance.layout = layout;
    return newInstance;
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
