from rest_framework import serializers
from .models import UserEvent, Group, GroupMembership
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
