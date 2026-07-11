from rest_framework import serializers
from .models import Post
from .models import Post, Comment
class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.IntegerField(read_only=True)  # No need for `source` as the method matches the field name
    dislike_count = serializers.IntegerField(read_only=True)  # Same here

    class Meta:
        model = Post
        fields = ['id', 'user', 'author', 'title', 'content', 'media_file', 'media_type', 'created_at', 'updated_at', 'like_count', 'dislike_count']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']