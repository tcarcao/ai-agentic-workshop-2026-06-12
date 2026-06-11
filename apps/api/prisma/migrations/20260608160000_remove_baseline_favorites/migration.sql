-- Favorites is intentionally NOT part of the baseline app: it is hands-on
-- feature brief 02 (a full-stack exercise that adds a `favorites` bounded
-- context on top of the accounts system). Drop the table the accounts
-- migration created so a fresh `db:setup` starts without it.

-- DropTable
DROP TABLE "Favorite";
