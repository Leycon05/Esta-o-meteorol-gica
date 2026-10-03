(() => {
	const stationId = document.querySelector('meta[name="station-id"]')?.content || '1';
	const dataMode = document.querySelector('meta[name="data-mode"]')?.content || 'mock';
	let activePeriod = '24h';

	const loadWeather = async () => {
		WeatherDashboard.setLoading(true);
		WeatherDashboard.hideNotice();
		try {
			const dashboard = dataMode === 'mock'
				? await MockWeatherData.fetchDashboard(activePeriod)
				: await WeatherAPI.fetchDashboard(stationId, activePeriod);
			WeatherDashboard.renderDashboard(dashboard);
		} catch (error) {
			WeatherDashboard.showNotice(`${error.message || 'Não foi possível carregar as leituras.'} Verifique se o backend Python está em execução.`);
		} finally {
			WeatherDashboard.setLoading(false);
		}
	};

	document.getElementById('refresh-button').addEventListener('click', loadWeather);
	document.getElementById('retry-button').addEventListener('click', loadWeather);
	document.querySelectorAll('[data-metric]').forEach((button) => {
		button.addEventListener('click', () => {
			document.querySelectorAll('[data-metric]').forEach((segment) => {
				const selected = segment === button;
				segment.classList.toggle('is-active', selected);
				segment.setAttribute('aria-pressed', String(selected));
			});
			WeatherDashboard.setMetric(button.dataset.metric);
		});
	});
	document.querySelectorAll('[data-period]').forEach((button) => {
		button.addEventListener('click', () => {
			activePeriod = button.dataset.period;
			document.querySelectorAll('[data-period]').forEach((segment) => {
				const selected = segment === button;
				segment.classList.toggle('is-active', selected);
				segment.setAttribute('aria-pressed', String(selected));
			});
			loadWeather();
		});
	});

	loadWeather();
	window.setInterval(loadWeather, 60_000);
})();
