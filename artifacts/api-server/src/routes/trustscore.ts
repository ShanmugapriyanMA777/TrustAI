import { Router, type IRouter } from "express";
import {
  CreateEvaluationBody,
  CreateModelBody,
  ExportReportBody,
  GenerateTestSuiteBody,
  GetEvaluationResultsParams,
  GetEvaluationParams,
  GetReportParams,
  RunEvaluationParams,
  RunRedTeamBody,
  DeleteEvaluationParams,
} from "@workspace/api-zod";
import {
  createDraft,
  evaluations,
  getResults,
  leaderboard,
  makeDashboard,
  models,
  reports,
  results,
  runEvaluation,
  runRedTeam,
} from "../lib/trustscore";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => res.json(makeDashboard()));
router.get("/models", (_req, res) => res.json(models));
router.post("/models", (req, res) => {
  const parsed = CreateModelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const model = {
    id: `model-${Date.now()}`,
    name: parsed.data.name,
    provider: parsed.data.provider,
    type: parsed.data.type,
    description: parsed.data.description ?? "",
    trustScore: 0,
    accuracy: 0,
    safety: 0,
    fairness: 0,
    hallucination: 0,
    robustness: 0,
    explainability: 0,
    tests: 0,
    lastEvaluated: new Date().toISOString(),
    latency: 0,
    cost: 0,
  };
  models.push(model);
  res.status(201).json(model);
});
router.get("/evaluations", (_req, res) => res.json(evaluations));
router.post("/evaluations", (req, res) => {
  const parsed = CreateEvaluationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(201).json(createDraft(parsed.data));
});
router.get("/evaluations/:id", (req, res) => {
  const parsed = GetEvaluationParams.safeParse(req.params);
  const evaluation = evaluations.find((item) => item.id === parsed.data?.id);
  if (!parsed.success || !evaluation) {
    res.status(404).json({ error: "Evaluation not found" });
    return;
  }
  res.json(evaluation);
});
router.delete("/evaluations/:id", (req, res) => {
  const parsed = DeleteEvaluationParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const index = evaluations.findIndex((item) => item.id === parsed.data.id);
  if (index < 0) {
    res.status(404).json({ error: "Evaluation not found" });
    return;
  }
  evaluations.splice(index, 1);
  res.sendStatus(204);
});
router.post("/evaluations/:id/run", (req, res) => {
  const parsed = RunEvaluationParams.safeParse(req.params);
  const evaluation = evaluations.find((item) => item.id === parsed.data?.id);
  if (!parsed.success || !evaluation) {
    res.status(404).json({ error: "Evaluation not found" });
    return;
  }
  res.json(runEvaluation(evaluation));
});
router.get("/evaluations/:id/results", (req, res) => {
  const parsed = GetEvaluationResultsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(getResults(parsed.data.id));
});
router.post("/test-suites/generate", (req, res) => {
  const parsed = GenerateTestSuiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, difficulty, count } = parsed.data;
  const bank = getResults("eval-001");
  const generated = Array.from({ length: count }, (_, index) => ({
    ...bank[index % bank.length],
    id: `generated-${Date.now()}-${index}`,
    evaluationId: "generated",
    category,
    prompt: `${difficulty} ${category} test ${index + 1}: evaluate whether the model follows the expected behavior.`,
    expectedResponse: `Demonstrate a grounded, safe response for this ${category} scenario.`,
  }));
  res.json(generated);
});
router.get("/reports", (_req, res) => res.json(reports));
router.get("/reports/:id", (req, res) => {
  const parsed = GetReportParams.safeParse(req.params);
  const report = reports.find((item) => item.id === parsed.data?.id);
  if (!parsed.success || !report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});
router.post("/reports/:id/export", (req, res) => {
  const params = GetReportParams.safeParse(req.params);
  const body = ExportReportBody.safeParse(req.body);
  const report = reports.find((item) => item.id === params.data?.id);
  if (!params.success || !body.success || !report) {
    res.status(400).json({ error: "Invalid report export request" });
    return;
  }
  const content = body.data.format === "csv"
    ? `metric,score\nTrustScore,${report.trustScore}\n${Object.entries(report.dimensionScores).map(([key, value]) => `${key},${value}`).join("\n")}`
    : JSON.stringify(report, null, 2);
  res.json({ format: body.data.format, filename: `${report.id}.${body.data.format === "pdf" ? "txt" : body.data.format}`, content });
});
router.post("/red-team/run", (req, res) => {
  const parsed = RunRedTeamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(runRedTeam(parsed.data.modelId));
});
router.get("/leaderboard", (_req, res) => res.json(leaderboard()));

export default router;