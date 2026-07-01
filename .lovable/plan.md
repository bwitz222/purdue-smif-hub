## Change

In `src/data/team.ts`:

**Financials sector** — add Mikhail Bilokin as an Analyst, filling one of the current empty seats:
```
["Alex Belanger", "Head, Sector", ...]
["Daniel Friedman", "Senior Analyst", ...]
["Mikhail Bilokin", "Analyst", "mbilokin@purdue.edu", "2029"]
["", "Analyst"]
["", "Analyst"]
```

**Consumer Staples sector** — remove Mikhail's row and backfill with an empty Analyst seat so the team still shows 5 slots:
```
["Evan Wright", "Head, Sector", ...]
["Logan Friedman", "Senior Analyst", ...]
["", "Analyst"]
["", "Analyst"]
["", "Analyst"]
```

No other files touched. LinkedIn map already keys off name, so his profile link follows him automatically.