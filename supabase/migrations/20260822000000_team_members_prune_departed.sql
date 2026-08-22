-- Prune team_members rows that are no longer on the published roster.
--
-- The seed migration (20260804000001) is an upsert: it inserts and updates the
-- current roster but never removes a member who has left, so a database seeded
-- from an earlier revision keeps stale rows indefinitely. This deletes anything
-- not in the roster as generated from src/data/team.ts.
--
-- Regenerate this slug list alongside the seed whenever the roster changes.

delete from public.team_members
where slug not in (
    'andrew-lacambra',
    'ian-teh',
    'hunter-specht',
    'sandhya-gopinath',
    'keren-wadhwani',
    'chris-andreou',
    'shaheera-ali',
    'parth-dama',
    'landon-haffner',
    'ayden-wong',
    'riley-collins',
    'karanvir-singh',
    'fabian-segura-vargas',
    'alex-belanger',
    'daniel-friedman',
    'mikhail-bilokin',
    'evan-wright',
    'logan-friedman',
    'dallas-white',
    'cooper-weiss',
    'augustus-matushek',
    'sid-voona',
    'gautham-santhanam',
    'brock-heller',
    'gabriel-fridman',
    'jacob-george',
    'alejandro-cabrales',
    'arav-ginde',
    'veer-sanyal',
    'balthazar-schmitt',
    'yashita-pujari',
    'anushka-patel',
    'abhipsa-prajapati',
    'lulu-zeng',
    'alexander-boquist'
);
