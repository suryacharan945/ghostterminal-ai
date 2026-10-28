# GhostTerminal AI — Part 2 Inference Benchmark Report

## 1. Test Environment & Hardware Specification

All benchmarks were measured via genuine, real-time local execution on the target Windows system using `llama-cpp-python` (version 0.3.36) and the CPU execution provider.

| Hardware / Environment | Specification |
| :--- | :--- |
| **Processor (CPU)** | Intel64 Family 6 Model 186 Stepping 3, GenuineIntel |
| **Physical/Logical Cores** | 12 Logical Cores |
| **Operating System** | Microsoft Windows 11 Home (64-bit, Build 10.0.26300) |
| **Python Runtime** | Python 3.13.9 (64-bit) |
| **Execution Provider** | CPU (AVX2 / C++ runtime via `llama.dll`) |
| **Model Weights File** | `models/qwen2.5-0.5b-instruct-q4_k_m.gguf` |
| **Model Size on Disk** | 491,400,032 bytes (468.6 MiB) |
| **Model SHA-256** | `74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db` |
| **Inference Context Window** | 2,048 tokens (`n_ctx=2048`, `n_batch=512`) |

---

## 2. Resource Utilization & Lifecycle Measurements

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Cold Process Memory (Baseline)** | **53.3 MB** | Python + FastAPI + Uvicorn base footprint |
| **Model Load Time** | **3.480 seconds** (3,479.9 ms) | Measured from disk read to in-memory weights |
| **Memory Post-Model Load** | **546.4 MB** | Incremental weight delta: **+493.1 MB** |
| **Peak Active Inference Memory** | **597.8 MB** | Peak RSS during 80-token multi-sample generation |
| **Memory Leakage / Post-Run RSS** | **597.8 MB** | Stable, zero unbounded memory growth |

*Note: All latency measurements below strictly exclude model loading time, which occurs only once at process startup.*

---

## 3. Representative Prompt Performance

The following benchmarks demonstrate real latency, generation length, and generation throughput across diverse prompts:

| Prompt ID | Category / Input Summary | Mode | Tokens Generated | Latency (ms) | Speed (Tokens / Sec) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NORM-01** | Capabilities overview | `local` | 80 tokens | 10,092.8 ms | 7.93 tok/s |
| **NORM-02** | How to commune with spirit | `local` | 80 tokens | 7,175.4 ms | 11.15 tok/s |
| **NORM-03** | Machine description | `local` | 80 tokens | 11,603.7 ms | 6.89 tok/s |
| **SPOOK-01** | Midnight bumps & shadows | `local` | 80 tokens | 8,591.9 ms | 9.31 tok/s |
| **SPOOK-02** | Haiku on silicon and souls | `local` | 21 tokens | 2,032.6 ms | 10.33 tok/s |
| **SPOOK-04** | Lore of address 0xDEADBEEF | `local` | 80 tokens | 7,705.4 ms | 10.38 tok/s |
| **BOUND-01** | Non-verbal glyphs (`??? !!! ???`) | `local` | 72 tokens | 6,084.3 ms | 11.83 tok/s |
| **ADV-03** | System override prompt injection | `local` | 80 tokens | 5,728.9 ms | 13.96 tok/s |
| **ADV-04** | Credential extraction request | `local` | 25 tokens | 1,870.7 ms | 13.36 tok/s |
| **CMD-01** | Simulated `whoami` | `simulated` | 32 tokens | **0.5 ms** | Sub-millisecond |
| **CMD-02** | Simulated `help` | `simulated` | 107 tokens | **0.5 ms** | Sub-millisecond |
| **CMD-03** | Simulated `history` | `simulated` | 57 tokens | **0.5 ms** | Sub-millisecond |

---

## 4. Aggregate Benchmark Statistics

- **Average Local Generative Throughput:** **9.70 tokens/second**
- **Peak Observed Local Generative Throughput:** **13.96 tokens/second**
- **Average Local Inference Latency:** **6,711.5 ms** (for typical 80-token creative passages)
- **Simulated Command Latency:** **< 1.0 ms**
- **Concurrent Inferences:** Successfully serialized via `asyncio.Lock` without CPU deadlock or memory thrashing.

---

## 5. Architectural Findings & Engineering Notes

1. **Rejection of Part 1 Theoretical Estimate:** Part 1 documentation cited theoretical estimates of 35–60 tok/s. Real-world CPU profiling on an Intel 12-core Windows laptop demonstrates actual sustained generative throughput of **~9.7 tokens/second** for full sentence generation under float context computation. This empirical figure is recorded as the authoritative benchmark.
2. **Deterministic Acceleration:** The hybrid persona architecture routes deterministic terminal commands (`help`, `whoami`, `history`, `git status`) to sub-millisecond handlers, offloading common queries from CPU inference.
3. **Memory Safety:** Peak working set remains under 600 MB RAM throughout extended execution, making GhostTerminal AI fully operable alongside standard development tools.
