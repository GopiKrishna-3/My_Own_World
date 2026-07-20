from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Post, PostInteraction, Follow, Circle
from .serializers import PostSerializer, CircleSerializer
from django.contrib.auth.models import User
import os

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
@permission_classes([IsAuthenticated])
def create_post(request):
    title = request.data.get('title')
    content = request.data.get('content')
    author = request.user.username  # Automatically take the username of the logged-in user
    
    media_file = request.FILES.get('media_file')
    media_type = request.data.get('media_type')

    # Get circle_ids
    circle_ids = request.data.getlist('circle_ids')
    if not circle_ids:
        raw_circles = request.data.get('circle_ids')
        if raw_circles:
            if isinstance(raw_circles, str):
                circle_ids = [c.strip() for c in raw_circles.split(',') if c.strip()]
            elif isinstance(raw_circles, list):
                circle_ids = raw_circles

    if not title or not content:
        return Response({'detail': 'Title and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not circle_ids:
        return Response({'detail': 'At least one circle_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify membership
    for c_id in circle_ids:
        try:
            circle = Circle.objects.get(id=c_id)
            if not circle.members.filter(id=request.user.id).exists():
                return Response({'detail': f'You are not a member of circle {c_id}.'}, status=status.HTTP_403_FORBIDDEN)
        except Circle.DoesNotExist:
            return Response({'detail': f'Circle {c_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

    post = Post.objects.create(
        user=request.user, 
        title=title, 
        content=content, 
        author=author,
        media_file=media_file,
        media_type=media_type
    )
    post.circles.add(*circle_ids)

    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)



from users.models import Friendship
from django.db.models import Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_posts(request):
    user = request.user
    circle_id = request.query_params.get('circle_id')
    if not circle_id:
        return Response({'detail': 'circle_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        circle = Circle.objects.get(id=circle_id)
    except Circle.DoesNotExist:
        return Response({'detail': 'Circle not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Check if the user is a member of the circle
    if not circle.members.filter(id=user.id).exists():
        return Response({'detail': 'You do not have permission to view posts in this circle.'}, status=status.HTTP_403_FORBIDDEN)
        
    # Filter posts by the circle
    posts = Post.objects.filter(circles=circle).order_by('-created_at')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
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
@permission_classes([IsAuthenticated])
def get_user_posts(request):
    user = request.user
    
    target_user_id = request.query_params.get('user_id')
    if target_user_id:
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        target_user = user

    # Filter posts from target user that belong to circles the requesting user is in
    my_circles = Circle.objects.filter(members=user)
    posts = Post.objects.filter(user=target_user, circles__in=my_circles).distinct().order_by('-created_at')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
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

from rest_framework.throttling import UserRateThrottle

class AIAssistThrottle(UserRateThrottle):
    rate = '10/minute'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AIAssistThrottle])
def ai_assist(request):
    mode = request.data.get('mode')
    content = request.data.get('content', '')
    title = request.data.get('title', '')
    
    if not mode:
        return Response({'error': 'Mode is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if mode != 'Suggest a title' and not content.strip():
        return Response({'error': 'Content is required for this mode.'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        return Response({'error': 'AI services are currently unavailable (missing API key).'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    try:
        import requests
        
        system_prompt = ''
        if mode == 'Improve writing':
            system_prompt = 'Improve the clarity and grammar of this social media post without changing its meaning or adding new claims. Return only the improved text, no explanation:\n\n'
        elif mode == 'Make it shorter':
            system_prompt = 'Condense this social media post to a tighter, shorter version without losing the main point. Return only the condensed text, no explanation:\n\n'
        elif mode == 'Suggest a title':
            system_prompt = 'Generate 3 catchy, short title options for the following social media post content. Return ONLY a JSON list of strings (e.g. ["Title 1", "Title 2"]), no other text or formatting:\n\n'
        elif mode == 'Expand':
            system_prompt = 'Expand this short social media post draft with more detail and engaging language. Keep the original tone. Return only the expanded text, no explanation:\n\n'
        else:
            return Response({'error': 'Invalid mode.'}, status=status.HTTP_400_BAD_REQUEST)
            
        full_prompt = system_prompt + content
        
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }]
        }
        
        res = requests.post(gemini_url, json=payload, headers={'Content-Type': 'application/json'})
        
        if not res.ok:
            return Response({'error': f"AI API error: {res.text}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        res_data = res.json()
        result_text = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # Remove potential markdown json blocks
        if result_text.startswith('```json'):
            result_text = result_text.replace('```json', '', 1).replace('```', '').strip()
        elif result_text.startswith('```'):
            result_text = result_text.replace('```', '', 1).replace('```', '').strip()
        
        if mode == 'Suggest a title':
            import json
            try:
                suggestions = json.loads(result_text)
                if not isinstance(suggestions, list):
                    suggestions = [result_text]
            except json.JSONDecodeError:
                suggestions = [result_text]
            return Response({'suggestions': suggestions})
        else:
            return Response({'suggestions': [result_text]})
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_circles(request):
    if request.method == 'GET':
        circles = Circle.objects.filter(members=request.user).order_by('-created_at')
        serializer = CircleSerializer(circles, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        name = request.data.get('name')
        description = request.data.get('description', '')
        initial_members = request.data.get('members', [])
        
        if not name:
            return Response({'error': 'Name is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        circle = Circle.objects.create(name=name, description=description, created_by=request.user)
        circle.members.add(request.user)
        
        if initial_members:
            # Add initial members (filter out creator if present in list)
            member_ids = [int(m) for m in initial_members if int(m) != request.user.id]
            circle.members.add(*member_ids)
            
        serializer = CircleSerializer(circle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_circle(request, circle_id):
    try:
        circle = Circle.objects.get(id=circle_id, members=request.user)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found or you are not a member.'}, status=status.HTTP_404_NOT_FOUND)
        
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        invitee = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Check if friends
    is_friend = Friendship.objects.filter(
        (Q(from_user=request.user, to_user=invitee, status='accepted') |
         Q(from_user=invitee, to_user=request.user, status='accepted'))
    ).exists()
    
    if not is_friend:
        return Response({'error': 'You can only invite accepted friends.'}, status=status.HTTP_400_BAD_REQUEST)
        
    circle.members.add(invitee)
    return Response({'message': f'Successfully invited {invitee.username} to the circle.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_circle(request, circle_id):
    try:
        circle = Circle.objects.get(id=circle_id, members=request.user)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found or you are not a member.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Remove from members
    circle.members.remove(request.user)
    return Response({'message': 'Successfully left the circle.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member_from_circle(request, circle_id):
    try:
        circle = Circle.objects.get(id=circle_id, created_by=request.user)
    except Circle.DoesNotExist:
        return Response({'error': 'Circle not found or you are not the creator.'}, status=status.HTTP_403_FORBIDDEN)
        
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if int(user_id) == request.user.id:
        return Response({'error': 'You cannot remove yourself from the circle.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        member = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    if member not in circle.members.all():
        return Response({'error': 'User is not in the circle.'}, status=status.HTTP_400_BAD_REQUEST)
        
    circle.members.remove(member)
    return Response({'message': f'Successfully removed {member.username} from the circle.'})