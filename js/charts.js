(() => {
	const palette = {
		temperatura: '#c62828',
		umidade: '#171717',
		pressao: '#777777',
		luz_adc: '#ef5350',
		mq135_adc: '#8e1717',
	};
	const names = {
		temperatura: 'Temperatura',
		umidade: 'Umidade',
		pressao: 'Pressão',
		luz_adc: 'Resposta do LDR',
		mq135_adc: 'Qualidade do ar',
	};
	let chart;
	let readings = [];
	let units = {};
	let metric = 'temperatura';

	const labelFor = (timestamp) => {
		const date = new Date(timestamp);
		if (Number.isNaN(date.getTime())) return timestamp || '';
		const isLongPeriod = document.querySelector('[data-period].is-active')?.dataset.period !== '24h';
		return new Intl.DateTimeFormat('pt-BR', isLongPeriod ? { day: '2-digit', month: '2-digit' } : { hour: '2-digit', minute: '2-digit' }).format(date);
	};

	const draw = () => {
		const unit = units[metric] || ({ temperatura: '°C', umidade: '%', pressao: 'hPa', luz_adc: 'ADC', mq135_adc: 'ADC' }[metric] || '');
		const points = readings.filter((reading) => reading[metric] !== null && reading[metric] !== undefined && reading[metric] !== '' && Number.isFinite(Number(reading[metric])));
		const canvas = document.getElementById('weather-chart');
		const empty = document.getElementById('chart-empty');
		empty.hidden = points.length > 0;
		if (chart) {
			chart.destroy();
			chart = undefined;
		}
		if (!window.Chart || !points.length) return;

		const context = canvas.getContext('2d');
		const gradient = context.createLinearGradient(0, 0, 0, 260);
		gradient.addColorStop(0, `${palette[metric]}35`);
		gradient.addColorStop(1, `${palette[metric]}00`);
		chart = new Chart(context, {
			type: 'line',
			data: {
				labels: points.map((reading) => labelFor(reading.timestamp)),
				datasets: [{
					data: points.map((reading) => Number(reading[metric])),
					borderColor: palette[metric],
					backgroundColor: gradient,
					borderWidth: 2.5,
					fill: true,
					tension: 0.32,
					pointRadius: points.length > 40 ? 0 : 2,
					pointHoverRadius: 5,
					pointBackgroundColor: palette[metric],
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: 'index' },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#17221e',
						titleColor: '#b7c0b9',
						bodyColor: '#ffffff',
						padding: 12,
						displayColors: false,
						callbacks: { label: (item) => `${names[metric]}: ${item.formattedValue} ${unit}` },
					},
				},
				scales: {
					x: {
						grid: { display: false },
						border: { display: false },
						ticks: { color: '#89928c', maxTicksLimit: 8, maxRotation: 0, font: { family: 'DM Mono', size: 10 } },
					},
					y: {
						grid: { color: 'rgba(23, 34, 30, .07)', drawTicks: false },
						border: { display: false, dash: [3, 4] },
						ticks: { color: '#89928c', padding: 10, maxTicksLimit: 5, font: { family: 'DM Mono', size: 10 }, callback: (value) => `${value} ${unit}` },
					},
				},
			},
		});
	};

	const setData = (nextReadings, nextMetric, nextUnits) => {
		readings = nextReadings;
		metric = nextMetric;
		units = nextUnits;
		draw();
	};

	window.WeatherCharts = { setData };
})();
