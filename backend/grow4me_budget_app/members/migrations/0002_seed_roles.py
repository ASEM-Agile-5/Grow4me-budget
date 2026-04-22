from django.db import migrations


def seed_roles(apps, schema_editor):
    Role = apps.get_model('members', 'Role')
    Role.objects.get_or_create(name='USER')
    Role.objects.get_or_create(name='ADMIN')


def reverse_seed_roles(apps, schema_editor):
    Role = apps.get_model('members', 'Role')
    Role.objects.filter(name__in=['USER', 'ADMIN']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_roles, reverse_seed_roles),
    ]
