# Generated by Django 5.2 on 2025-05-27 09:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0004_userevent_google_event_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupmembership',
            name='role',
            field=models.CharField(choices=[('owner', 'Owner'), ('admin', 'Admin'), ('member', 'Member')], default='member', max_length=20),
        ),
    ]
