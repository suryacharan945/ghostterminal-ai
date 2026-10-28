# GhostTerminal AI - API Contract Specification

## Version: `0.1.0` (Part 1 Foundation)
Base URL: `http://127.0.0.1:8000`

---

## 1. System Health Endpoint

### `GET /api/health`
Retrieves operational status, application version, current development stage, and model loading state.

#### Request
- **Method**: `GET`
- **Headers**:
  - `Accept`: `application/json`

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "app": "GhostTerminal AI",
  "version": "0.1.0",
  "stage": "Part 1 - Foundation",
  "environment": "development",
  "model_status": "not_loaded",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct"
}
```

#### Schema
| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | string | Health flag (always `"ok"` when operational) |
| `app` | string | Name of the service |
| `version` | string | Application semantic version |
| `stage` | string | Current challenge stage |
| `environment` | string | Active deployment environment (`development` / `production`) |
| `model_status` | string | Status of local weights (`"not_loaded"` in Part 1) |
| `model_id` | string | Target open-weight model Hugging Face identifier |

---

## 2. Terminal Inference Placeholder

### `POST /api/infer`
Submits a user prompt to the GhostTerminal engine. In **Part 1**, this endpoint is explicitly marked as not implemented and safely returns HTTP `501 Not Implemented`.

#### Request
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Body**:
```json
{
  "prompt": "Who is lurking inside this terminal?"
}
```

#### Response (`501 Not Implemented`)
```json
{
  "status": "not_implemented",
  "stage": "Part 1 - Foundation",
  "message": "AI inference engine is not implemented in Part 1. Integration with local open-weight model Qwen2.5-0.5B-Instruct is scheduled for Part 2.",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct",
  "model_loaded": false
}
```

#### Validation Error (`422 Unprocessable Entity`)
Occurs if `prompt` is empty or exceeds 2,000 characters:
```json
{
  "error": "Validation error",
  "details": [
    {
      "type": "string_too_short",
      "loc": ["body", "prompt"],
      "msg": "String should have at least 1 character"
    }
  ],
  "status_code": 422
}
```

---

## 3. Root Discovery Endpoint

### `GET /`
Provides discovery links to API docs and health endpoint.

#### Response (`200 OK`)
```json
{
  "app": "GhostTerminal AI",
  "version": "0.1.0",
  "stage": "Part 1 - Foundation",
  "health_check": "/api/health",
  "documentation": "/docs"
}
```
