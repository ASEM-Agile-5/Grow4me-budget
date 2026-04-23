from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0002_seed_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='accounts',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
