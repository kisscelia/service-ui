/*
 * Copyright 2022 EPAM Systems
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

import React, { useEffect } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  addPatternAction,
  deletePatternAction,
  PAStateSelector,
  updatePAStateAction,
  updatePatternAction,
} from 'controllers/project';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { useIntl } from 'react-intl';
import { Checkbox } from 'componentLibrary/checkbox';
import { Button } from 'componentLibrary/button';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { PatternRuleContent } from '../../elements/patternRuleContent';
import { FieldElement } from '../../elements';
import { RuleList } from '../../elements/ruleList';
import PencilIcon from './img/pencil-inline.svg';
import BinIcon from './img/bin-inline.svg';
import CopyIcon from './img/copy-inline.svg';
import { Layout } from '../../layout';
import { messages } from '../messages';
import styles from './patternAnalysisContent.scss';

const cx = classNames.bind(styles);
const COPY_POSTFIX = '_copy';

export const PatternAnalysisContent = ({
  setHeaderTitleNode,
  onAddPattern,
  patterns,
  disabled,
}) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const PAState = useSelector(PAStateSelector);

  useEffect(() => {
    setHeaderTitleNode(
      <span className={cx('button')} onClick={onAddPattern}>
        <Button disabled={disabled}>{formatMessage(messages.createPatternModalHeader)}</Button>
      </span>,
    );

    return () => setHeaderTitleNode(null);
  });

  const onRenamePattern = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.EDIT_PATTERN_ICON);
    dispatch(
      showModalAction({
        id: 'editPatternModalWindow',
        data: {
          onSave: (dataToSave) => dispatch(updatePatternAction(dataToSave)),
          pattern,
          patterns,
        },
      }),
    );
  };
  const handleSaveClonedPattern = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_CLONE_PATTERN_MODAL);
    dispatch(addPatternAction(pattern));
    dispatch(hideModalAction());
  };
  const onClonePattern = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.CLONE_PATTERN_ICON);
    const newPattern = {
      ...pattern,
      name: pattern.name + COPY_POSTFIX,
    };
    delete newPattern.id;
    dispatch(
      showModalAction({
        id: 'createPatternAnalysisModal',
        data: {
          onSave: handleSaveClonedPattern,
          pattern: newPattern,
          patterns,
          modalTitle: formatMessage(messages.duplicate),
        },
      }),
    );
  };
  const onDeletePattern = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.DELETE_PATTERN_ICON);
    dispatch(deletePatternAction(pattern));
    dispatch(hideModalAction());
  };
  const showDeleteConfirmationDialog = (pattern) => {
    dispatch(
      showModalAction({
        id: 'deletePatternRuleModal',
        data: {
          onDelete: () => onDeletePattern(pattern),
        },
      }),
    );
  };
  const onChangePatternAnalysis = (enabled) => {
    trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_SWITCHER,
    );
    dispatch(updatePAStateAction(enabled));
  };
  const onToggleHandler = (enabled, pattern) => {
    trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_RULE_SWITCHER,
    );
    dispatch(
      updatePatternAction({
        ...pattern,
        enabled,
      }),
    );
  };
  const actions = [
    {
      icon: CopyIcon,
      handler: onClonePattern,
    },
    {
      icon: PencilIcon,
      handler: onRenamePattern,
    },
    {
      icon: BinIcon,
      handler: showDeleteConfirmationDialog,
    },
  ];

  return (
    <>
      <Layout description={formatMessage(messages.tabDescription)}>
        <FieldElement
          withoutProvider
          description={formatMessage(messages.autoPatternAnalysisDescription)}
        >
          <Checkbox
            disabled={disabled}
            value={PAState}
            onChange={(e) => onChangePatternAnalysis(e.target.checked)}
          >
            {formatMessage(messages.autoPatternAnalysis)}
          </Checkbox>
        </FieldElement>
      </Layout>
      <div className={cx('pattern-container')}>
        <RuleList
          disabled={disabled}
          data={patterns}
          actions={actions}
          onToggle={onToggleHandler}
          ruleItemContent={PatternRuleContent}
        />
      </div>
    </>
  );
};
PatternAnalysisContent.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
  onAddPattern: PropTypes.func.isRequired,
  patterns: PropTypes.array,
  disabled: PropTypes.bool,
};
PatternAnalysisContent.defaultProps = {
  patterns: [],
  disabled: false,
};
