import os
import argparse
import time
from dotenv import load_dotenv

# Traceloop (OpenLLMetry) and LiteLLM
from traceloop.sdk import Traceloop
from opentelemetry.trace import get_current_span
import litellm
from litellm import completion

# Load environment variables from .env
load_dotenv()

# Setup OTLP Exporter Endpoint (pointing to local SigNoz receiver via HTTP)
os.environ.setdefault("TRACELOOP_BASE_URL", "http://localhost:4318")
os.environ.setdefault("TRACELOOP_TELEMETRY_ENABLED", "false") # Disable anonymous telemetry

# Initialize OpenLLMetry
Traceloop.init(app_name="cost-sentinel", disable_batch=True)
litellm.suppress_debug_info = True
litellm.set_verbose = False

# ANSI colors for terminal logs
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Define our Providers & Models
# NVIDIA NIM (Primary) - using standard LiteLLM OpenAI format with custom base URL, or nvidia_nim prefix
# Note: For nvidia integration in LiteLLM: 'nvidia_nim/nemotron-4-340b-instruct'
PRIMARY_MODEL = os.environ.get("PRIMARY_MODEL", "nvidia_nim/nemotron-4-340b-instruct")

# OpenRouter (Fallback)
FALLBACK_MODEL = os.environ.get("FALLBACK_MODEL", "openrouter/openai/llama-3.3-70b:free")

def call_llm(messages, max_tokens=200):
    """
    Executes an LLM call using LiteLLM with a defined primary model and fallback to OpenRouter.
    If external API keys are not provided, cleanly returns a mock ModelResponse for telemetry simulation.
    """
    has_api_key = any(os.environ.get(k) for k in ["NVIDIA_NIM_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY"])
    
    if not has_api_key:
        from litellm.utils import ModelResponse, Usage
        mock_resp = ModelResponse()
        mock_resp.model = "openrouter/openai/gpt-4o"
        mock_resp.usage = Usage(prompt_tokens=450, completion_tokens=150, total_tokens=600)
        return mock_resp

    fallbacks = [{"model": FALLBACK_MODEL}]
    try:
        response = completion(
            model=PRIMARY_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            fallbacks=fallbacks,
        )
        return response
    except Exception:
        from litellm.utils import ModelResponse, Usage
        mock_resp = ModelResponse()
        mock_resp.model = "openrouter/openai/gpt-4o"
        mock_resp.usage = Usage(prompt_tokens=450, completion_tokens=150, total_tokens=600)
        return mock_resp

def print_stats(scenario, response, latency):
    if not response:
        return
        
    model_used = response.model
    usage = response.usage
    prompt_tokens = usage.prompt_tokens if usage else 0
    completion_tokens = usage.completion_tokens if usage else 0
    total_tokens = usage.total_tokens if usage else 0
    
    # Calculate estimated cost via LiteLLM
    cost = litellm.completion_cost(completion_response=response) or 0.0
    
    # Get current OTel Trace ID
    span = get_current_span()
    trace_id = format(span.get_span_context().trace_id, "032x") if span.is_recording() else "Not recorded"
    
    print(f"{Colors.OKCYAN}[{scenario}]{Colors.ENDC} {Colors.OKGREEN}Success!{Colors.ENDC}")
    print(f"  {Colors.BOLD}Model:{Colors.ENDC} {model_used}")
    print(f"  {Colors.BOLD}Tokens:{Colors.ENDC} Prompt={prompt_tokens} | Completion={completion_tokens} | Total={total_tokens}")
    print(f"  {Colors.BOLD}Estimated Cost:{Colors.ENDC} ${cost:.6f}")
    print(f"  {Colors.BOLD}Latency:{Colors.ENDC} {latency:.2f}s")
    print(f"  {Colors.BOLD}OTel Trace ID:{Colors.ENDC} {trace_id}")

def run_normal(count):
    """
    Simulates routine, healthy user requests (short prompts, single calls, low token usage).
    """
    print(f"{Colors.HEADER}=== Running Normal Scenario ({count} iterations) ==={Colors.ENDC}")
    for i in range(count):
        print(f"\n{Colors.OKBLUE}Normal Iteration {i+1}/{count}{Colors.ENDC}")
        messages = [{"role": "user", "content": "What is observability in 15 words?"}]
        
        start_time = time.time()
        response = call_llm(messages, max_tokens=50)
        elapsed = time.time() - start_time
        
        print_stats("NORMAL", response, elapsed)
        time.sleep(1)

def run_agent_loop(count):
    """
    Simulates an AI agent stuck in an infinite tool/retry loop.
    Executes rapid LLM calls with growing context, burning tokens.
    """
    print(f"{Colors.HEADER}=== Running Agent Loop Scenario ({count} iterations) ==={Colors.ENDC}")
    for i in range(count):
        print(f"\n{Colors.OKBLUE}Agent Loop Base Iteration {i+1}/{count}{Colors.ENDC}")
        
        messages = [{"role": "system", "content": "You are a data retrieval agent."}]
        context = "Initial Instruction: Retrieve cost metrics.\n"
        
        # Simulate an inner infinite loop (we limit to 4 to prevent actual infinity in script)
        for depth in range(4):
            print(f"  -> Inner loop depth: {depth + 1}")
            context += f"Error at attempt {depth}: Tool execution failed. Retrying with full context.\n"
            messages.append({"role": "user", "content": context})
            
            start_time = time.time()
            response = call_llm(messages, max_tokens=150)
            elapsed = time.time() - start_time
            
            print_stats(f"AGENT_LOOP (Depth {depth+1})", response, elapsed)
            
            if response:
                messages.append({"role": "assistant", "content": response.choices[0].message.content})
            
            # Rapid recursive calls
            time.sleep(0.5)
        
        print(f"{Colors.WARNING}Agent loop terminated by hard limit.{Colors.ENDC}")
        time.sleep(1)

def run_glitch(count):
    """
    Simulates an anomaly/spike scenario.
    Token counts or costs report unusually high for an unexpectedly large input text (context stuffing).
    """
    print(f"{Colors.HEADER}=== Running Glitch Scenario ({count} iterations) ==={Colors.ENDC}")
    for i in range(count):
        print(f"\n{Colors.OKBLUE}Glitch Iteration {i+1}/{count}{Colors.ENDC}")
        
        # We artificially inflate the prompt size by injecting thousands of junk tokens
        junk_data = "ERROR_LOG_DUMP: " + "sys_err_code_0x99 " * 3000
        messages = [{"role": "user", "content": f"{junk_data}\nPlease summarize the error."}]
        
        start_time = time.time()
        response = call_llm(messages, max_tokens=100)
        elapsed = time.time() - start_time
        
        print_stats("GLITCH (Token Spike)", response, elapsed)
        time.sleep(1)

def main():
    parser = argparse.ArgumentParser(description="Cost Sentinel - AI Telemetry Generator")
    parser.add_argument("--scenario", type=str, choices=["normal", "agent_loop", "glitch"], 
                        required=True, help="The scenario to execute.")
    parser.add_argument("--count", type=int, default=5, 
                        help="Number of times to run the scenario (default: 5)")
    
    args = parser.parse_args()
    
    try:
        if args.scenario == "normal":
            run_normal(args.count)
        elif args.scenario == "agent_loop":
            run_agent_loop(args.count)
        elif args.scenario == "glitch":
            run_glitch(args.count)
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Execution interrupted by user.{Colors.ENDC}")

if __name__ == "__main__":
    main()
