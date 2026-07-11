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
from .models import Profile
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