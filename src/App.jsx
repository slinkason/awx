import React, { Component } from 'react';
import { global_breakpoint_md } from '@patternfly/react-tokens';
import {
  Redirect,
  Switch,
  Route,
} from 'react-router-dom';
import {
  Nav,
  NavList,
  Page,
  PageHeader,
  PageSidebar,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';

import api from './api';
import { API_LOGOUT, API_CONFIG } from './endpoints';
import { ConfigContext } from './context';

import HelpDropdown from './components/HelpDropdown';
import LogoutButton from './components/LogoutButton';
import TowerLogo from './components/TowerLogo';
import NavExpandableGroup from './components/NavExpandableGroup';

class App extends Component {
  constructor (props) {
    super(props);

    // initialize with a closed navbar if window size is small
    const isNavOpen = typeof window !== 'undefined'
      && window.innerWidth >= parseInt(global_breakpoint_md.value, 10);

    this.state = {
      isNavOpen,
      config: {},
      error: false,
    };
  };

  onNavToggle = () => {
    this.setState(({ isNavOpen }) => ({ isNavOpen: !isNavOpen }));
  };

  onLogoClick = () => {
    this.setState({
      activeGroup: 'views_group'
    });
  }

  onDevLogout = async () => {
    await api.get(API_LOGOUT);

    this.setState({
      activeGroup: 'views_group',
      activeItem: 'views_group_dashboard',
    });

    window.location.replace('/#/login');
  };

  async componentDidMount() {
    // Grab our config data from the API and store in state
    try {
      const { data } = await api.get(API_CONFIG);
      this.setState({ config: data });
    } catch (error) {
      this.setState({ error });
    }
  }

  render () {
    const { config, isNavOpen } = this.state;
    const {
      render,
      routeGroups = [],
      navLabel = '',
    } = this.props;

    return (
      <ConfigContext.Provider value={config}>
        <Page
          usecondensed="True"
          header={(
            <PageHeader
              showNavToggle
              onNavToggle={() => this.onNavToggle()}
              logo={(
                <TowerLogo
                  onClick={this.onLogoClick}
                />
              )}
              toolbar={(
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <HelpDropdown />
                    </ToolbarItem>
                    <ToolbarItem>
                      <LogoutButton
                        onDevLogout={this.onLogout}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </Toolbar>
              )}
            />
          )}
          sidebar={(
            <PageSidebar
              isNavOpen={isNavOpen}
              nav={(
                <Nav aria-label={navLabel}>
                  <NavList>
                    {routeGroups.map(params => (
                      <NavExpandableGroup key={params.groupId} {...params} />
                    ))}
                  </NavList>
                </Nav>
              )}
            />
          )}
        >
          { render ? render({ routeGroups }) : '' }
        </Page>
      </ConfigContext.Provider>
    );
  }
}

export default App;
