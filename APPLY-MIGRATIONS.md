# Apply Database Migrations - Choose Your Method

## 🚀 Method 1: Automated Script (Easiest)

**Just run this one command:**

```bash
./scripts/apply-migrations-simple.sh fiacha-staging-db
```

That's it! The script will:
- ✅ Combine all migrations
- ✅ Apply them to the database
- ✅ Verify they worked
- ✅ Clean up

---

## 📝 Method 2: Single Command (Simple)

**Step 1:** Create combined migration file

```bash
cat db/migrations/001_add_geographical_hierarchy.sql \
    db/migrations/002_seed_local_authorities.sql \
    db/migrations/003_seed_real_politicians.sql \
    db/migrations/004_seed_real_promises.sql \
    db/migrations/005_seed_councillors.sql \
    > /tmp/all-migrations.sql
```

**Step 2:** Apply it

```bash
flyctl postgres connect -a fiacha-staging-db < /tmp/all-migrations.sql
```

**Step 3:** Clean up

```bash
rm /tmp/all-migrations.sql
```

---

## 💻 Method 3: Interactive psql (Traditional)

**Step 1:** Connect to database

```bash
flyctl postgres connect -a fiacha-staging-db
```

**Step 2:** You'll see this prompt:

```
psql (15.x)
Type "help" for help.

postgres=#
```

**Step 3:** Copy and paste each line, pressing Enter after each:

```sql
\i db/migrations/001_add_geographical_hierarchy.sql
```
*(Press Enter, wait for it to finish)*

```sql
\i db/migrations/002_seed_local_authorities.sql
```
*(Press Enter, wait for it to finish)*

```sql
\i db/migrations/003_seed_real_politicians.sql
```
*(Press Enter, wait for it to finish)*

```sql
\i db/migrations/004_seed_real_promises.sql
```
*(Press Enter, wait for it to finish)*

```sql
\i db/migrations/005_seed_councillors.sql
```
*(Press Enter, wait for it to finish)*

**Step 4:** Exit

```sql
\q
```

---

## ✅ Verify Migrations Worked

```bash
# Connect to database
flyctl postgres connect -a fiacha-staging-db

# Check tables exist
postgres=# \dt

# Count counties (should be 26)
postgres=# SELECT COUNT(*) FROM counties;

# Count politicians (should be ~110)
postgres=# SELECT COUNT(*) FROM politicians;

# Exit
postgres=# \q
```

---

## 🆘 Troubleshooting

### "No such file or directory"

The `\i` commands can't find files. Use **Method 1** or **Method 2** instead.

### "Connection refused"

Database isn't ready yet. Wait 30 seconds and try again.

### "Table already exists"

Some migrations already ran. That's OK! It's harmless. Continue with the next one.

---

## 📌 Quick Copy-Paste

### For Staging:
```bash
./scripts/apply-migrations-simple.sh fiacha-staging-db
```

### For Production (later):
```bash
./scripts/apply-migrations-simple.sh fiacha-production-db
```

---

## 🎯 Recommended Approach

1. **Try Method 1 first** (automated script) - it's the easiest
2. **If that fails**, use Method 2 (single command)
3. **If that fails**, use Method 3 (interactive psql)

See **`MIGRATIONS-GUIDE.md`** for detailed troubleshooting.
