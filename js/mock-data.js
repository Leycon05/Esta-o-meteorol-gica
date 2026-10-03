(() => {
	const station = {
		id: 'DEMO-01',
		nome: 'Estação de demonstração',
		localizacao: 'Localização ilustrativa · São Paulo',
		latitude: -23.5505,
		longitude: -46.6333,
	};

	const makeReading = (date, index, count) => {
		const dailyCycle = Math.sin((index / Math.max(1, count - 1)) * Math.PI * 2);
		const slowCycle = Math.sin(index * 0.51);
		return {
			estacao: station.id,
			timestamp: date.toISOString(),
			temperatura: Number((22.4 + dailyCycle * 3.1 + slowCycle * 0.7).toFixed(1)),
			umidade: Math.round(61 - dailyCycle * 10 + slowCycle * 3),
			pressao: Number((1012.6 + Math.sin(index * 0.28) * 2.8).toFixed(1)),
			luz_adc: Math.round(Math.max(0, 1960 + dailyCycle * 1520 + slowCycle * 180)),
			mq135_adc: Math.round(890 + Math.sin(index * 0.37) * 130 + slowCycle * 65),
			mq135_alerta: false,
			valida: true,
		};
	};

	const createHistory = (period) => {
		const count = period === '30d' ? 30 : period === '7d' ? 7 : 24;
		const stepHours = period === '30d' ? 24 : period === '7d' ? 24 : 1;
		const now = new Date();
		const readings = Array.from({ length: count }, (_, index) => {
			const ageHours = (count - index - 1) * stepHours;
			return makeReading(new Date(now.getTime() - ageHours * 60 * 60 * 1000), index, count);
		});

		if (readings.length > 5) {
			readings[readings.length - 5] = {
				...readings[readings.length - 5],
				temperatura: 88,
				valida: false,
			};
		}

		return readings;
	};

	const fetchDashboard = async (period) => {
		const historico = createHistory(period);
		const leiturasValidas = historico.filter((reading) => reading.valida);
		const ultimaLeitura = leiturasValidas.at(-1);

		return {
			modo: 'demonstracao',
			estacao: station,
			ultima_leitura: ultimaLeitura,
			historico,
			unidades: {
				temperatura: '°C',
				umidade: '%',
				pressao: 'hPa',
				luz_adc: 'ADC',
				mq135_adc: 'ADC',
			},
			resumo: {
				leituras_validas: leiturasValidas.length,
				leituras_rejeitadas: historico.length - leiturasValidas.length,
			},
		};
	};

	window.MockWeatherData = { fetchDashboard };
})();
