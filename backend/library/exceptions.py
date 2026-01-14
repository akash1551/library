from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            "status": "error",
            "code": response.status_code,
            "message": (
                "Request validation failed"
                if response.status_code == 400
                else "An error occurred"
            ),
            "errors": response.data,
        }

        # Replace the original data with our wrapper
        response.data = custom_response_data

    return response
