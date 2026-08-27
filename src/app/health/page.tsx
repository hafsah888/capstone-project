async function getHealthData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch health data");
  }
  return res.json();
}

export default async function HealthPage() {
  const data = await getHealthData();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Health Check</h1>
      <p className="text-green-600 font-medium mt-2">Status: OK</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">Sample fetched data:</p>
        <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
