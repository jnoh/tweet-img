import test from 'ava';
import s from '.';

const imgData = '';

test('must call setup() before tweet()', async t => {
  await t.throwsAsync(async () => {
    await s.tweet('status', 'image/jpeg', imgData);
  }, Error);
});

test('must pass an imgContentType of an image', async t => {
  await t.throwsAsync(async () => {
    await s.tweet('status', 'image/mp4', imgData);
  }, Error);
});
