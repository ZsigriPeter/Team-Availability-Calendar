# Generated by Django 5.2 on 2025-06-24 08:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_eventparticipation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userevent',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='myapp.group'),
        ),
    ]
