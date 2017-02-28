import React from 'react';
import { BarChart, VisualOptions } from 'api/model';
import { Chart } from 'chart.js';

const DEFAULT_HEIGHT = 300;

const DATA = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [{
    label: '# of Votes',
    data: [12, 19, 3, 5, 2, 3],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
      'rgba(255,99,132,1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
  }]
};

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }]
  }
};

interface Props {
  barChart: BarChart; 
  visualOptions: VisualOptions;
}

export default class ViewBarChart extends React.Component<Props, {}> {
  refs: {
    canvas: any;
  }

  chart?: Chart;

  public componentDidUpdate() {
    if (this.chart) {
      this.chart.resize();
    }
  }

  public componentDidMount() {
    this.chart = new Chart(this.refs.canvas, { type: 'bar', data: DATA, options: OPTIONS });
  }

  public componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  public render() {
    const { visualOptions } = this.props;
    const { height } = visualOptions;

    return (
      <canvas ref="canvas" width="100%" height={height || DEFAULT_HEIGHT} />
    );
  }
};
