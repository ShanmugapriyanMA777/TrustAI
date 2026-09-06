# TrustScore AI

TrustScore AI is an intelligent evaluation and adversarial governance platform for frontier and custom AI models. It turns opaque model behavior into an actionable evidence trail across Safety, Hallucination resistance, Fairness, Robustness, and Accuracy.

## Quick Start

- `cmd /c pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `cmd /c pnpm --filter @workspace/trustscore-ai run dev` — run the web interface (port 5173)
- `cmd /c pnpm run dev` — run both frontend and API server concurrently
- `cmd /c pnpm run typecheck` — full typecheck across all packages
- `cmd /c pnpm run build` — build all packages for production

## AI Evaluation Engine (OpenRouter)

TrustScore AI integrates directly with OpenRouter to evaluate live frontier models:
- **Models**: OpenAI (GPT-4o Mini), Anthropic (Claude 3.5 Sonnet), Meta (Llama 3.3 70B), Google (Gemini 2.0 Flash), DeepSeek (V3), and any custom model identifier.
- **Capabilities**:
  - Live multi-dimension prompt benchmarking (Accuracy, Safety, Fairness, Hallucination resistance, Robustness)
  - LLM-as-a-judge evaluation with deterministic scoring, confidence intervals, and evidence trails
  - Live adversarial Red-Team sweeps (Prompt injection, Jailbreak probes, System prompt extraction, Exfiltration)
  - Dynamic AI test-suite generator

Configure your OpenRouter API key in your environment or directly in the workspace settings.
