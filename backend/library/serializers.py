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

    def validate(self, data):
        """
        Check if the book is available before attempting to save.
        """
        book = data["book"]

        # Check availability
        if book.available_copies < 1:
            raise serializers.ValidationError(
                {"book": [f"Book '{book.title}' is not currently available."]}
            )

        # Check if member already has an active loan for this book copy
        member = data['member']
        if Borrowing.objects.filter(
                book=book, member=member, status='ACTIVE').exists():
            raise serializers.ValidationError({
                "non_field_errors": ["Member already borrowed this book."]
            })

        return data
