import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import SendToPhone from '@cdo/apps/code-studio/components/SendToPhone';

describe('SendToPhone', () => {
  const server = sinon.fakeServer.create();
  const defaultProps = {
    appType: 'artist',
  };

  it('sends to phone for legacy /c/ link shares', finish => {
    const levelSourceId = 12345;
    const wrapper = shallow(
      <SendToPhone
        isLegacyShare={true}
        {...defaultProps}
      />
    );

    server.respondWith('POST', '/sms/send', request => {
      assert.equal(request.requestBody, `type=artist&phone=&level_source=${levelSourceId}`);
      finish();
    });

    sinon.stub(wrapper.instance(), 'getLevelSourceId', () => levelSourceId);

    wrapper.setState({sendState: 'canSubmit'});
    wrapper.instance().handleSubmit();
    server.respond();
  });

  it('sends to phone for project shares', finish => {
    const channelId = 'abc123';
    const wrapper = shallow(
      <SendToPhone
        isLegacyShare={false}
        channelId={channelId}
        {...defaultProps}
      />
    );

    server.respondWith('POST', '/sms/send', request => {
      assert.equal(request.requestBody, `type=artist&phone=&channel_id=${channelId}`);
      finish();
    });

    wrapper.setState({sendState: 'canSubmit'});
    wrapper.instance().handleSubmit();
    server.respond();
  });

  server.restore();
});
