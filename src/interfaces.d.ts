// services
declare namespace interfaces {
  interface Backend {
    search(): Promise<DashboardResult[]>;
  }
}

declare namespace interfaces {
  interface Filter {
    render(): any;
  }

  interface DashboardResult {
    id: string,
    title: string,
    metadata: { [key:string]:string; }
  }

  interface PagesContext {
    db: Backend
  }
}

export = interfaces;
