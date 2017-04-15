import Ember from 'ember';

const {
  RSVP: { Promise },
  run: { later }
} = Ember;

export default function timeout(ms) {
  return new Promise((r) => later(r, ms));
}
