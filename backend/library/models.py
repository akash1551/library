from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class Member(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    joined_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(
        max_length=13, unique=True, help_text="13 Character ISBN number"
    )
    publisher = models.CharField(max_length=255, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} ({self.isbn})"

    def clean(self):
        if self.available_copies > self.total_copies:
            raise ValidationError("Available copies cannot exceed total copies.")


class Borrowing(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("RETURNED", "Returned"),
    )

    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name="borrowings")
    member = models.ForeignKey(
        Member, on_delete=models.PROTECT, related_name="borrowings"
    )
    borrow_date = models.DateTimeField(default=timezone.now)
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-borrow_date"]

    def __str__(self):
        return f"{self.member} - {self.book} ({self.status})"

    def save(self, *args, **kwargs):
        # Validation: If creating a new active borrowing, check availability
        if not self.pk and self.status == "ACTIVE":
            if self.book.available_copies < 1:
                raise ValidationError(
                    f"Book '{self.book.title}' is not currently available."
                )

            self.book.available_copies -= 1
            self.book.save()

        # Handle returning a book
        if self.pk:
            original = Borrowing.objects.get(pk=self.pk)
            if original.status == "ACTIVE" and self.status == "RETURNED":
                if not self.return_date:
                    self.return_date = timezone.now()

                self.book.available_copies += 1
                self.book.save()

        super().save(*args, **kwargs)
