// Turns MySQL constraint violations into 400s the admin can render.
//
// Left alone, a bad cover_media_id sends the client:
//   "Cannot add or update a child row: a foreign key constraint fails
//    (`cyberclaims`.`posts`, CONSTRAINT `posts_ibfk_3` FOREIGN KEY ...)"
// which is a 500, leaks the schema, and tells the editor nothing they can act on.
// These are user mistakes, not server faults.

const FIELD_BY_CONSTRAINT = [
  [/cover_media_id/, 'cover_media_id', 'That cover image no longer exists.'],
  [/category_id/, 'category_id', 'That category no longer exists.'],
  [/author_id/, 'author_id', 'That author no longer exists.'],
  [/avatar_id/, 'avatar_id', 'That avatar image no longer exists.'],
];

export function asUserError(err) {
  if (!err?.code) return err;

  if (err.code === 'ER_DUP_ENTRY') {
    const slug = /uq_locale_slug|uq_post_locale/.test(err.message);
    return badRequest(
      slug ? 'slug' : 'form',
      slug
        ? 'Another article already uses that URL slug. Change the slug and try again.'
        : 'That value is already taken.'
    );
  }

  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    const hit = FIELD_BY_CONSTRAINT.find(([re]) => re.test(err.message));
    return badRequest(
      hit?.[1] ?? 'form',
      hit?.[2] ?? 'Something this post refers to no longer exists. Reload and try again.'
    );
  }

  if (err.code === 'ER_DATA_TOO_LONG') {
    return badRequest('form', 'One of the fields is too long.');
  }

  return err;
}

function badRequest(field, message) {
  const err = new Error(message);
  err.status = 400;
  err.errors = [{ field, message }];
  return err;
}
