from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Book, Member, Borrowing
from .serializers import (
    BookSerializer,
    MemberSerializer,
    BorrowingSerializer,
    BorrowingCreateSerializer,
)


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "author", "isbn"]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["first_name", "last_name", "email"]


class BorrowingViewSet(viewsets.ModelViewSet):
    queryset = Borrowing.objects.all()
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["borrow_date", "status"]

    def get_serializer_class(self):
        if self.action == "create":
            return BorrowingCreateSerializer
        return BorrowingSerializer

    def get_queryset(self):
        """
        Optionally filter by member_id or status (e.g., active loans).
        Requirement: List borrowed books.
        """
        queryset = Borrowing.objects.all()
        member_id = self.request.query_params.get("member_id")
        book_id = self.request.query_params.get("book_id")
        loan_status = self.request.query_params.get("status")

        if member_id:
            queryset = queryset.filter(member_id=member_id)
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        if loan_status:
            queryset = queryset.filter(status=loan_status)

        return queryset

    @action(detail=True, methods=["post"])
    def return_book(self, request, pk=None):
        """
        Custom endpoint to mark a book as returned.
        Requirement: Record when a borrowed book is returned.
        """
        borrowing = self.get_object()

        if borrowing.status == "RETURNED":
            return Response(
                {"detail": "This book has already been returned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update status (Model save() logic handles inventory increment)
        borrowing.status = "RETURNED"
        borrowing.return_date = timezone.now()
        borrowing.save()

        return Response(BorrowingSerializer(borrowing).data)
