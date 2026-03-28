// FastAPI server must have CORSMiddleware configured for localhost:3000
// Add to main.py:
// from fastapi.middleware.cors import CORSMiddleware
// app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
//   allow_methods=["*"], allow_headers=["*"])

export const fetchAllChartData = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  const fetchEndpoint = async (url: string) => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed fetching ${url}:`, error);
      return null;
    }
  };

  try {
    const [chart1, chart2, chart3, chart4, chart5] = await Promise.all([
      fetchEndpoint('http://localhost:8000/chart1'),
      fetchEndpoint('http://localhost:8000/chart2'),
      fetchEndpoint('http://localhost:8000/chart3'),
      fetchEndpoint('http://localhost:8000/chart4'),
      fetchEndpoint('http://localhost:8000/chart5'),
    ]);

    return { chart1, chart2, chart3, chart4, chart5 };
  } finally {
    clearTimeout(timeoutId);
  }
};
