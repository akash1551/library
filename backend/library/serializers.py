from rest_framework import serializers
from .models import Book, Member, Borrowing


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = "__all__"


class BorrowingSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    member_name = serializers.CharField(source="member.first_name", read_only=True)

    class Meta:
        model = Borrowing
        fields = [
            "id",
            "book",
            "book_title",
            "member",
            "member_name",
            "borrow_date",
            "return_date",
            "status",
        ]
        read_only_fields = ["borrow_date", "return_date"]


class BorrowingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Borrowing
        fields = ["book", "member"]
