from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Post, PostInteraction, Follow
from .serializers import PostSerializer
from django.contrib.auth.models import User
@api_view(['POST'])
def like_post(request, post_id):
    user = request.user
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user has already liked or disliked the post
    existing_interaction = PostInteraction.objects.filter(user=user, post=post)

    if existing_interaction.exists():
        interaction = existing_interaction.first()
        if interaction.interaction_type == 'like':
            # Unlike the post
            interaction.delete()
            return Response({"message": "You have unliked the post."}, status=status.HTTP_200_OK)
        else:
            # Remove dislike and add like
            interaction.interaction_type = 'like'
            interaction.save()
            return Response({"message": "You have liked the post."}, status=status.HTTP_200_OK)
    else:
        # Create new like interaction
        PostInteraction.objects.create(user=user, post=post, interaction_type='like')
        return Response({"message": "You have liked the post."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def dislike_post(request, post_id):
    user = request.user
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user has already liked or disliked the post
    existing_interaction = PostInteraction.objects.filter(user=user, post=post)

    if existing_interaction.exists():
        interaction = existing_interaction.first()
        if interaction.interaction_type == 'dislike':
            # Remove dislike
            interaction.delete()
            return Response({"message": "You have undisliked the post."}, status=status.HTTP_200_OK)
        else:
            # Remove like and add dislike
            interaction.interaction_type = 'dislike'
            interaction.save()
            return Response({"message": "You have disliked the post."}, status=status.HTTP_200_OK)
    else:
        # Create new dislike interaction
        PostInteraction.objects.create(user=user, post=post, interaction_type='dislike')
        return Response({"message": "You have disliked the post."}, status=status.HTTP_201_CREATED)



@api_view(['POST'])
def create_post(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    title = request.data.get('title')
    content = request.data.get('content')
    author = request.user.username  # Automatically take the username of the logged-in user
    
    media_file = request.FILES.get('media_file')
    media_type = request.data.get('media_type')

    if not title or not content:
        return Response({'detail': 'Title and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

    post = Post.objects.create(
        user=request.user, 
        title=title, 
        content=content, 
        author=author,
        media_file=media_file,
        media_type=media_type
    )

    serializer = PostSerializer(post)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



from users.models import Friendship
from django.db.models import Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_posts(request):
    user = request.user
    
    # Get IDs of connected friends
    friendships = Friendship.objects.filter(
        (Q(from_user=user) | Q(to_user=user)) & Q(status='accepted')
    )
    friend_ids = []
    for f in friendships:
        if f.from_user == user:
            friend_ids.append(f.to_user.id)
        else:
            friend_ids.append(f.from_user.id)
            
    # Filter posts by the logged-in user and their friends
    posts = Post.objects.filter(
        user_id__in=friend_ids + [user.id]
    ).order_by('-created_at')
    
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def post_interaction_status(request, post_id):
    user = request.user

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user has interacted with the post
    interaction = PostInteraction.objects.filter(user=user, post=post).first()

    if interaction:
        return Response({"interaction_type": interaction.interaction_type}, status=status.HTTP_200_OK)
    else:
        return Response({"interaction_type": None}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def get_user_posts(request):
    user = request.user  # Get the currently authenticated user

    if not user.is_authenticated:
        return Response({"error": "User is not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

    posts = user.posts.all().order_by('-created_at')  # Fetch the user's posts
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Post





from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serializers import PostSerializer

@api_view(['PUT'])
def edit_post(request, post_id):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        post = Post.objects.get(id=post_id, user=request.user)  # Ensure post belongs to the logged-in user
    except Post.DoesNotExist:
        return Response({'detail': 'Post not found or you do not have permission to edit this post.'}, status=status.HTTP_404_NOT_FOUND)

    title = request.data.get('title', post.title)
    content = request.data.get('content', post.content)

    if not title or not content:
        return Response({'detail': 'Title and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

    post.title = title
    post.content = content
    post.save()

    return Response({'message': 'Post updated successfully.'}, status=status.HTTP_200_OK)



# GET request to retrieve the post data
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Post

@api_view(['DELETE'])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id, user=request.user)  # Ensure the post belongs to the logged-in user
    except Post.DoesNotExist:
        return Response({'detail': 'Post not found or you do not have permission to delete this post.'}, status=status.HTTP_404_NOT_FOUND)

    post.delete()
    return Response({'message': 'Post deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Follow

@api_view(['POST'])
def follow_user(request, username):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user_to_follow = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if user_to_follow == request.user:
        return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    if Follow.objects.filter(user=user_to_follow, follower=request.user).exists():
        return Response({'detail': 'You are already following this user.'}, status=status.HTTP_400_BAD_REQUEST)

    Follow.objects.create(user=user_to_follow, follower=request.user)
    return Response({'detail': f'You are now following {username}.'}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def unfollow_user(request, username):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user_to_unfollow = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        follow = Follow.objects.get(user=user_to_unfollow, follower=request.user)
        follow.delete()
        return Response({'detail': f'You have unfollowed {username}.'}, status=status.HTTP_204_NO_CONTENT)
    except Follow.DoesNotExist:
        return Response({'detail': 'You are not following this user.'}, status=status.HTTP_400_BAD_REQUEST)
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_user_profile(request):
    user = request.user
    followers_count = user.followers.count()  # Adjust if you have a custom relationship
    profile_data = {
        "username": user.username,
        "email": user.email,
        "phone": user.profile.phone,  # Assuming you have a Profile model linked
        "bio": user.profile.bio,
        "followers_count": followers_count,
    }
    return Response(profile_data)

from .models import Post, Comment
from .serializers import CommentSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)  # Validate if the post exists
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found!'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        content = request.data.get('content')

        if not content:
            return Response({'error': 'Content cannot be empty!'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the comment and associate it with the post
        comment = Comment.objects.create(post=post, author=request.user, content=content)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found!'}, status=status.HTTP_404_NOT_FOUND)