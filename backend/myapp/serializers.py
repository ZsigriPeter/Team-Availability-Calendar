from rest_framework import serializers
from .models import UserEvent, Group, GroupMembership, EventParticipation
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class UserEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEvent
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        event_type = validated_data.get('type')

        if event_type == 'solo':
            validated_data['user'] = request.user
            validated_data['group'] = None
        elif event_type == 'group':
            validated_data['group'] = validated_data.get('group')
            validated_data['user'] = None

        return super().create(validated_data)

    def update(self, instance, validated_data):
        event_type = validated_data.get('type', instance.type)

        if event_type == 'solo':
            instance.user = self.context['request'].user
            instance.group = None
        elif event_type == 'group':
            instance.user = None
            instance.group = validated_data.get('group', instance.group)

        instance.description = validated_data.get('description', instance.description)
        instance.date = validated_data.get('date', instance.date)
        instance.start_time = validated_data.get('start_time', instance.start_time)
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.location = validated_data.get('location', instance.location)

        instance.save()
        return instance


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'created_at', 'member_count']

    def get_member_count(self, obj):
        return obj.members.count()

class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'group', 'joined_at']

class SlotSerializer(serializers.Serializer):
    date = serializers.DateField()
    hour_start = serializers.TimeField() 
    hour_end = serializers.TimeField() 

class EventSubmissionSerializer(serializers.Serializer):
    description = serializers.CharField()
    type = serializers.ChoiceField(choices=UserEvent.TYPE_CHOICES)
    slots = SlotSerializer(many=True)
    groupId = serializers.IntegerField(required=False, allow_null=True)

    def create(self, validated_data):
        user = self.context['request'].user
        slots = validated_data.pop('slots')
        group_id = validated_data.pop('groupId', None)
        created_events = []

        for slot in slots:
            event = UserEvent.objects.create(
                user=user if validated_data['type'] == 'solo' else None,
                group_id=group_id if validated_data['type'] == 'group' else None,
                description=validated_data['description'],
                type=validated_data['type'],
                date=slot['date'],
                start_time=slot['hour_start'],
                end_time=slot['hour_end'],
            )
            created_events.append(event)
        return created_events


class EventParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipation
        fields = ['user', 'event', 'response', 'responded_at']
        read_only_fields = ['responded_at']
