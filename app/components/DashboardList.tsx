import * as React from 'react';
import { Link } from 'react-router';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { DashboardEntry } from 'api/interfaces';

interface Props {
  dashboards: DashboardEntry[];
  onAddMetadataFilter: (key: string, value: string) => void;
}

export default class DashboardList extends React.PureComponent<Props, {}> {
  public render() {
    const {dashboards, onAddMetadataFilter} = this.props;

    return (
      <ListGroup>
        {dashboards.map((d, i) => {
          return (
            <ListGroupItem key={i}>
              <h4>
                <Link to={`/dashboard/${d.id}`}>{d.title}</Link>

                <div className="pull-right">
                  {Object.keys(d.metadata).map((k, ki) => {
                    const v = d.metadata[k];
                    return <Button className="btn-space" onClick={() => onAddMetadataFilter(k, v)} bsStyle="primary" bsSize="xs" key={ki}>
                      {k}:{v}
                    </Button>;
                  })}
                </div>
              </h4>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    );
  }
}