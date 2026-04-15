import django.contrib.postgres.fields
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Projects',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('project_name', models.CharField(max_length=255, verbose_name='Project Name')),
                ('description', models.TextField()),
                ('progress', models.IntegerField(default=0)),
                ('operational_budget', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('capital_budget', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('updates', django.contrib.postgres.fields.ArrayField(
                    base_field=models.CharField(max_length=255),
                    blank=True,
                    default=list,
                    size=None,
                )),
                ('location', models.CharField(max_length=255)),
                ('current_balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
            ],
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('amount_invested', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.projects')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project_users',
            },
        ),
        migrations.CreateModel(
            name='Tasks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.CharField(max_length=50, verbose_name='Task ID')),
                ('title', models.CharField(max_length=255)),
                ('status', models.CharField(
                    choices=[('completed', 'Completed'), ('in-progress', 'In Progress'), ('pending', 'Pending')],
                    default='pending',
                    max_length=20,
                )),
                ('priority', models.CharField(
                    choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
                    default='medium',
                    max_length=20,
                )),
                ('due_date', models.DateField()),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='backlog',
                    to='project.projects',
                )),
            ],
        ),
        migrations.AddField(
            model_name='projects',
            name='users',
            field=models.ManyToManyField(
                related_name='projects',
                through='project.Membership',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
