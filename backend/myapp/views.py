from django.shortcuts import render
from rest_framework import generics
from .models import Availability
from .serializers import AvailabilitySerializer

class AvailabilityListCreateView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer

class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer

