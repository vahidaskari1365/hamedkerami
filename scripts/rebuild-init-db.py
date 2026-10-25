#!/usr/bin/env python3
# بازسازی db/init.db از db/init.sql — بعد از حذف نام پزشک حذف‌شده از seed
import sqlite3
import os
import sys

ROOT = "/home/z/my-project"
SQL = os.path.join(ROOT, "db", "init.sql")
DB = os.path.join(ROOT, "db", "init.db")

with open(SQL, encoding="utf-8") as f:
    script = f.read()

if os.path.exists(DB):
    os.remove(DB)

con = sqlite3.connect(DB)
con.isolation_level = None  # dump خودش BEGIN/COMMIT دارد — autocommit لازم است
try:
    con.executescript(script)
finally:
    con.close()

# اعتبارسنجی: هیچ ردیفی نباید نام حذف‌شده را داشته باشد
# (الگوی دقیق نام — «رستم» تنها در کلماتی مثل «بفرستم» هم می‌آید)
import re
NAME_RE = re.compile(r"رستم[\s\u200c]+خانی|rostamkhani", re.IGNORECASE)
con = sqlite3.connect(DB)
cur = con.cursor()
tables = [r[0] for r in cur.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'"
)]
bad = []
for t in tables:
    for row in cur.execute(f'SELECT * FROM "{t}"'):
        if any(isinstance(v, str) and NAME_RE.search(v) for v in row):
            bad.append((t, row[0]))
counts = {t: cur.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0] for t in
          ("TeamMember", "Hour", "Faq", "Service", "BlogPost")}
con.close()

print("tables:", len(tables))
print("counts:", counts)
print("rows still containing name:", bad if bad else "NONE ✔")
sys.exit(1 if bad else 0)
