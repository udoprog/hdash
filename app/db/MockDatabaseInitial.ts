import * as interfaces from 'api/interfaces';
import { clone } from 'mapping';
import * as model from 'api/model';
import * as instant from 'instant';
import * as unit from 'unit';

const RANGE = new model.Range({
  start: new instant.StartOf({ unit: unit.Hours, offset: new instant.Duration({ unit: unit.Hours, value: 12 }) }),
  end: new instant.Now({})
});

const dashboards: { [key: string]: model.Dashboard } = {
  "a": new model.Dashboard({
    id: "a",
    title: "Simple Title",
    metadata: { owner: "foo" },
    range: RANGE,
    components: [],
    layout: []
  }),
  "d": new model.Dashboard({
    id: "d",
    title: "Has Visualization",
    metadata: { owner: "bar", relation: "loose" },
    range: RANGE,
    components: [
      new model.Component({
        id: "a",
        title: "Bar Chart (Referenced)",
        visualization: new model.ReferenceVis({ type: "reference", id: "vis1" })
      }),
      new model.Component({
        id: "b",
        title: "Bar Chart (Embedded)",
        visualization: new model.ReferenceVis({ type: "reference", id: "vis2" })
      })
    ],
    layout: [
      { i: "a", x: 0, y: 0, w: 6, h: 2 },
      { i: "b", x: 6, y: 0, w: 6, h: 2 }
    ]
  })
};

const starred: any = {
  "a": true
};

const visualizations: { [key: string]: model.Vis } = {
  "vis1": clone(model.DEFAULT_BAR_CHART, { dataSource: new model.ReferenceDataSource({ id: 'datasource' }) }),
  "vis2": clone(model.DEFAULT_LINE_CHART, { dataSource: new model.EmbeddedDataSource({ query: "average by role" }) }),
};

const dataSources: { [key: string]: model.EmbeddedDataSource } = {
  "datasource": new model.EmbeddedDataSource({
    query: "average by role"
  })
};

const user = new interfaces.User({ name: "John Doe", email: "john@doe.com" });

export default new interfaces.DatabaseContent({
  dashboards: dashboards,
  starred: starred,
  visualizations: visualizations,
  dataSources: dataSources,
  user: user
});