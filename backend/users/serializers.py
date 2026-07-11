from rest_framework import serializers
from .models import Profile

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['name', 'email', 'phone', 'gender', 'bio']  # Include the fields you want to allow for update
