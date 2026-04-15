"""
migrate_safe: handles first-time migration on a DB that was created without
Django's migration framework (tables exist but django_migrations is empty/partial).

Steps:
  1. Fake ALL built-in Django app migrations (contenttypes, auth, admin, sessions)
     so Django never tries to CREATE/ALTER/DROP columns that may already be gone.
  2. Fake the 0001_initial migration for each custom app whose tables already exist.
  3. Run `migrate` normally — this applies only genuinely new migrations (e.g. 0002_role).
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command


# Django's own apps whose tables were created outside the migration framework.
# We fake every migration for these so Django stops trying to alter missing columns.
BUILTIN_APPS = ['contenttypes', 'auth', 'admin', 'sessions']

# Our custom apps that already have tables in the DB but no migration history.
# Only fake the very first (initial) migration; later ones run normally.
CUSTOM_INITIAL_FAKES = [
    ('members', '0001_initial'),
    ('budget',  '0001_initial'),
]


class Command(BaseCommand):
    help = 'Safe first-run migration: fakes existing-table migrations, runs new ones.'

    def handle(self, *args, **options):
        # Step 1 — fake all built-in app migrations
        for app in BUILTIN_APPS:
            self.stdout.write(f'[migrate_safe] Faking all {app} migrations...')
            try:
                call_command('migrate', app, '--fake', verbosity=1)
            except Exception as exc:
                self.stdout.write(self.style.WARNING(f'  Skipped {app}: {exc}'))

        # Step 2 — fake initial migrations for custom apps with existing tables
        for app, migration in CUSTOM_INITIAL_FAKES:
            self.stdout.write(f'[migrate_safe] Faking {app} {migration}...')
            try:
                call_command('migrate', app, migration, '--fake', verbosity=1)
            except Exception as exc:
                self.stdout.write(self.style.WARNING(f'  Skipped {app} {migration}: {exc}'))

        # Step 3 — run all remaining unapplied migrations normally
        self.stdout.write('[migrate_safe] Running remaining migrations...')
        call_command('migrate', verbosity=1)

        self.stdout.write(self.style.SUCCESS('[migrate_safe] Done.'))
