# 🧠 SYSTEM OVERVIEW

You want:

👉 Input:

- Text (natural language)
- PDF (parsed text)
- CSV (structured)

👉 Output:

- Clean **budget JSON schema**

👉 With:

- Category validation (from DB)
- Fallback to `"Other"`

---

# 🏗️ ARCHITECTURE

### Flow:

```
User Input → Django Endpoint → Preprocessing → LLM (if needed) → Validation → Save / Return JSON
```

---

# 🚀 STEP 1: DEFINE YOUR TARGET SCHEMA (STRICT)

This is critical — everything revolves around this.

```python
BUDGET_ITEM_SCHEMA = {
    "id": "uuid",
    "budget": "uuid",
    "category": "uuid",
    "category_id": "uuid",
    "planned_amount": "string",
    "spent": "float",
    "category_name": "string",
    "description": "string"
}
```

---

# 🚀 STEP 2: DJANGO ENDPOINT DESIGN

### Endpoint:

```http
POST /api/budget/parse/
```

### Accept:

- `text` (optional)
- `file` (pdf or csv)

---

### View (DRF Example)

```python
from rest_framework.views import APIView
from rest_framework.response import Response

class BudgetParseView(APIView):
    def post(self, request):
        text = request.data.get("text")
        file = request.FILES.get("file")

        if file:
            if file.name.endswith(".pdf"):
                parsed_text = extract_pdf_text(file)
                result = run_llm_pipeline(parsed_text)

            elif file.name.endswith(".csv"):
                result = process_csv(file)

            else:
                return Response({"error": "Unsupported file type"}, status=400)

        elif text:
            result = run_llm_pipeline(text)

        else:
            return Response({"error": "No input provided"}, status=400)

        validated = validate_and_enrich(result)

        return Response(validated)
```

---

# 🚀 STEP 3: CATEGORY LOADING (IMPORTANT)

```python
def get_categories():
    from budget.models import Category
    return list(Category.objects.values("id", "name"))
```

---

# 🚀 STEP 4: SYSTEM PROMPT (VERY IMPORTANT 🔥)

Here’s a **strong production-grade prompt**:

```text
You are an agricultural financial assistant.

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
```

---

# 🚀 STEP 5: LLM PIPELINE FUNCTION

```python
import openai
import json

def run_llm_pipeline(text):
    categories = get_categories()

    prompt = SYSTEM_PROMPT.format(
        user_input=text,
        category_list=categories
    )

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}]
    )

    content = response["choices"][0]["message"]["content"]

    print(content)

    return json.loads(content)
```

---

# 🚀 STEP 6: PDF PROCESSING

```python
from PyPDF2 import PdfReader

def extract_pdf_text(file):
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text
```

---

# 🚀 STEP 7: CSV PIPELINE (NO LLM ⚡)

### Expected CSV headers:

```
category_name,planned_amount,description
```

---

### CSV Processing

```python
import csv
import uuid

def process_csv(file):
    categories = get_categories()
    category_map = {c["name"].lower(): c["id"] for c in categories}

    result = []

    reader = csv.DictReader(file.read().decode().splitlines())

    for row in reader:
        cat_name = row.get("category_name", "").strip().lower()

        if cat_name in category_map:
            cat_id = category_map[cat_name]
            category_name = cat_name.title()
        else:
            cat_id = category_map.get("other")
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
```

---

# 🚀 STEP 8: VALIDATION + ENRICHMENT

```python
def validate_and_enrich(ddddddata):
    categories = get_categories()
    category_map = {c["id"]: c["name"] for c in categories}

    for item in data:
        if item["category"] not in category_map:
            # fallback to Other
            other = next(c for c in categories if c["name"].lower() == "other")
            item["category"] = other["id"]
            item["category_name"] = "Other"

    return data
```
