import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";

// Function to start Python microservice
function startPythonService() {
  const pythonScript = path.join(process.cwd(), "python", "nlp_service.py");
  console.log("Starting Python NLP Service...", pythonScript);

  const pythonProcess = spawn("python3", [pythonScript]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[Python]: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python Error]: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
  });
  
  return pythonProcess;
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
        const response = await fetch("http://127.0.0.1:5001/similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Python service error: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
      } catch (err) {
        console.error("Failed to call Python service:", err);
        res.status(500).json({ message: "NLP Service unavailable. Model may be loading." });
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
