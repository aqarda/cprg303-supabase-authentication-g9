# Supabase Setup

The app uses Supabase for sign up, sign in, and sign out, and for two tables protected by Row Level Security (RLS). The database can be recreated by running `schema.sql`.

## Create the project

1. Create a new project on supabase.com (Free plan).
2. Go to Authentication > Sign In / Providers > Email:
   - Turn off Confirm email, so new users are signed in right after signing up.
   - Set the minimum password length to 8 and require letters and digits. This matches the sign-up form.
3. Go to SQL Editor > New query, paste all of `schema.sql`, and click Run.

## Connect the app

1. Copy `.env.example` to `.env` in the project root. Do not commit `.env`.
2. Add the project URL and the publishable key from the Supabase dashboard (Connect button, or Settings > API Keys).
3. Restart Expo: `npx expo start -c`

The publishable key replaces the older anon key. It is safe to use in the app because RLS controls what each user can read. The secret key is never used in the app.

## Tables

| Table | Shown on | Signed out | Signed in |
| --- | --- | --- | --- |
| announcements | Sign Up screen | Can read | Can read |
| member_resources | Protected screen | No access | Can read |

- RLS is turned on for both tables.
- The app can only read. It cannot add, change, or delete rows.
- Each table has `id`, `title`, `body`, and `created_at`, with 3 to 4 sample rows.

## How the app uses Supabase

- `src/lib/supabase.ts` creates the Supabase client and saves the session on the phone.
- `src/context/AuthContext.tsx` provides `AuthProvider` and `useAuth()`. It loads the saved session when the app starts and handles sign up, sign in, and sign out.
- `src/lib/authErrors.ts` turns Supabase errors into clear messages, so a failed request does not crash the app.

The full name entered at sign up is saved in the user's metadata. If there is no name, the app shows the email instead.

## Test account

Email: aqarda.cprg303@gmail.com
Password: TestingAqarda001_

## Notes

- Free projects can pause after about a week without activity. If the app shows a server error, open the dashboard and restore the project.
