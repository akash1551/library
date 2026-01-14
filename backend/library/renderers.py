from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context["response"].status_code

        # Check if the data is already formatted by our custom_exception_handler
        # If 'data' is a dictionary and already has a 'status' key, we assume it's handled.
        if isinstance(data, dict) and "status" in data:
            return super(CustomJSONRenderer, self).render(
                data, accepted_media_type, renderer_context
            )

        # Define default envelope
        response_data = {
            "status": "success",
            "code": status_code,
            "message": "OK",
            "data": data,
        }

        # Handle errors that weren't caught/formatted by the exception handler
        # (Rare, but good for safety)
        if not str(status_code).startswith("2"):
            response_data["status"] = "error"
            response_data["message"] = "Operation failed"
            response_data["errors"] = data
            if "data" in response_data:
                del response_data["data"]

        return super(CustomJSONRenderer, self).render(
            response_data, accepted_media_type, renderer_context
        )
