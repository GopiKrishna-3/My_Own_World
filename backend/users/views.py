from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
# from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view,  permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ProfileUpdateSerializer
from .models import User
from .models import Profile, Friendship, Block
from django.db.models import Q
# Create your views here.



@api_view(['POST'])
def signup_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # Check if the username already exists
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Create the user
    user = User.objects.create(
        username=username,
        email=email,
        password=make_password(password),  
    )
    return Response({'message': f'User "{username}" created successfully'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate the user
    user = authenticate(username=username, password=password)
    if user is not None:
        # If authentication is successful, generate a refresh and access token
        refresh = RefreshToken.for_user(user)
        return Response({
            'username': user.username,
            'email':user.email,  # Include the username
            'access': str(refresh.access_token),  # Access token for subsequent requests
            'refresh': str(refresh),  # Refresh token (for token renewal)
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    
@api_view(['POST'])
def logout_user(request):
    # Get the refresh token from the request body
    refresh_token = request.data.get('refresh')

    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create a RefreshToken object from the token received
        token = RefreshToken(refresh_token)
        
        # Blacklist the refresh token to invalidate it
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user  # Get the currently authenticated user

    # Extract the fields from the request data
    username = request.data.get('username')
    email = request.data.get('email')
    phone = request.data.get('phone')
    gender = request.data.get('gender')
    bio = request.data.get('bio')

    # Update the User model
    if username:
        user.username = username
    if email:
        user.email = email
    user.save()

    # Update or create the Profile model
    profile, created = Profile.objects.get_or_create(user=user)
    profile.name = username
    profile.email = email
    profile.phone = phone
    profile.gender = gender
    profile.bio = bio
    profile.save()

    return Response({'message': 'Profile updated successfully!'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Fetch the authenticated user's profile details.
    """
    try:
        # Get the authenticated user's profile
        profile = Profile.objects.get(user=request.user)
        # Serialize the profile data
        serializer = ProfileUpdateSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request, username):
    """
    Fetch any user's profile details by username.
    """
    try:
        user_obj = User.objects.get(username=username)
        profile = Profile.objects.get(user=user_obj)
        serializer = ProfileUpdateSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('q', '')
    blocked_users = Block.objects.filter(blocker=request.user).values_list('blocked_user_id', flat=True)
    blockers = Block.objects.filter(blocked_user=request.user).values_list('blocker_id', flat=True)
    users = User.objects.exclude(id=request.user.id).exclude(id__in=blocked_users).exclude(id__in=blockers)
    if query:
        users = users.filter(username__icontains=query)
    
    results = []
    for u in users:
        # Determine friendship status
        status_val = 'none'
        f1 = Friendship.objects.filter(from_user=request.user, to_user=u).first()
        f2 = Friendship.objects.filter(from_user=u, to_user=request.user).first()
        
        if f1:
            if f1.status == 'accepted':
                status_val = 'friends'
            elif f1.status == 'pending':
                status_val = 'request_sent'
        elif f2:
            if f2.status == 'accepted':
                status_val = 'friends'
            elif f2.status == 'pending':
                status_val = 'request_received'

        results.append({
            'id': u.id,
            'username': u.username,
            'status': status_val
        })
    return Response(results, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    to_user_id = request.data.get('to_user_id')
    try:
        to_user = User.objects.get(id=to_user_id)
        if to_user == request.user:
            return Response({'error': 'Cannot send request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already friends or pending
        existing = Friendship.objects.filter(
            Q(from_user=request.user, to_user=to_user) | 
            Q(from_user=to_user, to_user=request.user)
        ).first()
        
        if existing:
            return Response({'error': 'Friendship or request already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        Friendship.objects.create(from_user=request.user, to_user=to_user, status='pending')
        return Response({'message': 'Friend request sent'}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_friend_request(request):
    from_user_id = request.data.get('from_user_id')
    action = request.data.get('action') # 'accept' or 'reject'
    
    try:
        friendship = Friendship.objects.get(from_user_id=from_user_id, to_user=request.user, status='pending')
        if action == 'accept':
            friendship.status = 'accepted'
            friendship.save()
            return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)
        elif action == 'reject':
            friendship.delete()
            return Response({'message': 'Friend request rejected'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
    except Friendship.DoesNotExist:
        return Response({'error': 'Friend request not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    blocked_users = Block.objects.filter(blocker=request.user).values_list('blocked_user_id', flat=True)
    blockers = Block.objects.filter(blocked_user=request.user).values_list('blocker_id', flat=True)
    friendships = Friendship.objects.filter(
        (Q(from_user=request.user) | Q(to_user=request.user)) & Q(status='accepted')
    ).exclude(from_user_id__in=blocked_users).exclude(to_user_id__in=blocked_users)\
     .exclude(from_user_id__in=blockers).exclude(to_user_id__in=blockers)
    friends = []
    for f in friendships:
        friend_user = f.to_user if f.from_user == request.user else f.from_user
        friends.append({
            'id': friend_user.id,
            'username': friend_user.username
        })
    return Response(friends, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pending_requests(request):
    requests = Friendship.objects.filter(to_user=request.user, status='pending')
    pending = []
    for r in requests:
        pending.append({
            'id': r.from_user.id,
            'username': r.from_user.username
        })
    return Response(pending, status=status.HTTP_200_OK)


from .models import Message
from .serializers import MessageSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, user_id):
    try:
        friend = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver=friend)) |
            (Q(sender=friend) & Q(receiver=request.user))
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Message content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(sender=request.user, receiver=friend, content=content)
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request):
    blocked_username = request.data.get('username')
    try:
        blocked_user = User.objects.get(username=blocked_username)
        
        # Remove any existing friendships
        Friendship.objects.filter(from_user=request.user, to_user=blocked_user).delete()
        Friendship.objects.filter(from_user=blocked_user, to_user=request.user).delete()
        
        # Create block
        Block.objects.get_or_create(blocker=request.user, blocked_user=blocked_user)
        return Response({'message': 'User blocked successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)