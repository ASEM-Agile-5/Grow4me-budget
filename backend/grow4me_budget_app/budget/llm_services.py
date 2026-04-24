import os
import re
import csv
import json
import uuid
from PyPDF2 import PdfReader
from .models import BudgetCategory


CATEGORY_KEYWORDS = [
    (["seed", "seedling", "planting material", "germination"], "Seeds"),
    (["fertilizer", "fertiliser", "manure", "compost", "npk", "urea", "lime"], "Fertilizer"),
    (["labor", "labour", "worker", "wage", "salary", "casual", "harvesting", "weeding", "planting labor"], "Labor"),
    (["pesticide", "herbicide", "fungicide", "insecticide", "chemical", "weedicide", "agrochemical"], "Pesticides"),
    (["transport", "transportation", "logistics", "delivery", "truck", "freight", "vehicle", "haulage"], "Transport"),
    (["equipment", "tool", "machinery", "tractor", "pump", "sprayer", "machine"], "Equipment"),
    (["irrigation", "sprinkler", "drip", "watering", "pipe"], "Irrigation"),
    (["land", "rent", "lease", "field prep", "land clearing", "ploughing", "tillage"], "Land"),
    (["storage", "warehouse", "silo", "sack", "bag", "packaging"], "Storage"),
    (["fuel", "diesel", "petrol", "gas"], "Fuel"),
    (["water", "water supply"], "Irrigation"),
]

FILLER_WORDS = r"\b(i need|i want|we need|we want|for|costing|at|worth|of|on|the|a|an|some|and|about|approximately|around|roughly|buy|purchase|get|spend|cost)\b"


def get_categories():
    return list(BudgetCategory.objects.all().values("id", "category_name"))


def extract_pdf_text(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def _find_category(segment_text, categories):
    text_lower = segment_text.lower()
    for keywords, target_name in CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in text_lower:
                match = next(
                    (c for c in categories if target_name.lower() in c["category_name"].lower()),
                    None,
                )
                if match:
                    return match
    other_cat, _ = BudgetCategory.objects.get_or_create(category_name="Other")
    return {"id": str(other_cat.id), "category_name": "Other"}


def run_llm_pipeline(text):
    """
    Parse natural language budget text into structured items using regex
    and keyword matching. No external AI API required.
    """
    categories = get_categories()

    # Split into segments by comma, semicolon, newline, or the word "and"
    segments = re.split(r"[,;\n]|\band\b", text, flags=re.IGNORECASE)

    items = []
    seen_amounts = set()

    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue

        # Find all numbers in this segment
        raw_numbers = re.findall(r"[\d,]+(?:\.\d+)?", seg)
        if not raw_numbers:
            continue

        amounts = []
        for n in raw_numbers:
            try:
                amounts.append(float(n.replace(",", "")))
            except ValueError:
                continue

        amounts = [a for a in amounts if a > 0]
        if not amounts:
            continue

        # Use the largest number as the planned amount to avoid picking up quantities
        amount = max(amounts)
        if amount in seen_amounts:
            continue
        seen_amounts.add(amount)

        # Strip numbers and filler words to derive a clean description
        desc = re.sub(r"[\d,]+(?:\.\d+)?", "", seg)
        desc = re.sub(FILLER_WORDS, " ", desc, flags=re.IGNORECASE)
        desc = re.sub(r"[^\w\s]", " ", desc)
        desc = re.sub(r"\s+", " ", desc).strip()

        if not desc:
            desc = "Budget item"

        cat = _find_category(seg, categories)

        items.append({
            "id": str(uuid.uuid4()),
            "budget": None,
            "category": str(cat["id"]),
            "category_id": str(cat["id"]),
            "planned_amount": f"{amount:.2f}",
            "spent": 0.0,
            "category_name": cat["category_name"],
            "description": desc.capitalize(),
        })

    return items


def process_csv(file):
    categories = get_categories()
    category_map = {c["category_name"].lower(): str(c["id"]) for c in categories}

    other_cat, _ = BudgetCategory.objects.get_or_create(category_name="Other")
    other_cat_id = str(other_cat.id)

    result = []
    decoded_file = file.read().decode("utf-8-sig").splitlines()
    reader = csv.DictReader(decoded_file)

    required_headers = {"category_name", "planned_amount", "description"}
    if not required_headers.issubset(set(reader.fieldnames or [])):
        return {"error": f"Invalid CSV headers. Required: {', '.join(required_headers)}"}

    for row in reader:
        raw_cat_name = row.get("category_name", "").strip().lower()
        if raw_cat_name in category_map:
            cat_id = category_map[raw_cat_name]
            category_name = raw_cat_name.title()
        else:
            cat_id = other_cat_id
            category_name = "Other"

        result.append({
            "id": str(uuid.uuid4()),
            "budget": None,
            "category": cat_id,
            "category_id": cat_id,
            "planned_amount": str(row.get("planned_amount", "0.00")),
            "spent": 0.0,
            "category_name": category_name,
            "description": row.get("description", "No description provided"),
        })

    return result


def validate_and_enrich(data):
    categories = get_categories()
    category_map = {str(c["id"]): c["category_name"] for c in categories}

    other_cat, _ = BudgetCategory.objects.get_or_create(category_name="Other")
    other_cat_id = str(other_cat.id)

    for item in data:
        cat_id = str(item.get("category"))
        if cat_id not in category_map:
            item["category"] = other_cat_id
            item["category_id"] = other_cat_id
            item["category_name"] = "Other"

    return data
