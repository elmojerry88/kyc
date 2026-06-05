import * as fs from "fs";
import * as path from "path";
import { runOcrBi } from "../tools/ocr.tool";
import { validateBiAuthenticity } from "../tools/bi-authenticity.tool";
import { compareFaces } from "../tools/face-compare.tool";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../../apps/api/.env") });

async function main() {
  console.log("Starting test-tools script...");
  
  // Create mock base64 images just for compilation and basic testing
  // In a real scenario, you'd load actual images:
  // const biFrente = fs.readFileSync(path.join(__dirname, "mock/bi-frente.jpg")).toString("base64");
  const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  
  try {
    console.log("Testing OCR Tool...");
    const ocrResult = await runOcrBi(mockBase64, mockBase64);
    console.log("OCR Result:", ocrResult);

    console.log("Testing Authenticity Tool...");
    const authResult = await validateBiAuthenticity(mockBase64, mockBase64, ocrResult);
    console.log("Authenticity Result:", authResult);

    console.log("Testing Face Compare Tool...");
    const faceResult = await compareFaces(mockBase64, mockBase64);
    console.log("Face Compare Result:", faceResult);
    
    console.log("All tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}
