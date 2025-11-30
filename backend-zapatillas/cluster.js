
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master corriendo en PID: ${process.pid}`);
  console.log(`Creando ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} murió. Creando uno nuevo...`);
    cluster.fork();
  });

} else {
  console.log(`Worker ${process.pid} iniciando servidor...`);
  await import("./src/server.js");
}
