"""
migrate_safe: handles migration on a DB whose tables may be in any state:
  - Fresh DB (no tables)         → just run migrate normally
  - Tables exist, no history     → fake built-in + initial migrations, run new ones
  - Partial tables (some dropped) → only fake for tables that actually exist

Steps:
  1. Check which tables actually exist in the DB.
  2. For built-in Django apps: fake ALL their migrations only if their key table exists.
  3. For custom apps: fake 0001_initial only if the app's main table exists.
  4. Run `migrate` normally — creates missing tables and applies genuinely new migrations.
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection


def get_existing_tables():
    with connection.cursor() as cursor:
        return set(connection.introspection.table_names(cursor))


# (app_label, key_table_that_proves_the_app_was_already_set_up)
BUILTIN_APPS = [
    ('contenttypes', 'django_content_type'),
    ('auth',         'auth_user'),
    ('admin',        'django_admin_log'),
    ('sessions',     'django_session'),
]

# (app_label, migration_name, key_table_for_that_migration)
CUSTOM_INITIAL_FAKES = [
    ('members', '0001_initial', 'members_user'),
    ('budget',  '0001_initial', 'budget_budget'),
]


class Command(BaseCommand):
    help = 'Safe migration: fakes migrations for existing tables, creates missing ones.'

    def handle(self, *args, **options):
        existing = get_existing_tables()
        self.stdout.write(f'[migrate_safe] Found {len(existing)} existing tables.')

        # Step 1 — fake built-in app migrations only where the table already exists
        for app, key_table in BUILTIN_APPS:
            if key_table in existing:
                self.stdout.write(f'[migrate_safe] {key_table} exists — faking {app} migrations.')
                try:
                    call_command('migrate', app, '--fake', verbosity=1)
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f'  Skipped {app}: {exc}'))
            else:
                self.stdout.write(f'[migrate_safe] {key_table} missing — {app} will be created normally.')

        # Step 2 — fake initial migrations for custom apps whose tables exist
        for app, migration, key_table in CUSTOM_INITIAL_FAKES:
            if key_table in existing:
                self.stdout.write(f'[migrate_safe] {key_table} exists — faking {app} {migration}.')
                try:
                    call_command('migrate', app, migration, '--fake', verbosity=1)
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f'  Skipped {app} {migration}: {exc}'))
            else:
                self.stdout.write(f'[migrate_safe] {key_table} missing — {app} {migration} will run normally.')

        # Step 3 — run all remaining migrations (creates missing tables, applies new ones)
        self.stdout.write('[migrate_safe] Running remaining migrations...')
        call_command('migrate', verbosity=1)

        self.stdout.write(self.style.SUCCESS('[migrate_safe] Done.'))
