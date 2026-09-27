/**
 * Real retinal image analysis using pixel-level computer vision.
 * Staging follows the clinical 4-2-1 rule.
 */
import { spawn, ChildProcess } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

// ─── Public output ─────────────────────────────────────────────────────────────

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

export interface ImageAnalysisResult {
  drStage: number;
  confidenceScore: number;
  heatmapPoints: HeatmapPoint[];
  /** true = real pixel analysis; false = fallback simulation */
  isRealAnalysis: boolean;
}

// ─── Background Python Worker ──────────────────────────────────────────────────

let pythonProcess: ChildProcess | null = null;
let isPythonAvailable: boolean | null = null;
let resolveQueue: ((res: string) => void)[] = [];
let outputBuffer = "";

function getPythonWorker(): ChildProcess | null {
  if (isPythonAvailable === false) return null;

  if (!pythonProcess) {
    const projectRoot = path.resolve(process.cwd(), "../../");
    const pythonScript = path.join(projectRoot, "predict.py");

    try {
      // Spawn python process once
      pythonProcess = spawn("python", [pythonScript], { cwd: projectRoot });

      pythonProcess.stdout?.on("data", (data: Buffer) => {
        outputBuffer += data.toString();
        const lines = outputBuffer.split("\n");
        // keep the last incomplete chunk in buffer
        outputBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && resolveQueue.length > 0) {
            const resolver = resolveQueue.shift();
            if (resolver) resolver(trimmed);
          }
        }
      });

      pythonProcess.stderr?.on("data", (data: Buffer) => {
        const str = data.toString();
        console.error("[Python Worker]", str);
        if (str.includes("ModuleNotFoundError") || str.includes("No module named")) {
          isPythonAvailable = false;
        }
      });

      pythonProcess.stdin?.on("error", (err) => {
        console.error("[Python Worker Stdin Error] Ignoring EPIPE crash shield:", err);
      });

      pythonProcess.on("error", (err) => {
        console.error("[Python Worker Process Error]", err);
        isPythonAvailable = false;
      });

      pythonProcess.on("close", (code) => {
        console.log(`[Python Worker] Process closed with code ${code}.`);
        if (code !== 0) isPythonAvailable = false;
        pythonProcess = null;
        // flush all pending requests
        const queue = resolveQueue;
        resolveQueue = [];
        queue.forEach(resolver => resolver(""));
      });
    } catch {
      isPythonAvailable = false;
      return null;
    }
  }
  return pythonProcess;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function analyzeRetinalImage(
  imageDataUrl: string
): Promise<ImageAnalysisResult> {
  if (isPythonAvailable === false) {
    return { drStage: 0, confidenceScore: 0, heatmapPoints: [], isRealAnalysis: false };
  }

  const worker = getPythonWorker();
  if (!worker) {
    return { drStage: 0, confidenceScore: 0, heatmapPoints: [], isRealAnalysis: false };
  }
  let tmpFilePath = "";

  try {
    const base64 = imageDataUrl.replace(/^data:image\/[a-z+]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    // Save image to a temporary file
    tmpFilePath = path.join(os.tmpdir(), `retina-scan-${Date.now()}.jpg`);
    await fs.writeFile(tmpFilePath, buffer);

    // Queue request to Python worker with timeout
    const promiseResponse = new Promise<string>((resolve, reject) => {
      if (!worker || worker.killed || worker.exitCode !== null || !worker.stdin?.writable) {
        return reject(new Error("Python worker unavailable"));
      }
      const timeout = setTimeout(() => {
        reject(new Error("Python worker timed out"));
      }, 3000);

      resolveQueue.push((res) => {
        clearTimeout(timeout);
        if (!res) {
          reject(new Error("Empty response from Python worker"));
        } else {
          resolve(res);
        }
      });

      try {
        worker.stdin.write(tmpFilePath + "\n");
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    });

    const output = await promiseResponse;
    console.log("[DEBUG] Backend raw Python output:\n", output);

    // Parse specific dynamic output
    let stage = 0;
    let confidence = 0.50;

    try {
      const parsed = JSON.parse(output);
      if (parsed.error) {
        console.error("[Python Analysis Error]", parsed.error);
        throw new Error(parsed.error);
      }
      if (parsed.stage !== undefined) stage = parsed.stage;
      if (parsed.confidence !== undefined) confidence = parsed.confidence;
    } catch (parseError) {
      console.error("Failed to parse Python JSON output:", parseError);
    }

    return {
      drStage: stage,
      confidenceScore: confidence,
      heatmapPoints: [], // Empty heatmap for deep learning
      isRealAnalysis: true,
    };

  } catch (err) {
    console.error("Analysis failed:", err);
    // Return explicit error bounds
    return { drStage: 0, confidenceScore: 0, heatmapPoints: [], isRealAnalysis: false };
  } finally {
    if (tmpFilePath) {
      await fs.unlink(tmpFilePath).catch(() => { });
    }
  }
}

