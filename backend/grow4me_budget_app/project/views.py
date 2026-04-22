import traceback
import uuid
import jwt
from rest_framework import status, views
from rest_framework.response import Response
from .serializers import ProjectSerializer, AllProjectSerializer, CreateProjectSerializer
from django.conf import settings
from .models import Membership, Projects, User
from rest_framework.permissions import IsAuthenticated


class UserProjectView(views.APIView):
    """
    Get projects for the authenticated user.
    """
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)

            projects = user.projects.all()
            serializer = AllProjectSerializer(projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("================ ERROR TRACEBACK ================")
            traceback.print_exc()
            print(f"Error Message: {e}")
            print("=================================================")

        return Response(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class AllProjectsView(views.APIView):
    """
    Get all projects.
    """
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)

            projects = Projects.objects.all()
            serializer = AllProjectSerializer(projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("================ ERROR TRACEBACK ================")
            traceback.print_exc()
            print(f"Error Message: {e}")
            print("=================================================")

        return Response(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ProjectDetailsView(views.APIView):
    """
    Get details of a specific project.
    """
    def get(self, request, project_id):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)

            project = Projects.objects.get(project_id=project_id)
           
            serializer = ProjectSerializer(project, context={'user_id': user_id})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Projects.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("================ ERROR TRACEBACK ================")
            traceback.print_exc()
            print(f"Error Message: {e}")
            print("=================================================")
            return Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateProjectView(views.APIView):
    """
    Create a new project. The project_id is auto-generated as a UUID.
    """
    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)

            serializer = CreateProjectSerializer(data=request.data)
            if serializer.is_valid():
                # Auto-generate UUID for project_id
                project = serializer.save()

                # Optionally add the creator as a member
                # Membership.objects.create(user=user, project=project)

                return Response({
                    "message": "Project created successfully",
                    "id": str(project.id),
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("================ ERROR TRACEBACK ================")
            traceback.print_exc()
            print(f"Error Message: {e}")
            print("=================================================")
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AddUserToProjectView(views.APIView):
    """
    Add a user to a project.
    """
    def post(self, request, project_id):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1] or request.COOKIES.get('access_token')

        if not token:
            return Response({"error": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            project = Projects.objects.get(id=project_id)

            membership, created = Membership.objects.get_or_create(
                user=user,
                project=project,
            )

            if not created:
                return Response(
                    {"message": "User already in project"},
                    status=status.HTTP_200_OK
                )

            return Response(
                {"message": "User added successfully"},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print("================ ERROR TRACEBACK ================")
            traceback.print_exc()
            print(f"Error Message: {e}")
            print("=================================================")
            return Response(
                {"error": str(e), "type": type(e).__name__},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )