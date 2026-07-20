from rest_framework import serializers
from .models import Post, Comment, Circle
from users.models import Friendship
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CircleSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    members = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Circle
        fields = ['id', 'name', 'description', 'created_by', 'created_by_username', 'created_at', 'members']

class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.IntegerField(read_only=True)  # No need for `source` as the method matches the field name
    dislike_count = serializers.IntegerField(read_only=True)  # Same here
    friend_status = serializers.SerializerMethodField()
    author_id = serializers.IntegerField(source='user.id', read_only=True)
    circles = serializers.PrimaryKeyRelatedField(queryset=Circle.objects.all(), many=True, required=False)

    class Meta:
        model = Post
        fields = ['id', 'user', 'author', 'author_id', 'title', 'content', 'media_file', 'media_type', 'created_at', 'updated_at', 'like_count', 'dislike_count', 'friend_status', 'circles']

    def get_friend_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'none'
        if obj.user == request.user:
            return 'self'
        
        # Check Friendship
        f1 = Friendship.objects.filter(from_user=request.user, to_user=obj.user).first()
        f2 = Friendship.objects.filter(from_user=obj.user, to_user=request.user).first()
        
        if f1 and f1.status == 'accepted':
            return 'friends'
        if f2 and f2.status == 'accepted':
            return 'friends'
            
        if f1 and f1.status == 'pending':
            return 'request_sent'
        if f2 and f2.status == 'pending':
            return 'request_received'
            
        return 'none'

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']