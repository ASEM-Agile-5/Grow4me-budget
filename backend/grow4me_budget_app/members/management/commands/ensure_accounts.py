from django.core.management.base import BaseCommand
from members.models import User, Accounts


class Command(BaseCommand):
    help = 'Ensures every existing User has an Accounts record'

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        for user in users:
            _, created = Accounts.objects.get_or_create(user=user)
            if created:
                created_count += 1
                self.stdout.write(f'Created Accounts record for {user.email}')
        self.stdout.write(self.style.SUCCESS(f'Done. {created_count} Accounts record(s) created.'))
