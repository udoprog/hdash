import { DatabaseContent } from 'api/interfaces';
import { decode } from 'mapping';

const dashboards: any = {
  "a": {
    id: "a",
    title: "Simple Title",
    metadata: { owner: "foo" },
    components: [],
    layout: []
  },
  "b": {
    id: "b",
    title: "Complex Title",
    metadata: { owner: "foo", relation: "tough" },
    components: [],
    layout: []
  },
  "c": {
    id: "c",
    title: "Foo Title",
    metadata: { owner: "bar" },
    components: [],
    layout: []
  },
  "d": {
    id: "d",
    title: "Has Visualization",
    metadata: { owner: "bar", relation: "loose" },
    components: [
      {
        id: "a",
        title: "Bar Chart (Referenced)",
        showTitle: true,
        visualization: { type: "reference", id: "vis1" }
      },
      {
        id: "b",
        title: "Bar Chart (Embedded)",
        showTitle: true,
        visualization: { type: "reference", id: "vis2" }
      }
    ],
    layout: [
      { i: "a", x: 0, y: 0, w: 6, h: 2 },
      { i: "b", x: 6, y: 0, w: 6, h: 2 }
    ]
  }
};

const starred: any = {
  "a": true
};

const visualizations: any = {
  "vis1": {
    type: "bar-chart",
    stacked: false,
    gap: 5,
    dataSource: { type: "reference", id: "datasource" }
  },
  "vis2": {
    type: "bar-chart",
    stacked: false,
    gap: 5,
    dataSource: { type: "embedded", query: "average(size=1h) by role from points(1d)" }
  }
};

const dataSources: any = {
  "datasource": {
    query: "average(size=1h) by role from points(1d)"
  }
};

const user = { name: "John Doe", email: "john@doe.com" };

const content = decode({
  dashboards: dashboards,
  starred: starred,
  visualizations: visualizations,
  dataSources: dataSources,
  user: user
}, DatabaseContent);

export default content;
