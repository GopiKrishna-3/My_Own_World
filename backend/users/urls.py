from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_user, name='login'),
    path('signup', views.signup_user, name='signup'),
    path('logout',views.logout_user,name='logout'),

    
    path('profile/update',views.update_profile,name='update_profile'),
    path('profile/data', views.get_profile, name='get_profile'),

    path('friends/search', views.search_users, name='search_users'),
    path('friends/request/send', views.send_friend_request, name='send_friend_request'),
    path('friends/request/respond', views.respond_friend_request, name='respond_friend_request'),
    path('friends/list', views.list_friends, name='list_friends'),
    path('friends/pending', views.list_pending_requests, name='list_pending_requests'),
    path('friends/chat/<int:user_id>', views.chat_messages, name='chat_messages'),
    path('profile/data/<str:username>', views.get_user_profile, name='get_user_profile'),
    path('friends/block', views.block_user, name='block_user'),
]
