import React from 'react';
import { Grid, Row, Col, Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import { PagesContext, DatabaseContent } from 'api/interfaces';
import { RouteComponentProps } from 'react-router';
import { encode, decode } from 'mapping';
import { Optional, of, absent } from 'optional';

interface Params {
  id: string
}

interface Props extends RouteComponentProps<Params, {}> {
}

interface State {
  importFiles: Optional<any>;
  importError: Optional<string>;
}

export default class DashboardPage extends React.Component<Props, State> {
  context: PagesContext;
  importForm: FormControl;
  exportLink: HTMLAnchorElement;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    router: React.PropTypes.any
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      importFiles: absent<any>(),
      importError: absent<any>()
    };
  }

  public render() {
    const { importError } = this.state;

    const importState = importError.map(_ => 'error').orElse('success') as "error" | "success";

    const importHelp = importError.map(e => <HelpBlock>{e}</HelpBlock>).get();

    return (
      <Grid>
        <h2>Admin</h2>

        <Row>
          <Col sm={12}>
            <h4>Import/Export</h4>

            <p>
              Import and export the state of the database as JSON.
            </p>

            <Row>
              <Col sm={6}>
                <FormGroup validationState={importState}>
                  <ControlLabel>Import</ControlLabel>
                  <FormControl ref={(form: FormControl) => this.importForm = form} type="file" bsClass="btn btn-default" onChange={e => this.setImportFiles(e)}></FormControl>

                  <FormControl.Static>
                    <Button disabled={!this.state.importFiles.present} onClick={() => this.import()} bsStyle="primary">Import</Button>
                  </FormControl.Static>

                  {importHelp}
                </FormGroup>
              </Col>

              <Col sm={6}>
                <FormGroup>
                  <ControlLabel>Export</ControlLabel>
                  <FormControl.Static>
                    <Button onClick={() => this.export()} bsStyle="primary">Export</Button>
                    <a ref={a => this.exportLink = a}></a>
                  </FormControl.Static>
                </FormGroup>
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    );
  }

  private import() {
    this.state.importFiles.accept(target => {
      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          try {
            const content = decode(JSON.parse(e.target.result), DatabaseContent);
            this.context.db.import(content).then(resolve, reject);
          } catch (e) {
            reject(e);
          }
        };

        reader.readAsText(target.files[0]);
      });

      promise.then(() => {
        this.setState({ importFiles: absent<any>() }, () => {
          target.value = "";
        });
      }, (e: any) => {
        this.setState({ importError: of(String(e)) })
      })
    });
  }

  private setImportFiles(e: any) {
    this.setState({ importFiles: of(e.target), importError: absent<string>() });
  }

  private export() {
    this.context.db.export().then(content => {
      const encoded = encode(content, DatabaseContent);
      var blob = new Blob([JSON.stringify(encoded, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);

      this.exportLink.href = url;
      this.exportLink.download = "hdash.json";
      this.exportLink.click();
    });
  }
}
