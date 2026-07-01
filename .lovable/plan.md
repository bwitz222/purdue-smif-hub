## Add 7 new member bios

In `src/data/team.ts`, extend `BIO_BY_NAME` with entries for:

- **Mikhail Bilokin** — sophomore, Finance & Accounting; chess, poker, financial markets.
- **Balthazar Schmit** — junior, Math & Economics; CBRE and Turner & Townsend PM internships; countryside drives, hiking, skiing, music.
- **Augustus Matushek** — sophomore, Finance & Accounting; Centier Bank BP&A intern; reading, gym, golf.
- **Jacob George** — sophomore, Finance & BAIM; Simon Property Group Capital Markets intern; gym, DJing, Purdue sports.
- **Dallas White** — sophomore, Finance & Accounting, minor in Business Economics; running KNA Autocare; traveling, exercise, music.
- **Keren Wadhwani** — junior, Quant Econ & Finance, minor in Art History; energyRe M&A intern, Girls Who Invest Scholar, triathlete; running, swimming, museums, painting.
- **Logan Friedman** — junior, Mechanical Engineering, minor Finance; Northrop Grumman ME intern; hiking, surfing, pickleball.

### Notes

- Name in team data is "Mikhail Bilokin" — the bio the user wrote says "Michael"; I'll use it as-is for Mikhail (same person, per prior LinkedIn mapping) so the bio attaches to the existing entry.
- Name in team data is "Balthazar Schmit" (one t) — I'll key the bio to that exact spelling so it renders.
- Keren Wadhwani is on the executive `board`; because `BOARD_NAMES` gates `BIO_BY_NAME` off for sector/PM instances, her personal bio will appear on the board card and the FIM card will keep the current generic "Senior Analyst, Rates" copy. Since she only appears on the board + FIM, the personal bio still shows once — on the board. If you'd prefer it on the FIM card instead, say so and I'll special-case her.
- No other files touched. LinkedIn/photo maps unaffected.
