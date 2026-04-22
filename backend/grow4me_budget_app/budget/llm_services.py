import os
import csv
import json
import uuid
from PyPDF2 import PdfReader
import google.generativeai as genai
from .models import BudgetCategory

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are an agricultural financial assistant.

Your task is to convert unstructured farm-related input into a structured budget list.

OUTPUT FORMAT:
Return ONLY a valid JSON array. No explanations.

Each object must follow this schema:
- id: generate a UUID
- budget: provided externally (leave as null if not given)
- category: must match a provided category_id
- category_id: same as category
- planned_amount: string decimal (e.g. "5000.00")
- spent: always 0.0
- category_name: must match category
- description: short but clear explanation of the expense

RULES:

1. You will be given a list of valid categories:
   Each category has:
   - id
   - name

2. You MUST map each item to the closest category.

3. If no category matches:
   - Use category_name = "Other"
   - Use the provided "Other" category_id
   - Add a meaningful description explaining why it is uncategorized

4. Extract all monetary values clearly.
5. If no amount is given, estimate reasonably but conservatively.
6. Split combined items into separate entries.
7. Keep descriptions short and practical.

DO NOT:
- Return text outside JSON
- Invent categories outside the provided list
- Leave required fields empty

INPUT:
{user_input}

CATEGORIES:
{category_list}
"""

def get_categories():
    """Fetch categories from the database."""
    return list(BudgetCategory.objects.all().values("id", "category_name"))

def extract_pdf_text(file):
    """Extract text from an uploaded PDF file."""
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def run_llm_pipeline(text):
    """Process natural language text using Gemini to generate budget items."""
    categories = get_categories()
    
    # Structure categories for prompt
    cat_list_str = json.dumps([{"id": str(c["id"]), "name": c["category_name"]} for c in categories])
    
    prompt = SYSTEM_PROMPT.format(
        user_input=text,
        category_list=cat_list_str
    )

    model = genai.GenerativeModel("gemini-2.0-flash")
    
    # Gemini 1.5 Flash supports system instructions and generation config for JSON
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        )
    )

    content = response.text.strip()
    print(content)
    return json.loads(content)

def process_csv(file):
    """Directly convert CSV data into budget items without LLM intervention."""
    categories = get_categories()
    category_map = {c["category_name"].lower(): str(c["id"]) for c in categories}
    
    # Ensure "Other" category exists
    other_cat, _ = BudgetCategory.objects.get_or_create(category_name="Other")
    other_cat_id = str(other_cat.id)

    result = []
    # Read CSV
    decoded_file = file.read().decode("utf-8-sig").splitlines()
    reader = csv.DictReader(decoded_file)
    
    # Validate headers
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
            "description": row.get("description", "No description provided")
        })

    return result

def validate_and_enrich(data):
    """Final validation to ensure all items map correctly to database categories."""
    categories = get_categories()
    category_map = {str(c["id"]): c["category_name"] for c in categories}
    
    # Ensure "Other" exists
    other_cat, _ = BudgetCategory.objects.get_or_create(category_name="Other")
    other_cat_id = str(other_cat.id)

    for item in data:
        cat_id = str(item.get("category"))
        if cat_id not in category_map:
            item["category"] = other_cat_id
            item["category_id"] = other_cat_id
            item["category_name"] = "Other"
            
    return data
