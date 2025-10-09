# Database Migrations Guide - Simple Instructions

This guide shows you exactly how to apply database migrations to your Fly.io Postgres database.

## Method 1: Using psql Interactive Shell (Simplest)

### Step 1: Connect to Database

```bash
flyctl postgres connect -a fiacha-staging-db
```

**What you'll see:**
```
psql (15.x)
Type "help" for help.

postgres=#
```

The `postgres=#` is your command prompt. You can now type commands.

### Step 2: Run Each Migration

Copy and paste **ONE LINE AT A TIME** into the psql prompt:

```sql
\i db/migrations/001_add_geographical_hierarchy.sql
```

Press **Enter**. Wait for it to finish. You'll see output like:
```
CREATE TABLE
INSERT 0 26
CREATE TABLE
...
```

Then paste the next one:

```sql
\i db/migrations/002_seed_local_authorities.sql
```

Press **Enter**. Wait for completion.

Continue with each migration:

```sql
\i db/migrations/003_seed_real_politicians.sql
```

```sql
\i db/migrations/004_seed_real_promises.sql
```

```sql
\i db/migrations/005_seed_councillors.sql
```

### Step 3: Exit psql

```sql
\q
```

**Done!** ✅

---

## Method 2: Using a Single Command (Easiest)

If the `\i` commands don't work (can't find files), use this method instead:

### Create a Combined Migration File

First, create a single file with all migrations:

```bash
cd /Users/eainjones/Documents/GitHub/fiacha

cat db/migrations/001_add_geographical_hierarchy.sql \
    db/migrations/002_seed_local_authorities.sql \
    db/migrations/003_seed_real_politicians.sql \
    db/migrations/004_seed_real_promises.sql \
    db/migrations/005_seed_councillors.sql \
    > /tmp/all-migrations.sql
```

### Apply It

```bash
flyctl postgres connect -a fiacha-staging-db < /tmp/all-migrations.sql
```

This runs all migrations in one command and shows you the output.

---

## Method 3: Using Fly Proxy (Alternative)

If you prefer to run migrations from your local machine:

### Step 1: Start Proxy

In one terminal:

```bash
flyctl proxy 5432 -a fiacha-staging-db
```

Keep this running.

### Step 2: Get Database Credentials

In another terminal:

```bash
flyctl postgres connect -a fiacha-staging-db
```

You'll see connection info like:
```
postgres://postgres:password@top2.nearest.of.fiacha-staging-db.internal:5432
```

Copy the password part.

### Step 3: Run Migrations

In the second terminal (while proxy is running):

```bash
cd /Users/eainjones/Documents/GitHub/fiacha

# Replace [PASSWORD] with your actual password from above
PGPASSWORD=[PASSWORD] psql -h localhost -p 5432 -U postgres postgres \
  -f db/migrations/001_add_geographical_hierarchy.sql

PGPASSWORD=[PASSWORD] psql -h localhost -p 5432 -U postgres postgres \
  -f db/migrations/002_seed_local_authorities.sql

# ... and so on for each migration
```

---

## Method 4: Using Automated Script (Recommended)

I've created a script that does everything for you:

```bash
chmod +x scripts/apply-migrations-simple.sh
./scripts/apply-migrations-simple.sh fiacha-staging-db
```

This will:
1. Combine all migrations into one file
2. Apply them to the database
3. Show you the results
4. Clean up temp files

---

## Troubleshooting

### Error: "No such file or directory"

The `\i` command can't find the files. Use **Method 2** instead (single command).

### Error: "Connection refused"

The database might not be ready. Wait 30 seconds and try again.

### Error: "Permission denied"

You might not have the right credentials. Check:

```bash
flyctl secrets list -a fiacha-staging
```

Make sure `DATABASE_URL` is set.

### Error: "Table already exists"

Some migrations were already applied. That's OK! The error is harmless. Continue with the next migration.

---

## Verification

After running migrations, verify they worked:

### Connect to Database

```bash
flyctl postgres connect -a fiacha-staging-db
```

### Check Tables

```sql
\dt
```

You should see:
```
 public | counties           | table | postgres
 public | local_authorities  | table | postgres
 public | politicians        | table | postgres
 public | promises           | table | postgres
 public | evidence           | table | postgres
 public | milestones         | table | postgres
 public | status_history     | table | postgres
```

### Check Data

```sql
SELECT COUNT(*) FROM counties;
```

Should return: `26`

```sql
SELECT COUNT(*) FROM politicians;
```

Should return: `110` (or thereabouts)

### Exit

```sql
\q
```

---

## Quick Reference

### psql Commands

| Command | What it does |
|---------|-------------|
| `\i filename.sql` | Run SQL file |
| `\dt` | List all tables |
| `\d tablename` | Describe table structure |
| `\l` | List all databases |
| `\q` | Quit psql |
| `SELECT * FROM tablename;` | Show all data in table |
| `SELECT COUNT(*) FROM tablename;` | Count rows |

### File Locations

All migration files are in:
```
/Users/eainjones/Documents/GitHub/fiacha/db/migrations/
```

---

## Which Method Should I Use?

### Use Method 1 if:
- ✅ You're comfortable with command line
- ✅ The `\i` command works
- ✅ You want to see each step

### Use Method 2 if:
- ✅ The `\i` command doesn't work
- ✅ You want it done quickly
- ✅ You prefer one command

### Use Method 4 if:
- ✅ You want fully automated
- ✅ You trust the script
- ✅ Easiest option

---

## Example Session

Here's exactly what a successful migration looks like:

```bash
$ flyctl postgres connect -a fiacha-staging-db
psql (15.4)
Type "help" for help.

postgres=# \i db/migrations/001_add_geographical_hierarchy.sql
CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 26
INSERT 0 26
CREATE INDEX
CREATE INDEX
...
postgres=# \i db/migrations/002_seed_local_authorities.sql
DO
postgres=# \i db/migrations/003_seed_real_politicians.sql
DO
postgres=# \i db/migrations/004_seed_real_promises.sql
DO
postgres=# \i db/migrations/005_seed_councillors.sql
DO
DO
DO
DO
DO
DO
postgres=# \q
$
```

**That's it!** Your database now has all the data.

---

## Need Help?

If you're stuck, try **Method 2** (single command) - it's the most reliable.

If that doesn't work, we can:
1. Check if the database is actually ready
2. Verify the connection works
3. Try applying migrations manually via proxy
