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
        id: "some",
        title: "A title",
        showTitle: true,
        visualization: { type: "reference", id: "vis1" }
      }
    ],
    layout: [
      { i: "some", x: 0, y: 0, w: 6, h: 2 }
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
    dataSource: { type: "reference", id: "datasource" }
  }
};

const dataSources: any = {
  "datasource": {
    query: "average by host"
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
