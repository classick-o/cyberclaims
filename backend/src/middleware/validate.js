// Zod-backed request validation, emitting the error shape the frontend already
// expects: { success: false, errors: [{ field, message }] }.

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'form',
          message: issue.message,
        })),
      });
    }

    req.body = result.data; // trimmed, coerced, stripped of unknown keys
    next();
  };
}

// Bots fill in every field they can see, including the ones they can't.
// A hit returns a fake 200 so the bot logs a success and doesn't retry -
// no lead is written, no email is sent.
export function honeypot(req, res, next) {
  if (req.body?._honey) {
    return res.status(200).json({ success: true, message: 'Message received.' });
  }
  next();
}
