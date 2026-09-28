"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getRun, patchRun, runStage } from "../lib/client/api";
import { STAGES, type BrandSpec, type Selection, type Stage } from "../lib/client/types";

export function useBrandRun(id: string, replayGolden = false) {
  const [spec, setSpec] = useState<BrandSpec | null>(null);
  const [activeStage, setActiveStage] = useState<Stage>("intake");
  const [busyStage, setBusyStage] = useState<Stage | null>(null);
  const [stageStartedAt, setStageStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectingDirectionId, setSelectingDirectionId] = useState<Selection["directionId"] | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const next = await getRun(replayGolden ? "golden" : id);
      setSpec(next);
      const current = STAGES.find((stage) => next.stageStatus[stage] !== "done") ?? "launch";
      setActiveStage(current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this run.");
    }
  }, [id, replayGolden]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!replayGolden || !spec) return;
    let index = 0;
    const fullSpec = spec;
    setSpec({ ...fullSpec, stageStatus: Object.fromEntries(STAGES.map((stage) => [stage, "pending"])) as BrandSpec["stageStatus"] });
    const timer = window.setInterval(() => {
      const revealed = index;
      setSpec({
        ...fullSpec,
        stageStatus: Object.fromEntries(STAGES.map((stage, stageIndex) => [stage, stageIndex <= revealed ? "done" : "pending"])) as BrandSpec["stageStatus"],
      });
      setActiveStage(STAGES[Math.min(revealed, STAGES.length - 1)] ?? "launch");
      index += 1;
      if (index >= STAGES.length) window.clearInterval(timer);
    }, 650);
    return () => window.clearInterval(timer);
  }, [replayGolden, spec?.id]);

  const execute = useCallback(async (stage: Stage) => {
    setBusyStage(stage);
    setStageStartedAt(Date.now());
    setError(null);
    try {
      const result = await runStage(id, stage);
      setSpec(result.spec);
      const nextIndex = Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1);
      setActiveStage(STAGES[nextIndex] ?? "launch");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Unable to run ${stage}.`);
    } finally {
      setBusyStage(null);
      setStageStartedAt(null);
    }
  }, [id]);

  const answerInterview = useCallback(async (answers: Record<string, string>) => {
    setSpec(await patchRun(id, { interviewAnswers: answers }));
    setActiveStage("diverge");
  }, [id]);

  const selectDirection = useCallback(async (selection: Selection) => {
    setSelectionError(null);
    setSelectingDirectionId(selection.directionId);
    try {
      if (id === "golden" || replayGolden) {
        // The backend intentionally keeps the golden fixture read-only. Let the
        // fallback demo exercise the founder choice without trying to persist it.
        setSpec((current) => current ? {
          ...current,
          selection,
          trail: [
            ...current.trail.filter((entry) => entry.field !== "selection"),
            { field: "selection", stage: "battle", basedOn: ["directions", "critiques"], reason: `Founder chose direction ${selection.directionId}${selection.edits ? " with edits" : ""}.` },
          ],
        } : current);
      } else {
        setSpec(await patchRun(id, { selection }));
      }
      setActiveStage("shape");
    } catch (cause) {
      setSelectionError(cause instanceof Error ? cause.message : "Unable to choose this direction.");
    } finally {
      setSelectingDirectionId(null);
    }
  }, [id, replayGolden]);

  const completed = useMemo(() => spec ? STAGES.filter((stage) => spec.stageStatus[stage] === "done").length : 0, [spec]);
  return { spec, activeStage, setActiveStage, busyStage, stageStartedAt, error, selectionError, selectingDirectionId, refresh, execute, answerInterview, selectDirection, completed };
}
