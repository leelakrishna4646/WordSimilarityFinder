import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";

// Keep track of the Python process globally to prevent multiple instances
let pythonProcessInstance: any = null;

// Function to start Python microservice
function startPythonService() {
  if (pythonProcessInstance) {
    console.log("Python NLP Service is already running.");
    return pythonProcessInstance;
  }

  const pythonScript = path.join(process.cwd(), "python", "nlp_service.py");
  console.log("Starting Python NLP Service...", pythonScript);

  // In production/published environments, python3 is standard
  const pythonCmd = "python3";
  
  pythonProcessInstance = spawn(pythonCmd, [pythonScript], {
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    stdio: 'pipe'
  });

  pythonProcessInstance.stdout.on("data", (data: Buffer) => {
    console.log(`[Python]: ${data.toString()}`);
  });

  pythonProcessInstance.stderr.on("data", (data: Buffer) => {
    console.error(`[Python Error]: ${data.toString()}`);
  });

  pythonProcessInstance.on("close", (code: number) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcessInstance = null;
    // Auto-restart if it crashes
    if (code !== 0) {
      console.log("Restarting Python service in 5 seconds...");
      setTimeout(startPythonService, 5000);
    }
  });
  
  pythonProcessInstance.on("error", (err: Error) => {
    console.error("Failed to start Python process:", err);
    pythonProcessInstance = null;
  });

  return pythonProcessInstance;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start the Python service sidecar
  startPythonService();

  // Proxy route for similarity
  app.post(api.similarity.find.path, async (req, res) => {
    try {
      const input = api.similarity.find.input.parse(req.body);
      
      // Forward to Python service
      try {
        // Use 127.0.0.1 and port 5001 - matching Python service bind
        const response = await fetch("http://127.0.0.1:5001/similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Model is busy or word not found" }));
          return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        res.json(data);
      } catch (err) {
        console.error("Failed to call Python service:", err);
        res.status(503).json({ 
          message: "NLP Service is initializing. This usually takes 30-60 seconds on the first run after publishing. Please try again in a moment." 
        });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
