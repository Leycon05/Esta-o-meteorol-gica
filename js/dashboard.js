(() => {
	const byId = (id) => document.getElementById(id);
	const metricDetails = {
		temperatura: { label: 'Temperatura do ar · DHT22', unit: '°C', digits: 1 },
		umidade: { label: 'Umidade relativa · DHT22', unit: '%', digits: 1 },
		pressao: { label: 'Pressão atmosférica · BMP280', unit: 'hPa', digits: 1 },
		luz_adc: { label: 'Resposta do LDR', unit: 'ADC', digits: 0 },
		mq135_adc: { label: 'Qualidade do ar', unit: 'ADC', digits: 0 },
	};
	let dashboardData;
	let selectedMetric = 'temperatura';

	const formatNumber = (value, digits = 1) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
		? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(Number(value))
		: '--';
	const formatTimestamp = (value) => {
		if (!value) return '--';
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? '--' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
	};
	const hasCoordinateValues = (latitude, longitude) => latitude !== null && latitude !== undefined && latitude !== ''
		&& longitude !== null && longitude !== undefined && longitude !== ''
		&& Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
	const coordinateText = (latitude, longitude) => hasCoordinateValues(latitude, longitude)
		? `${Number(latitude).toFixed(5)}°, ${Number(longitude).toFixed(5)}°`
		: 'Coordenadas indisponíveis';

	const validReadings = (readings) => (readings || []).filter((reading) =>
		reading.valida !== false && reading.valido !== false && reading.valid !== false);

	const updateMap = (station) => {
		const latitude = Number(station.latitude);
		const longitude = Number(station.longitude);
		const hasCoordinates = hasCoordinateValues(station.latitude, station.longitude)
			&& Number.isFinite(latitude) && Number.isFinite(longitude)
			&& Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
		byId('map-coordinates').textContent = hasCoordinates ? coordinateText(latitude, longitude) : 'Coordenadas indisponíveis';
		byId('coordinates').textContent = hasCoordinates ? coordinateText(latitude, longitude) : 'Localização não informada';
		byId('footer-coordinates').innerHTML = `${station.id || 'ESTAÇÃO 01'} <span>·</span> ${hasCoordinates ? coordinateText(latitude, longitude) : 'LOCALIZAÇÃO NÃO INFORMADA'}`;
		byId('map-empty').hidden = hasCoordinates;
		byId('map-frame').querySelector('iframe')?.remove();
		if (!hasCoordinates) return;

		const span = 0.012;
		const bounds = [longitude - span, latitude - span, longitude + span, latitude + span].join('%2C');
		const iframe = document.createElement('iframe');
		iframe.title = `Mapa da estação ${station.nome || station.name || station.id || 'meteorológica'}`;
		iframe.loading = 'lazy';
		iframe.referrerPolicy = 'no-referrer-when-downgrade';
		iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${latitude}%2C${longitude}`;
		byId('map-frame').append(iframe);
	};

	const renderCurrent = (dashboard) => {
		const station = dashboard.estacao || dashboard.station || {};
		const readings = validReadings(dashboard.historico || dashboard.leituras || dashboard.history);
		const latestCandidate = dashboard.ultima_leitura || dashboard.latest || readings.at(-1) || {};
		const latest = latestCandidate.valida === false || latestCandidate.valido === false || latestCandidate.valid === false
			? readings.at(-1) || {}
			: latestCandidate;
		const units = dashboard.unidades || {};
		const stationName = station.nome || station.name || `Estação ${station.id || '01'}`;

		byId('location-name').textContent = stationName;
		byId('location-region').textContent = station.localizacao || station.municipio || station.city || 'Estação meteorológica ESP32';
		byId('station-id').textContent = station.id ?? '01';
		byId('station-origin').textContent = dashboard.modo === 'demonstracao' ? 'Dados fictícios' : 'ESP32';
		byId('current-temperature').textContent = formatNumber(latest.temperatura);
		byId('reading-time').textContent = formatTimestamp(latest.timestamp);
		byId('humidity').textContent = formatNumber(latest.umidade);
		byId('pressure').textContent = formatNumber(latest.pressao);
		byId('pressure-unit').textContent = units.pressao || 'hPa';
		byId('light-reading').textContent = formatNumber(latest.luz_adc, 0);
		byId('light-unit').textContent = units.luz_adc || 'ADC';
		byId('gas-reading').textContent = formatNumber(latest.mq135_adc, 0);
		byId('gas-unit').textContent = units.mq135_adc || 'ADC';
		byId('gas-note').textContent = latest.mq135_alerta === true
			? 'Resposta acima do limite definido · MQ-135'
			: 'Indicador relativo · resposta analógica MQ-135';
		byId('humidity-meter').style.width = `${Math.min(100, Math.max(0, Number(latest.umidade) || 0))}%`;
		byId('updated-at').textContent = `Leitura: ${formatTimestamp(latest.timestamp)}`;
		byId('last-update').textContent = formatTimestamp(latest.timestamp);
		byId('topbar-date').textContent = `ESTAÇÃO ${station.id || '01'} · ESP32`;
		const isDemo = dashboard.modo === 'demonstracao';
		byId('history-kicker').textContent = isDemo ? 'SÉRIE FICTÍCIA · DEMONSTRAÇÃO' : 'DADOS VALIDADOS DA ESTAÇÃO';
		byId('connection-label').textContent = isDemo ? 'Modo demonstração' : 'API conectada';
		byId('telemetry-indicator').classList.toggle('is-live', !isDemo);
		byId('telemetry-indicator').lastChild.textContent = isDemo ? ' DADOS FICTÍCIOS · DEMO' : ' TELEMETRIA RECEBIDA';
		byId('station-state').classList.toggle('is-receiving', !isDemo);
		byId('station-state').lastChild.textContent = isDemo ? ' DEMONSTRAÇÃO' : ' DADOS RECEBIDOS';
		byId('integrity-status').classList.add('is-connected');
		byId('integrity-status').querySelector('strong').textContent = isDemo ? 'Valores fictícios' : 'Dados recebidos';
		byId('integrity-copy').textContent = isDemo
			? 'Dados simulados para visualizar o painel. Não são medições reais dos sensores.'
			: 'O histórico é exibido sem leituras marcadas como inválidas pela API.';
		byId('valid-count').textContent = formatNumber(dashboard.resumo?.leituras_validas ?? readings.length, 0);
		byId('rejected-count').textContent = formatNumber(dashboard.resumo?.leituras_rejeitadas ?? dashboard.leituras_rejeitadas ?? 0, 0);
		updateMap(station);
		document.title = `${stationName} | Estação meteorológica`;
	};

	const renderStats = () => {
		const details = metricDetails[selectedMetric];
		const unit = dashboardData.unidades?.[selectedMetric] || details.unit;
		const readings = validReadings(dashboardData.historico || dashboardData.leituras || dashboardData.history);
		const values = readings.map((reading) => reading[selectedMetric]).filter((value) => value !== null && value !== undefined && value !== '').map(Number).filter(Number.isFinite);
		const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
		byId('valid-count').textContent = formatNumber(dashboardData.resumo?.leituras_validas ?? readings.length, 0);
		byId('period-average').textContent = `${formatNumber(average, details.digits)} ${unit}`;
		byId('period-min').textContent = `${formatNumber(values.length ? Math.min(...values) : null, details.digits)} ${unit}`;
		byId('period-max').textContent = `${formatNumber(values.length ? Math.max(...values) : null, details.digits)} ${unit}`;
		byId('chart-summary-value').textContent = values.length ? `${formatNumber(values.at(-1), details.digits)} ${unit}` : '--';
		byId('chart-summary-label').textContent = `${details.label} · valor mais recente no período`;
		byId('chart-unit').textContent = unit;
		if (window.WeatherCharts) window.WeatherCharts.setData(readings, selectedMetric, dashboardData.unidades || {});
	};

	const showNotice = (message) => {
		byId('notice-message').textContent = message;
		byId('notice').hidden = false;
		byId('connection-label').textContent = 'API desconectada';
		byId('telemetry-indicator').classList.remove('is-live');
		byId('telemetry-indicator').lastChild.textContent = ' SEM CONEXÃO';
		byId('station-state').classList.remove('is-receiving');
		byId('station-state').lastChild.textContent = ' SEM CONEXÃO';
		byId('integrity-status').classList.remove('is-connected');
		byId('integrity-status').querySelector('strong').textContent = 'Sem conexão com a API';
		byId('integrity-copy').textContent = 'Não foi possível carregar os dados. Ative o modo de demonstração ou conecte o backend Python.';
	};

	const hideNotice = () => {
		byId('notice').hidden = true;
	};

	const setLoading = (loading) => {
		byId('refresh-button').disabled = loading;
		byId('refresh-button').classList.toggle('is-loading', loading);
		document.querySelector('.dashboard').setAttribute('aria-busy', String(loading));
	};

	const renderDashboard = (data) => {
		dashboardData = data;
		renderCurrent(data);
		renderStats();
		if (window.lucide) window.lucide.createIcons();
	};

	const setMetric = (metric) => {
		if (!metricDetails[metric] || !dashboardData) return;
		selectedMetric = metric;
		renderStats();
	};

	window.WeatherDashboard = { hideNotice, renderDashboard, setLoading, setMetric, showNotice };
})();
