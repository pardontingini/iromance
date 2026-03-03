from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


def age_calculator(request):
    context = {}
    if request.method == "POST":
        try:
            user_age = int(request.POST.get("user_age", "").strip())
            partner_age_raw = request.POST.get("partner_age", "").strip()
            partner_age = int(partner_age_raw) if partner_age_raw else None

            user_min = max(user_age / 2 + 7, 18)
            user_max = 2 * (user_age - 7)

            partner_check = None
            user_check_for_partner = None

            if partner_age is not None:
                partner_min = max(partner_age / 2 + 7, 18)
                partner_max = 2 * (partner_age - 7)

                partner_check = user_min <= partner_age <= user_max
                user_check_for_partner = partner_min <= user_age <= partner_max

            context.update(
                {
                    "user_age": user_age,
                    "partner_age": partner_age,
                    "user_min": round(user_min, 1),
                    "user_max": round(user_max, 1),
                    "partner_check": partner_check,
                    "user_check_for_partner": user_check_for_partner,
                }
            )
        except ValueError:
            context["error"] = "Please enter valid whole numbers for age."

    return render(request, "age_calculator.html", context)


@api_view(["POST"])
def age_api(request):
    """
    Stateless API that calculates min/max acceptable ages and compatibility.
    """
    try:
        user_age = int(str(request.data.get("user_age", "")).strip())
    except (ValueError, TypeError):
        return Response(
            {"error": "user_age is required and must be a whole number."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    partner_age_raw = request.data.get("partner_age", "")
    try:
        partner_age = (
            int(str(partner_age_raw).strip())
            if partner_age_raw not in (None, "")
            else None
        )
    except (ValueError, TypeError):
        return Response(
            {"error": "partner_age must be a whole number if provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_min = max(user_age / 2 + 7, 18)
    user_max = 2 * (user_age - 7)

    partner_check = None
    user_check_for_partner = None

    if partner_age is not None:
        partner_min = max(partner_age / 2 + 7, 18)
        partner_max = 2 * (partner_age - 7)

        partner_check = user_min <= partner_age <= user_max
        user_check_for_partner = partner_min <= user_age <= partner_max

    return Response(
        {
            "user_age": user_age,
            "partner_age": partner_age,
            "user_min": round(user_min, 1),
            "user_max": round(user_max, 1),
            "partner_in_user_range": partner_check,
            "user_in_partner_range": user_check_for_partner,
        }
    )