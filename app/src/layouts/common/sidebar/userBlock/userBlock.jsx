/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { URLS } from 'common/urls';
import { userInfoSelector, photoTimeStampSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { API_PAGE, ADMINISTRATE_PAGE, USER_PROFILE_PAGE } from 'controllers/pages/constants';
import { HEADER_EVENTS } from 'components/main/analytics/events';
import { NavLink } from 'components/main/navLink';
import { Image } from 'components/main/image';
import styles from './userBlock.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    user: userInfoSelector(state),
    photoTimeStamp: photoTimeStampSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
@track()
export class UserBlock extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    user: PropTypes.object,
    photoTimeStamp: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    user: {},
    photoTimeStamp: null,
  };
  state = {
    menuOpened: false,
  };

  controlNode = null;

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  onClickLink = (eventInfo) => {
    this.props.tracking.trackEvent(eventInfo);
  };

  onClickLogout = () => {
    this.props.logout();
    this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_LOGOUT_LINK);
  };

  handleOutsideClick = (e) => {
    if (this.controlNode && !this.controlNode.contains(e.target) && this.state.menuOpened) {
      this.setState({ menuOpened: false });
    }
  };

  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
    !this.state.menuOpened && this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROFILE_DROPDOWN);
  };

  render() {
    return (
      <div className={cx('user-block')}>
        <Manager>
          <Reference>
            {({ ref }) => (
              <div
                ref={(node) => {
                  ref(node);
                  this.controlNode = node;
                }}
                className={cx('avatar-wrapper', 'main')}
                onClick={this.toggleMenu}
              >
                <Image
                  className={cx('avatar')}
                  src={URLS.dataPhoto(this.props.photoTimeStamp, true)}
                  alt="avatar"
                  fallback={DefaultUserImage}
                />
              </div>
            )}
          </Reference>
          {this.state.menuOpened && (
            <Popper placement="right-end" eventsEnabled={false}>
              {({ ref, style, placement }) => (
                <div className={cx('menu')} ref={ref} style={style} data-placement={placement}>
                  <div className={cx('user-wrapper')}>
                    <div className={cx('avatar-wrapper')}>
                      <Image
                        className={cx('avatar')}
                        src={URLS.dataPhoto(this.props.photoTimeStamp, true)}
                        alt="avatar"
                        fallback={DefaultUserImage}
                      />
                    </div>
                    <div className={cx('details')}>
                      {this.props.user.userRole === ADMINISTRATOR && (
                        <div className={cx('admin-badge')}>
                          <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
                        </div>
                      )}
                      <div className={cx('username')}>{this.props.user.userId}</div>
                    </div>
                  </div>
                  <NavLink
                    to={{ type: USER_PROFILE_PAGE }}
                    className={cx('menu-item')}
                    activeClassName={cx('active')}
                    onClick={() => this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROFILE_LINK)}
                  >
                    <FormattedMessage id={'UserBlock.profile'} defaultMessage={'Profile'} />
                  </NavLink>
                  {this.props.user.userRole === ADMINISTRATOR && (
                    <NavLink
                      to={{ type: ADMINISTRATE_PAGE }}
                      className={cx('menu-item')}
                      activeClassName={cx('active')}
                      onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_ADMINISTRATE_LINK)}
                    >
                      <FormattedMessage
                        id={'UserBlock.administrate'}
                        defaultMessage={'Administrate'}
                      />
                    </NavLink>
                  )}
                  <NavLink
                    to={{ type: API_PAGE }}
                    className={cx('menu-item')}
                    activeClassName={cx('active')}
                    onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_API_LINK)}
                  >
                    API
                  </NavLink>
                  <div className={cx('menu-item')} onClick={this.onClickLogout}>
                    <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Logout'} />
                  </div>
                  <div className={cx('menu-arrow')} />
                </div>
              )}
            </Popper>
          )}
        </Manager>
      </div>
    );
  }
}
