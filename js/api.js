(() => {
	const apiBase = document.querySelector('meta[name="api-base"]')?.content || '/api';

	const getJson = async (url) => {
		const response = await fetch(url, { headers: { Accept: 'application/json' } });
		if (!response.ok) throw new Error(`API indisponível (${response.status}).`);
		return response.json();
	};

	const fetchDashboard = (stationId, period) => {
		const query = new URLSearchParams({ periodo: period });
		return getJson(`${apiBase}/estacoes/${encodeURIComponent(stationId)}/dashboard?${query}`);
	};

	window.WeatherAPI = { fetchDashboard };
})();
