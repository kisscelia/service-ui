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
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { withModal } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { useDispatch } from 'react-redux';
import { ModalLayout } from 'componentLibrary/modal';
import { hideModalAction } from 'controllers/modal';
import { useTracking } from 'react-tracking';
import { FieldText } from 'componentLibrary/fieldText';
import classNames from 'classnames/bind';
import { FieldElement } from '../../../elements';
import styles from './editPatternModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  patternName: {
    id: 'PatternAnalysis.patternName',
    defaultMessage: 'Pattern Name',
  },
  headerTitle: {
    id: 'PatternAnalysis.headerTitle',
    defaultMessage: 'Edit Pattern',
  },
  editPatternName: {
    id: 'PatternAnalysis.editPatternName',
    defaultMessage: 'Edit Pattern Name',
  },
});

const EditPatternModal = ({ data, handleSubmit, initialize }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  useEffect(() => {
    initialize(data.pattern);
  }, []);

  const saveAndClose = (pattern) => {
    trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_RENAME_PATTERN_MODAL);
    data.onSave(pattern);
    dispatch(hideModalAction());
  };

  return (
    <ModalLayout
      title={formatMessage(messages.headerTitle)}
      okButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
        onClick: handleSubmit(saveAndClose),
      }}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('description')}>{formatMessage(messages.editPatternName)}</div>
      <FieldElement name="name" label={formatMessage(messages.patternName)}>
        <FieldErrorHint provideHint={false}>
          <FieldText maxLength={55} defaultWidth={false} />
        </FieldErrorHint>
      </FieldElement>
    </ModalLayout>
  );
};
EditPatternModal.propTypes = {
  data: PropTypes.shape({
    onSave: PropTypes.func,
    pattern: PropTypes.object,
    patterns: PropTypes.array,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
};

export default withModal('editPatternModalWindow')(
  reduxForm({
    form: 'editPatternForm',
    validate: ({ name }, { data: { pattern, patterns } }) => ({
      name: commonValidators.createPatternNameValidator(patterns, pattern && pattern.id)(name),
    }),
  })(EditPatternModal),
);
