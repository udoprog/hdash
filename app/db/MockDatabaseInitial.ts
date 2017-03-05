import { DatabaseContent } from 'api/interfaces';
import { decode } from 'mapping';
import { DEFAULT_PADDING, DEFAULT_GRID_LINE_SPACE } from 'api/model';

const dashboards: any = {
  "a": {
    id: "a",
    title: "Simple Title",
    metadata: { owner: "foo" },
    range: {
      start: { type: 'start-of', unit: 'hours', offset: { unit: 'hours', value: 10 } },
      end: { type: 'now' }
    },
    components: [],
    layout: []
  },
  "d": {
    id: "d",
    title: "Has Visualization",
    metadata: { owner: "bar", relation: "loose" },
    range: {
      start: { type: 'start-of', unit: 'hours', offset: { unit: 'hours', value: 10 } },
      end: { type: 'now' }
    },
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
    type: "line-chart",
    zeroBased: false,
    stacked: false,
    padding: DEFAULT_PADDING,
    gridLineSpace: DEFAULT_GRID_LINE_SPACE,
    gap: 5,
    dataSource: { type: "reference", id: "datasource" }
  },
  "vis2": {
    type: "bar-chart",
    stacked: true,
    padding: DEFAULT_PADDING,
    gridLineSpace: DEFAULT_GRID_LINE_SPACE,
    gap: 5,
    dataSource: { type: "embedded", query: "average(size=1h) by role" }
  }
};

const dataSources: any = {
  "datasource": {
    query: "average(size=1h) by role"
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
