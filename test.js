import test from 'ava';
import s from '.';

const imgData = '';

test('must call setup() before tweet()', async t => {
  await t.throwsAsync(async () => {
    await s.tweet('status', 'image/jpeg', imgData);
  }, Error);
});

test('must pass an imgContentType of an image', async t => {
  s.setup('1','2','3','4');

  const err = await t.throwsAsync(async () => {
    await s.tweet('status', 'image/mp4', imgData);
  }, Error);

  t.is(err.message, 'img must be a jpeg, png, gif');
});
