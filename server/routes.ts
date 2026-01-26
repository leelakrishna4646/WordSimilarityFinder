import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";

let pythonProcessInstance: any = null;

function startPythonService() {
  if (pythonProcessInstance) return pythonProcessInstance;

  const pythonScript = path.join(process.cwd(), "python", "nlp_service.py");
  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  
  pythonProcessInstance = spawn(pythonCmd, [pythonScript], {
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    stdio: 'inherit' // Inherit stdio to see logs directly in Replit workflow output
  });

  pythonProcessInstance.on("close", (code: number) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcessInstance = null;
    if (code !== 0) {
      setTimeout(startPythonService, 5000);
    }
  });
  
  return pythonProcessInstance;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  startPythonService();

  app.post(api.similarity.find.path, async (req, res) => {
    try {
      const input = api.similarity.find.input.parse(req.body);
      
      const response = await fetch("http://127.0.0.1:5001/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Service error" }));
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("NLP Service Error:", err);
      res.status(503).json({ 
        message: "NLP Engine is starting up. This takes about 60 seconds on first run. Please wait and try again." 
      });
    }
  });

  return httpServer;
}
