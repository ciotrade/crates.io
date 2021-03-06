import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import { task } from 'ember-concurrency';

export default class CrateOwnersController extends Controller {
  @service notifications;

  crate = null;
  username = '';

  @task(function* () {
    const username = this.username;

    try {
      yield this.crate.inviteOwner(username);
      this.notifications.success(`An invite has been sent to ${username}`);
    } catch (error) {
      if (error.errors) {
        this.notifications.error(`Error sending invite: ${error.errors[0].detail}`);
      } else {
        this.notifications.error('Error sending invite');
      }
    }
  })
  addOwnerTask;

  @task(function* (owner) {
    try {
      yield this.crate.removeOwner(owner.get('login'));

      if (owner.kind === 'team') {
        this.notifications.success(`Team ${owner.get('display_name')} removed as crate owner`);
        this.crate.owner_team.removeObject(owner);
      } else {
        this.notifications.success(`User ${owner.get('login')} removed as crate owner`);
        this.crate.owner_user.removeObject(owner);
      }
    } catch {
      let subject = owner.kind === 'team' ? `team ${owner.get('display_name')}` : `user ${owner.get('login')}`;
      this.notifications.error(`Failed to remove the ${subject} as crate owner`);
    }
  })
  removeOwnerTask;
}
