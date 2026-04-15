# views.py
from rest_framework import status, views
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
import jwt, datetime
from django.conf import settings
from .models import User, Accounts, Role
from django.db.models import Sum

class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # .save() calls the UserManager.create_user method
            user = serializer.save()
            
            # Convention: Do not log the user in immediately if 
            # you require email verification first.
            return Response({
                "message": "User created successfully",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # 1. Use timezone-aware datetimes (utcnow is deprecated)
            now = datetime.datetime.now(datetime.timezone.utc)
            payload = {
                'user_id': str(user.id), # Ensure UUID is a string
                'exp': now + datetime.timedelta(minutes=60),
                'iat': now
            }
            
            # 2. Modern PyJWT returns a string, no need to .decode('utf-8')
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm =   settings.JWT_ALGORITHM)
              # Debugging line
            # 3. Create the response object first
            response = Response({
                "message": "Login successful",
                "user_id": user.id,
                "token": token,
            }, status=status.HTTP_200_OK)

            # 4. Set the cookie on the response object
            response.set_cookie(
                key='access_token',
                value=token,
                httponly=True,   # Security: Prevents JS access
                secure = settings.DEBUG,     # Security: Only over HTTPS
                samesite='Lax',  # Security: CSRF protection
                max_age=60  * settings.JWT_EXPIRY_MINUTES,   # 1 hour
                path='/'        # Cookie is valid for the entire domain
            )

            return response
            
        # Extract the first error message for a clean response
        errors = serializer.errors
        if 'non_field_errors' in errors:
            message = errors['non_field_errors'][0]
        else:
            message = "Invalid login credentials."
        
        return Response({"message": str(message)}, status=status.HTTP_401_UNAUTHORIZED)
        

class UserView(views.APIView):  
    
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
           
            user = Accounts.objects.get(user_id=user_id)
            serializer = UserSerializer(user)
            # print("USER:", serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)

            
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print("ERROR:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LogoutView(views.APIView):
    def post(self, request):
        response = Response({
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)
        response.delete_cookie('token')
        return response


        
class UpdateUserRoleView(views.APIView):
    """POST /members/update-role/ — Change a user's role (ADMIN only)."""
    
    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')
        if not token:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # 1. Check if the requester is an ADMIN
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            requester_id = payload['user_id']
            requester_account = Accounts.objects.get(user_id=requester_id)
            
            if not requester_account.role or requester_account.role.name != 'ADMIN':
                return Response({"error": "Admin privileges required"}, status=status.HTTP_403_FORBIDDEN)
            
            # 2. Get target user and new role
            target_user_id = request.data.get('user_id')
            new_role_name = request.data.get('role') # 'USER' or 'ADMIN'
            
            if not target_user_id or not new_role_name:
                return Response({"error": "user_id and role are required"}, status=status.HTTP_400_BAD_REQUEST)
            
            target_account = Accounts.objects.get(user_id=target_user_id)
            new_role_obj = Role.objects.get(name=new_role_name.upper())
            
            # 3. Update role
            target_account.role = new_role_obj
            target_account.save()
            
            return Response({
                "message": f"Successfully updated user role to {new_role_name}"
            }, status=status.HTTP_200_OK)
            
        except (Role.DoesNotExist, Accounts.DoesNotExist):
             return Response({"error": "User or Role not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
