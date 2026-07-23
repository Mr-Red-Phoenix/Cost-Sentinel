# 🛡️ Cost Sentinel - Real-Time AI & Cloud Infrastructure Cost Leak Classifier

> **An autonomous, OpenTelemetry-native observability engine powered by SigNoz, ClickHouse, and the Model Context Protocol (MCP) to detect, classify, and remediate AI agent loops and cloud infrastructure cost leaks in real-time.**

---

## 📌 Table of Contents
1. [Overview & Problem Statement](#-overview--problem-statement)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Directory Structure & Code Layout](#-directory-structure--code-layout)
6. [Classification Rules Engine](#-classification-rules-engine)
7. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
8. [Testing & Verification Guide](#-testing--verification-guide)
9. [MCP Integration (Claude Desktop, Cursor, CLI)](#-mcp-integration)
10. [License](#-license)

---

## 🎯 Overview & Problem Statement

Modern cloud architectures and GenAI applications suffer from **silent cost leaks**:
- **AI Agent Infinite Loops**: ReAct agents entering unconstrained retry storms, consuming tens of thousands of tokens without user progress.
- **Un-routed Infrastructure Egress**: Cloud services routing traffic through costly AWS NAT Gateways instead of direct VPC Endpoints.
- **Underutilized Idle Resources**: Compute instances running at <5% CPU utilization while incurring hourly billing charges.

**Cost Sentinel** solves this by ingesting pure OpenTelemetry (OTel) traces and metrics into SigNoz, evaluating cross-signal correlations deterministically, emitting structured classification logs, and surfacing natural-language root-cause analysis through the Model Context Protocol (MCP).

---

## ⭐ Key Features

1. **Multi-Category Cost Leak Classification**:
   - 🔴 **Real AI Leak**: Detects token consumption surges outpacing request volume (`gen_ai.usage.total_tokens` vs request count).
   - 🔴 **Real Infra Leak**: Identifies un-routed traffic passing through NAT Gateways (high bytes processed with zero VPC endpoint hits) and idle compute (<5% CPU load).
   - 🟢 **Legitimate Growth**: Validates genuine cost increases correlated with higher user throughput.
   - 🟡 **Measurement Glitch**: Identifies phantom cost spikes without underlying network, compute, or API signals.

2. **Standardized OpenTelemetry Telemetry**:
   - GenAI Instrumentation via Traceloop SDK emitting `gen_ai.*` semantic conventions.
   - Synthetic Cloud Infrastructure signals (`aws_nat_bytes_processed`, `aws_vpc_endpoint_hits`, `aws_ec2_cpu_utilization`).

3. **Deterministic Classification Engine (`sentinel.py`)**:
   - Queries SigNoz PromQL / Query Builder API.
   - Evaluates multi-signal rules without black-box ML models.
   - Emits OTLP warning logs containing structured tags (`sentinel.severity`, `sentinel.recommendation`).

4. **SigNoz MCP Server Layer**:
   - Exposes 41 SigNoz tools for natural-language querying (`"Why did our costs spike in the last 10 minutes?"`).

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Orchestration** | `foundryctl` + `casting.yaml` | Deploys SigNoz, ClickHouse, OTel Collector, & MCP server via Docker Compose. |
| **AI Telemetry Generator** | Python 3.13, LiteLLM, Traceloop SDK | Emits `gen_ai.*` OpenTelemetry spans to `localhost:4318`. |
| **Infra Emulator** | Python 3.13, `opentelemetry-sdk` | Emits synthetic OTLP infrastructure metrics for NAT, VPC, & CPU. |
| **Classification Engine** | Python 3.13, `requests`, `schedule` | Evaluates PromQL metrics & writes OTLP warning logs back to SigNoz. |
| **Observability Backend** | SigNoz, ClickHouse, OTel Collector | Ports `:3301` (UI), `:4318` (OTLP HTTP), `:8000` (MCP Server). |
| **MCP Bridge / Proxy** | `supergateway` | Stdio-to-SSE bridge for AI clients (Claude Desktop, Cursor, `agy`). |

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 COST SENTINEL STACK                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ AI Telemetry Generator ]      [ Infra Metrics Emulator ]                       |
|   (app.py / Traceloop SDK)        (infra_emulator.py)                             |
|          |                                 |                                      |
|          | gen_ai.* spans                  | aws.* OTLP metrics                   |
|          +-----------------+---------------+                                      |
|                            |                                                      |
|                            v                                                      |
|                  +--------------------+                                           |
|                  | SigNoz OTLP        |                                           |
|                  | Receiver (:4318)   |                                           |
|                  +---------+----------+                                           |
|                            |                                                      |
|                            v                                                      |
|                  +--------------------+                                           |
|                  | ClickHouse Storage |                                           |
|                  +---------+----------+                                           |
|                            |                                                      |
|                            | PromQL / Metric Query                                |
|                            v                                                      |
|       +------------------------------------------+                                |
|       | Classification Engine (sentinel.py)      |                                |
|       | Evaluates: AI Loops, Infra Egress, Idles |                                |
|       +--------------------+---------------------+                                |
|                            |                                                      |
|                            | Emits Warning Logs (OTLP)                            |
|                            v                                                      |
|       +------------------------------------------+                                |
|       | SigNoz UI Dashboard (:3301) & Alert Rules|                                |
|       +--------------------+---------------------+                                |
|                            |                                                      |
|                            | MCP Protocol (:8000)                                 |
|                            v                                                      |
|       +------------------------------------------+                                |
|       | SigNoz MCP Server + Claude / Cursor / AGY|                                |
|       +------------------------------------------+                                |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Directory Structure & Code Layout

```text
SigNoz/
├── app.py                  # AI Agent & Token Leak Telemetry Generator (Traceloop + LiteLLM)
├── infra_emulator.py       # Infrastructure Metrics Emulator (NAT Bytes, VPC Hits, CPU Utilization)
├── sentinel.py             # Classification Engine & OTLP Alert Writer
├── fetcher.py              # Data Fetcher querying SigNoz PromQL metrics API
├── evaluator.py            # Rule Evaluator logic for multi-category cost leaks
├── writer.py               # OTLP Log Exporter emitting alerts back into SigNoz ClickHouse
├── dry_run.py              # Unified dry-run orchestrator running full scenario suite
├── query_sentinel.py        # Terminal query utility for instant anomaly summary reports
├── test_sentinel.py        # Unit test suite verifying classification logic
├── config.py               # Central configuration constants (Endpoints, API Keys, Thresholds)
├── mock_data.py            # Standalone mock metrics pusher for testing
├── casting.yaml            # Foundry deployment specification for SigNoz & MCP
├── casting.yaml.lock       # Locked deployment environment state
├── requirements.txt        # Python package dependencies
├── .env.example            # Environment variable template
├── LICENSE                 # MIT License
└── README.md               # Project documentation & guide
```

---

## 🔍 Classification Rules Engine

The evaluator in `sentinel.py` / `evaluator.py` applies the following threshold rules across telemetry signals:

| Category | Rule Condition | Severity | Recommendation |
| :--- | :--- | :---: | :--- |
| **Real Infra Leak (VPC)** | `nat_bytes > 1,000` AND `vpc_hits == 0` | **CRITICAL** | Provision AWS VPC Endpoint to bypass NAT Gateway data egress billing. |
| **Real Infra Leak (Idle)** | `cpu_util < 5.0%` (for active instances) | **MEDIUM** | Terminate or downsize underutilized EC2 compute instance. |
| **Real AI Leak (Loop)** | `ai_tokens > 1,000` without request growth | **HIGH** | Enforce `max_iterations` guardrail limit on ReAct agent loop context. |
| **Measurement Glitch** | Cost spike detected with `nat_bytes == 0` & `ai_tokens == 0` | **INFO** | No action required (phantom metric spike). |

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
- Python 3.10+
- Docker Desktop (Running)
- Node.js & `npm`

### 1. Clone Repository & Install Python Dependencies
```bash
git clone https://github.com/Mr-Red-Phoenix/Cost-Sentinel.git
cd SigNoz
python -m pip install -r requirements.txt
```

### 2. Deploy SigNoz & MCP Server Stack
Run `foundryctl` to spin up ClickHouse, SigNoz UI, OTel Collector, and SigNoz MCP Server:
```bash
./foundryctl cast -f casting.yaml
```

- **SigNoz Web UI**: [http://localhost:3301](http://localhost:3301)
- **SigNoz MCP Endpoint**: `http://localhost:8000/mcp`
- **OTLP Receiver**: `http://localhost:4318`

---

## 🧪 Testing & Verification Guide

### Option A: Run Unit Tests
To verify the classification logic without running SigNoz:
```bash
python test_sentinel.py
```

### Option B: Run the Full Unified Dry-Run Test Suite
To execute all live scenarios (Normal traffic, AI Token Leak, Infra Leak, and Sentinel Classification):
```bash
python dry_run.py
```

### Option C: Query Active Cost Anomalies in Terminal
To inspect detected cost leaks in your terminal:
```bash
python query_sentinel.py
```

---

## 🤖 MCP Integration (Claude Desktop, Cursor, CLI)

The SigNoz MCP Server exposes **41 tools** for natural-language querying.

### 1. Claude Desktop Setup
In `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cost-sentinel": {
      "command": "C:\\Users\\parth sharma\\AppData\\Roaming\\npm\\supergateway.cmd",
      "args": [
        "--sse",
        "http://localhost:8000/mcp",
        "--header",
        "SIGNOZ-API-KEY: dummy",
        "--logLevel",
        "none"
      ]
    }
  }
}
```

### 2. Cursor IDE Setup
In `.cursor/mcp.json` or `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "cost-sentinel": {
      "command": "C:\\Users\\parth sharma\\AppData\\Roaming\\npm\\supergateway.cmd",
      "args": [
        "--sse",
        "http://localhost:8000/mcp",
        "--header",
        "SIGNOZ-API-KEY: dummy",
        "--logLevel",
        "none"
      ]
    }
  }
}
```

### 3. Antigravity CLI (`agy`)
Run non-interactively:
```powershell
agy --dangerously-skip-permissions -p "Run python query_sentinel.py and summarize the detected cost anomalies."
```

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
