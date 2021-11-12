import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BirthdayReminder from '../lib/birthday_reminder-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BirthdayReminder.BirthdayReminderStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
