// Funciones de utilidad para métricas
let requestCount = 0;
let errorCount = 0;
let activeUsers = 0;

export function incrementRequestCount() {
  requestCount++;
}

export function incrementErrorCount() {
  errorCount++;
}

export function setActiveUsers(count: number) {
  activeUsers = count;
}

export function getMetrics() {
  return {
    requestCount,
    errorCount,
    activeUsers
  };
}
