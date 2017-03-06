import * as React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

interface Instance {
  type: string;
}

interface Model {
  type: string;
  font: string;
  description: string;
}

interface Props extends ButtonProps {
  instance: Instance;
  model: Model;
  onChangeType: () => void;
}

export default class VisTypeButton extends React.Component<Props, {}> {
  public render() {
    const { instance, model, onChangeType, onClick, ...extra } = this.props;

    return (
      <Button
        active={instance.type === model.type}
        onClick={(_: any) => {
          onChangeType()
        }}
        {...extra}
      >
        <FontAwesome name={model.font} />
        <span className='icon-text hidden-xs'>{model.description}</span>
      </Button>
    );
  }
}
