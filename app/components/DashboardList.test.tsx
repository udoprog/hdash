import * as React from 'react';
import * as ReactTestUtils from 'react-addons-test-utils';

import DashboardList from './DashboardList';

describe('DashboardList', () => {
  it("should do shit", () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<DashboardList dashboards={[]} onAddMetadataFilter={() => null} onToggleStarred={() => null} />);
    renderer.getRenderOutput();
  });
});
