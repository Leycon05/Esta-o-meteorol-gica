# Dashboard da Estação Meteorológica

Projeto de painel web responsivo para acompanhar uma estação meteorológica baseada em ESP32. A interface apresenta temperatura e umidade do DHT22, pressão atmosférica do BMP280, luminosidade do LDR e qualidade relativa do ar pelo MQ-135. No momento, o dashboard usa dados fictícios de demonstração enquanto a API do backend não está disponível.

## Estrutura de pastas

```text
dashboard-estacao-meteorologica/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── charts.js
│   ├── dashboard.js
│   └── mock-data.js
└── assets/
    ├── icons/
    └── images/
```

## O que há em cada pasta

- `css/`: arquivos de estilo visual e responsividade da interface. Atualmente contém `style.css`.
- `js/`: códigos JavaScript que controlam a página, os dados exibidos e os gráficos. `app.js` inicia o dashboard, `dashboard.js` atualiza os componentes, `charts.js` monta os gráficos, `api.js` prepara a comunicação com o backend e `mock-data.js` fornece dados fictícios para demonstração.
- `assets/`: reúne recursos visuais usados pelo projeto.
- `assets/icons/`: ícones próprios que podem ser usados na interface.
- `assets/images/`: imagens e ilustrações usadas pelo dashboard.

Na raiz, `index.html` define a estrutura da página e `README.md` descreve o projeto e sua organização.