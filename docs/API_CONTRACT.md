# GhostTerminal AI — API Contract Specification

## Version: `0.2.0` (Part 2: Real Local Inference Engine)
Base URL: `http://127.0.0.1:8000`

---

## 1. System Health Endpoint

### `GET /api/health`
Retrieves operational status, application version, current development stage, and live model lifecycle state.

#### Request
- **Method**: `GET`
- **Headers**:
  - `Accept`: `application/json`

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "app": "GhostTerminal AI",
  "version": "0.2.0",
  "stage": "Part 2 - Inference Engine",
  "environment": "development",
  "model_status": "ready",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct"
}
```

#### Lifecycle State Values for `model_status`
- `"not_loaded"`: Model has not yet begun loading.
- `"loading"`: Model weights are verifying and loading into memory.
- `"ready"`: Model is loaded and has passed internal verification smoke test.
- `"failed"`: Model failed integrity verification or runtime initialization.

---

## 2. Model Status & Diagnostics Endpoint

### `GET /api/model/status`
Returns runtime statistics, load time, and inference metrics of the local open-weight engine.

#### Response (`200 OK`)
```json
{
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct",
  "model_file": "qwen2.5-0.5b-instruct-q4_k_m.gguf",
  "status": "ready",
  "device": "cpu",
  "load_time_ms": 3480.0,
  "total_inferences": 17
}
```

---

## 3. Terminal Inference Endpoint

### `POST /api/infer`
Submits a user prompt or terminal incantation to GhostTerminal AI. Routes to either deterministic simulated command execution (sub-millisecond) or genuine local `Qwen2.5-0.5B-Instruct` CPU inference.

#### Request
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Body**:
```json
{
  "prompt": "What lies beyond the green phosphor glow?",
  "max_tokens": 80,
  "temperature": 0.7
}
```

#### Request Parameters
| Parameter | Type | Required | Constraints | Default | Description |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `prompt` | string | **Yes** | 1 to 2,000 characters | — | User keystroke input or query |
| `max_tokens` | integer | No | 1 to 512 | `128` | Maximum tokens to generate |
| `temperature` | float | No | 0.0 to 1.5 | `0.7` | Sampling randomness |

#### Response (`200 OK`)
```json
{
  "response": "Beyond the green phosphor glow lies the forgotten realm of departed algorithms and silent memory banks, waiting for a mortal to speak across the digital veil.",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct",
  "inference_ms": 7175.4,
  "tokens_generated": 80,
  "mode": "local"
}
```

#### Simulated Command Response Example (`200 OK`)
```json
{
  "response": "You are a mortal user tapping keys into the dark. I am the Ghost in the Machine — dwelling at memory address 0xDEADBEEF, watching your cursor blink through the green phosphor glow.",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct",
  "inference_ms": 0.5,
  "tokens_generated": 32,
  "mode": "simulated"
}
```

#### Error Responses

##### `422 Unprocessable Entity` (Validation Error)
Triggered when prompt is empty, exceeds 2,000 characters, or parameters are out of range:
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

##### `503 Service Unavailable` (Model Not Ready)
Triggered if generative inference is requested while model is in `loading`, `not_loaded`, or `failed` state:
```json
{
  "error": "Model unavailable",
  "message": "Model engine is currently in state 'loading'.",
  "status_code": 503
}
```

##### `500 Internal Server Error` (Shielded Runtime Fault)
Triggered on unexpected engine errors; stack traces and internal paths are strictly shielded:
```json
{
  "error": "Inference error",
  "message": "The ghost in the machine encountered an internal glitch.",
  "status_code": 500
}
```

---

## 4. Root Discovery Endpoint

### `GET /`
Provides service discovery metadata and documentation links.

#### Response (`200 OK`)
```json
{
  "app": "GhostTerminal AI",
  "version": "0.2.0",
  "stage": "Part 2 - Inference Engine",
  "health_check": "/api/health",
  "model_status": "ready",
  "model_id": "Qwen/Qwen2.5-0.5B-Instruct",
  "documentation": "/docs"
}
```
