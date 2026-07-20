from django.urls import path
from . import views

urlpatterns = [
    path('post/<int:post_id>/like/', views.like_post, name='like_post'),
    path('post/<int:post_id>/dislike/', views.dislike_post, name='dislike_post'),
     path('post/<int:post_id>/interaction-status/', views.post_interaction_status, name='post_interaction_status'),
    path('posts/', views.create_post, name='create_post'),
    path('posts/get/', views.get_all_posts, name='get_all_posts'),
    path('posts/user/', views.get_user_posts, name='get_user_posts'),
    path('posts/ai-assist/', views.ai_assist, name='ai_assist'),
    path('post/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('user/<str:username>/follow/', views.follow_user, name='follow_user'),
    path('user/<str:username>/unfollow/', views.unfollow_user, name='unfollow_user'),
    path('post/<int:post_id>/comments/', views.get_comments, name='get_comments'),
    path('post/<int:post_id>/comments/add/', views.add_comment, name='add_comment'),
    
    # Circles Endpoints
    path('circles/', views.manage_circles, name='manage_circles'),
    path('circles/<int:circle_id>/invite/', views.invite_to_circle, name='invite_to_circle'),
    path('circles/<int:circle_id>/leave/', views.leave_circle, name='leave_circle'),
    path('circles/<int:circle_id>/remove-member/', views.remove_member_from_circle, name='remove_member_from_circle'),




   
]
