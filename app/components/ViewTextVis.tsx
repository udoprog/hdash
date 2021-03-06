import * as React from 'react';
import { TextVis, VisualOptions } from 'api/model';
import { makeHtml } from 'markdown-js';

interface Props {
  textVis: TextVis;
  options: VisualOptions;
}

export default class ViewTextVis extends React.Component<Props, {}> {
  div?: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.div = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    this.div.innerHTML = makeHtml(nextProps.textVis.content);
  }

  public componentDidMount() {
    this.div.innerHTML = makeHtml(this.props.textVis.content);
  }

  public render(): JSX.Element {
    const { height } = this.props.options;

    return (
      <div className='text-vis' ref={div => this.div = div} style={{ height: height }} />
    );
  }
}