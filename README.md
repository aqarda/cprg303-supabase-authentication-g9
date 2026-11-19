# cprg 303 - supabase authentication (group 9)

expo react native app with supabase auth for sign up, sign in and sign out. the home screen is locked until you sign in and shows data protected with RLS.

## setup

1. clone it and install
   ```bash
   git clone https://github.com/aqarda/cprg303-supabase-authentication-g9.git
   cd cprg303-supabase-authentication-g9
   npm ci
   ```
2. copy `.env.example` to `.env` (on windows cmd use `copy .env.example .env`) and put in the project url and publishable key from the supabase dashboard
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```
   `.env` is in `.gitignore` so it never gets committed
3. start it
   ```bash
   npx expo start --go --clear
   ```
   scan the qr code with expo go or the iphone camera on the same wifi. if it wont connect use `npx expo start --go --tunnel --clear`

## supabase setup

full steps are in [supabase/README.md](supabase/README.md)

- email sign in is on, confirm email is off, passwords need 8+ characters with a letter and a number
- run [supabase/schema.sql](supabase/schema.sql) in the sql editor to make the tables, RLS policies and sample data
- `announcements` - shown on the sign up screen, anyone can read it
- `member_resources` - shown on the home screen, only signed in users can read it

## test account

- email: `aqarda.cprg303@gmail.com`
- password: `TestingAqarda001_`