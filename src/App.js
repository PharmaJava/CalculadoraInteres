export function CompoundInterestCalculator() {
  const [inputs, setInputs] = React.useState({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 20,
    inflationRate: 2.5
  });

  const [activeTab, setActiveTab] = React.useState('calculator');

  React.useEffect(() => {
    window.Lucide && window.Lucide.createIcons();
  }, [activeTab]);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  }

  const calculations = React.useMemo(() => {
    const monthlyRate = inputs.annualReturn / 100 / 12;
    const totalMonths = inputs.years * 12;
    const monthlyInflationRate = inputs.inflationRate / 100 / 12;

    let data = [];
    let currentValue = inputs.initialAmount;
    let totalContributed = inputs.initialAmount;
    let realValue = inputs.initialAmount;

    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        currentValue += inputs.monthlyContribution;
        totalContributed += inputs.monthlyContribution;
        currentValue *= (1 + monthlyRate);
        realValue = currentValue / Math.pow(1 + monthlyInflationRate, month);
      }
      const year = month / 12;
      const interestEarned = currentValue - totalContributed;
      if (month % 12 === 0) {
        data.push({
          year: Math.round(year),
          totalValue: Math.round(currentValue),
          totalContributed: Math.round(totalContributed),
          interestEarned: Math.round(interestEarned),
          realValue: Math.round(realValue),
          month
        });
      }
    }
    const finalValue = currentValue;
    const totalInterest = finalValue - totalContributed;
    const totalRealValue = realValue;
    const crossoverPoint = data.find(point => point.interestEarned > point.totalContributed);

    return {
      data,
      finalValue,
      totalContributed,
      totalInterest,
      totalRealValue,
      crossoverPoint,
      roi: ((finalValue - totalContributed) / totalContributed) * 100
    };
  }, [inputs]);

  function handleInputChange(field, value) {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  }

  const scenarios = [
    { name: 'Conservador', return: 4, color: '#10b981' },
    { name: 'Moderado', return: 7, color: '#3b82f6' },
    { name: 'Agresivo', return: 10, color: '#f59e0b' }
  ];

  const scenarioData = scenarios.map(scenario => {
    const monthlyRate = scenario.return / 100 / 12;
    const totalMonths = inputs.years * 12;
    let value = inputs.initialAmount;
    let contributed = inputs.initialAmount;

    for (let month = 1; month <= totalMonths; month++) {
      value += inputs.monthlyContribution;
      contributed += inputs.monthlyContribution;
      value *= (1 + monthlyRate);
    }

    return {
      name: scenario.name,
      finalValue: Math.round(value),
      totalContributed: Math.round(contributed),
      interest: Math.round(value - contributed),
      return: scenario.return,
      color: scenario.color
    };
  });

  const pieData = [
    { name: 'Capital Aportado', value: calculations.totalContributed, color: '#94a3b8' },
    { name: 'Intereses Generados', value: calculations.totalInterest, color: '#3b82f6' }
  ];

  // Acceso a los componentes de Recharts del bundle UMD
  const {
    ResponsiveContainer,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Area,
    Line,
    LineChart,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
  } = window.Recharts || {};

  // El return es igual al JSX que ya tienes en versiones anteriores
  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" },
      React.createElement('div', { className: "max-w-7xl mx-auto" },
        // Header
        React.createElement('div', { className: "text-center mb-8" },
          React.createElement('h1', { className: "text-4xl font-bold text-gray-800 mb-2" }, "Calculadora de Interés Compuesto"),
          React.createElement('p', { className: "text-gray-600" }, "Analiza el crecimiento de tus inversiones en fondos indexados")
        ),
        // Navigation Tabs
        React.createElement('div', { className: "flex flex-wrap justify-center mb-6 bg-white rounded-lg p-2 shadow-sm" },
          [
            { id: 'calculator', label: 'Calculadora', icon: 'Calculator' },
            { id: 'chart', label: 'Gráficos', icon: 'TrendingUp' },
            { id: 'scenarios', label: 'Escenarios', icon: 'BarChart3' },
            { id: 'analysis', label: 'Análisis', icon: 'Activity' }
          ].map(tab =>
            React.createElement('button', {
              key: tab.id,
              onClick: () => setActiveTab(tab.id),
              className: `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }`
            },
              React.createElement('i', { 'data-lucide': tab.icon, className: "w-5 h-5" }),
              React.createElement('span', null, tab.label)
            )
          )
        ),
        React.createElement('div', { className: "grid lg:grid-cols-3 gap-6" },
          // Input Panel
          React.createElement('div', { className: "lg:col-span-1" },
            React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 sticky top-4" },
              React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Parámetros de Inversión"),
              React.createElement('div', { className: "space-y-4" },
                // Capital Inicial
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Capital Inicial (€)"),
                  React.createElement('input', {
                    type: "number",
                    value: inputs.initialAmount,
                    onChange: e => handleInputChange('initialAmount', e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    min: "0"
                  })
                ),
                // Aportación Mensual
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Aportación Mensual (€)"),
                  React.createElement('input', {
                    type: "number",
                    value: inputs.monthlyContribution,
                    onChange: e => handleInputChange('monthlyContribution', e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    min: "0"
                  })
                ),
                // Rentabilidad Anual
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Rentabilidad Anual (%)"),
                  React.createElement('input', {
                    type: "number",
                    value: inputs.annualReturn,
                    onChange: e => handleInputChange('annualReturn', e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    min: "0",
                    step: "0.1"
                  }),
                  React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Fondos indexados S&P 500: ~7-10% histórico")
                ),
                // Período
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Período (años)"),
                  React.createElement('input', {
                    type: "number",
                    value: inputs.years,
                    onChange: e => handleInputChange('years', e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    min: "1",
                    max: "50"
                  })
                ),
                // Inflación
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Inflación Anual (%)"),
                  React.createElement('input', {
                    type: "number",
                    value: inputs.inflationRate,
                    onChange: e => handleInputChange('inflationRate', e.target.value),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    min: "0",
                    step: "0.1"
                  }),
                  React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Para calcular el valor real")
                )
              )
            )
          ),
          // Content Panel
          React.createElement('div', { className: "lg:col-span-2" },
            activeTab === 'calculator' && (
              React.createElement('div', { className: "space-y-6" },
                // Métricas clave
                React.createElement('div', { className: "grid md:grid-cols-2 xl:grid-cols-4 gap-4" },
                  // Valor Final
                  React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                      React.createElement('div', null,
                        React.createElement('p', { className: "text-sm font-medium text-gray-600" }, "Valor Final"),
                        React.createElement('p', { className: "text-2xl font-bold text-blue-600" }, formatCurrency(calculations.finalValue))
                      ),
                      React.createElement('div', { className: "p-3 bg-blue-100 rounded-full" },
                        React.createElement('i', { 'data-lucide': "DollarSign", className: "w-6 h-6 text-blue-600" })
                      )
                    )
                  ),
                  // Total Aportado
                  React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                      React.createElement('div', null,
                        React.createElement('p', { className: "text-sm font-medium text-gray-600" }, "Total Aportado"),
                        React.createElement('p', { className: "text-2xl font-bold text-green-600" }, formatCurrency(calculations.totalContributed))
                      ),
                      React.createElement('div', { className: "p-3 bg-green-100 rounded-full" },
                        React.createElement('i', { 'data-lucide': "Target", className: "w-6 h-6 text-green-600" })
                      )
                    )
                  ),
                  // Intereses
                  React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                      React.createElement('div', null,
                        React.createElement('p', { className: "text-sm font-medium text-gray-600" }, "Intereses"),
                        React.createElement('p', { className: "text-2xl font-bold text-purple-600" }, formatCurrency(calculations.totalInterest))
                      ),
                      React.createElement('div', { className: "p-3 bg-purple-100 rounded-full" },
                        React.createElement('i', { 'data-lucide': "TrendingUp", className: "w-6 h-6 text-purple-600" })
                      )
                    )
                  ),
                  // ROI Total
                  React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                      React.createElement('div', null,
                        React.createElement('p', { className: "text-sm font-medium text-gray-600" }, "ROI Total"),
                        React.createElement('p', { className: "text-2xl font-bold text-orange-600" }, calculations.roi.toFixed(1) + '%')
                      ),
                      React.createElement('div', { className: "p-3 bg-orange-100 rounded-full" },
                        React.createElement('i', { 'data-lucide': "Calendar", className: "w-6 h-6 text-orange-600" })
                      )
                    )
                  )
                ),
                // Análisis clave
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4 flex items-center" },
                    React.createElement('i', { 'data-lucide': "Info", className: "w-5 h-5 mr-2 text-blue-500" }),
                    "Análisis Clave"
                  ),
                  React.createElement('div', { className: "grid md:grid-cols-2 gap-6" },
                    React.createElement('div', null,
                      React.createElement('h4', { className: "font-medium text-gray-700 mb-2" }, "💰 Punto de Equilibrio"),
                      calculations.crossoverPoint ? (
                        React.createElement('p', { className: "text-gray-600" },
                          "En el año ",
                          React.createElement('span', { className: "font-bold text-blue-600" }, calculations.crossoverPoint.year),
                          ", los intereses (", formatCurrency(calculations.crossoverPoint.interestEarned), ") superarán al capital aportado (", formatCurrency(calculations.crossoverPoint.totalContributed), ")."
                        )
                      ) : (
                        React.createElement('p', { className: "text-gray-600" },
                          "Los intereses no superarán al capital en el período seleccionado."
                        )
                      )
                    ),
                    React.createElement('div', null,
                      React.createElement('h4', { className: "font-medium text-gray-700 mb-2" }, "📈 Poder del Interés Compuesto"),
                      React.createElement('p', { className: "text-gray-600" },
                        "El ",
                        React.createElement('span', { className: "font-bold text-purple-600" },
                          ((calculations.totalInterest / calculations.finalValue) * 100).toFixed(1), "%"
                        ),
                        " de tu patrimonio final vendrá de intereses compuestos, no de tus aportaciones."
                      )
                    ),
                    React.createElement('div', null,
                      React.createElement('h4', { className: "font-medium text-gray-700 mb-2" }, "💸 Valor Real (Ajustado por Inflación)"),
                      React.createElement('p', { className: "text-gray-600" },
                        "Considerando la inflación del ", inputs.inflationRate, "%, tu patrimonio tendrá un valor real de ",
                        React.createElement('span', { className: "font-bold text-green-600" }, formatCurrency(calculations.totalRealValue)),
                        "."
                      )
                    ),
                    React.createElement('div', null,
                      React.createElement('h4', { className: "font-medium text-gray-700 mb-2" }, "🎯 Estrategia Recomendada"),
                      React.createElement('p', { className: "text-gray-600" },
                        "Con aportaciones mensuales de ", formatCurrency(inputs.monthlyContribution),
                        ", invertirás ", formatCurrency(inputs.monthlyContribution * 12), " al año de forma automática y disciplinada."
                      )
                    )
                  )
                )
              )
            ),
            // ...las otras pestañas (Gráficos, Escenarios, Análisis) igual que antes...
            activeTab === 'chart' && (
              React.createElement('div', { className: "space-y-6" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Evolución de la Inversión"),
                  React.createElement('div', { className: "h-96" },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                      React.createElement(AreaChart, { data: calculations.data },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(XAxis, { dataKey: "year" }),
                        React.createElement(YAxis, { tickFormatter: formatNumber }),
                        React.createElement(Tooltip, {
                          formatter: (value, name) => [formatCurrency(value), name],
                          labelFormatter: label => `Año ${label}`
                        }),
                        React.createElement(Legend, null),
                        React.createElement(Area, {
                          type: "monotone",
                          dataKey: "totalContributed",
                          stackId: "1",
                          stroke: "#10b981",
                          fill: "#10b981",
                          name: "Capital Aportado"
                        }),
                        React.createElement(Area, {
                          type: "monotone",
                          dataKey: "interestEarned",
                          stackId: "1",
                          stroke: "#3b82f6",
                          fill: "#3b82f6",
                          name: "Intereses Generados"
                        }),
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "realValue",
                          stroke: "#f59e0b",
                          strokeDasharray: "5 5",
                          name: "Valor Real (Ajustado por Inflación)"
                        })
                      )
                    )
                  )
                ),
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Crecimiento Anual Detallado"),
                  React.createElement('div', { className: "h-96" },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                      React.createElement(LineChart, { data: calculations.data },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(XAxis, { dataKey: "year" }),
                        React.createElement(YAxis, { tickFormatter: formatNumber }),
                        React.createElement(Tooltip, {
                          formatter: (value, name) => [formatCurrency(value), name],
                          labelFormatter: label => `Año ${label}`
                        }),
                        React.createElement(Legend, null),
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "totalValue",
                          stroke: "#3b82f6",
                          strokeWidth: 3,
                          name: "Valor Total"
                        }),
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "totalContributed",
                          stroke: "#10b981",
                          strokeWidth: 2,
                          name: "Capital Aportado"
                        }),
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "interestEarned",
                          stroke: "#f59e0b",
                          strokeWidth: 2,
                          name: "Intereses Acumulados"
                        })
                      )
                    )
                  )
                )
              )
            ),
            activeTab === 'scenarios' && (
              React.createElement('div', { className: "space-y-6" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Comparación de Escenarios de Rentabilidad"),
                  React.createElement('div', { className: "h-96" },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                      React.createElement(BarChart, { data: scenarioData },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(XAxis, { dataKey: "name" }),
                        React.createElement(YAxis, { tickFormatter: formatNumber }),
                        React.createElement(Tooltip, { formatter: (value, name) => [formatCurrency(value), name] }),
                        React.createElement(Legend, null),
                        React.createElement(Bar, { dataKey: "totalContributed", fill: "#94a3b8", name: "Capital Aportado" }),
                        React.createElement(Bar, { dataKey: "interest", fill: "#3b82f6", name: "Intereses Generados" })
                      )
                    )
                  )
                ),
                React.createElement('div', { className: "grid md:grid-cols-3 gap-4" },
                  scenarioData.map((scenario, index) =>
                    React.createElement('div', { key: index, className: "bg-white rounded-xl shadow-lg p-6" },
                      React.createElement('div', { className: "flex items-center justify-between mb-4" },
                        React.createElement('h4', { className: "font-semibold text-gray-800" }, scenario.name),
                        React.createElement('span', {
                          className: "px-2 py-1 rounded-full text-white text-sm font-medium",
                          style: { backgroundColor: scenario.color }
                        }, scenario.return + "%")
                      ),
                      React.createElement('div', { className: "space-y-2" },
                        React.createElement('div', { className: "flex justify-between" },
                          React.createElement('span', { className: "text-gray-600" }, "Valor Final:"),
                          React.createElement('span', { className: "font-bold" }, formatCurrency(scenario.finalValue))
                        ),
                        React.createElement('div', { className: "flex justify-between" },
                          React.createElement('span', { className: "text-gray-600" }, "Intereses:"),
                          React.createElement('span', { className: "font-bold text-blue-600" }, formatCurrency(scenario.interest))
                        ),
                        React.createElement('div', { className: "flex justify-between" },
                          React.createElement('span', { className: "text-gray-600" }, "Multiplicador:"),
                          React.createElement('span', { className: "font-bold text-green-600" },
                            (scenario.finalValue / scenario.totalContributed).toFixed(1) + "x"
                          )
                        )
                      )
                    )
                  )
                )
              )
            ),
            activeTab === 'analysis' && (
              React.createElement('div', { className: "space-y-6" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Composición Final de la Inversión"),
                  React.createElement('div', { className: "grid md:grid-cols-2 gap-6" },
                    React.createElement('div', { className: "h-80" },
                      React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                        React.createElement(PieChart, null,
                          React.createElement(Pie, {
                            data: pieData,
                            cx: "50%",
                            cy: "50%",
                            labelLine: false,
                            label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`,
                            outerRadius: 80,
                            fill: "#8884d8",
                            dataKey: "value"
                          },
                            pieData.map((entry, i) =>
                              React.createElement(Cell, { key: `cell-${i}`, fill: entry.color })
                            )
                          ),
                          React.createElement(Tooltip, { formatter: value => formatCurrency(value) })
                        )
                      )
                    ),
                    React.createElement('div', { className: "flex flex-col justify-center space-y-4" },
                      React.createElement('div', { className: "p-4 bg-gray-50 rounded-lg" },
                        React.createElement('h4', { className: "font-medium text-gray-700 mb-2" }, "💡 Reflexión"),
                        React.createElement('p', { className: "text-gray-600" },
                          "De los ", React.createElement('strong', null, formatCurrency(calculations.finalValue)), " finales, solo ",
                          React.createElement('strong', null, formatCurrency(calculations.totalContributed)),
                          " son dinero que habrás aportado realmente."
                        )
                      ),
                      React.createElement('div', { className: "p-4 bg-blue-50 rounded-lg" },
                        React.createElement('h4', { className: "font-medium text-blue-700 mb-2" }, "🚀 El Poder del Tiempo"),
                        React.createElement('p', { className: "text-blue-600" },
                          "Los ", React.createElement('strong', null, formatCurrency(calculations.totalInterest)), " de intereses representan el verdadero poder del interés compuesto trabajando a tu favor."
                        )
                      )
                    )
                  )
                ),
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                  React.createElement('h3', { className: "text-xl font-semibold text-gray-800 mb-4" }, "Evolución Año por Año"),
                  React.createElement('div', { className: "overflow-x-auto" },
                    React.createElement('table', { className: "w-full text-sm" },
                      React.createElement('thead', null,
                        React.createElement('tr', { className: "border-b" },
                          React.createElement('th', { className: "text-left p-2" }, "Año"),
                          React.createElement('th', { className: "text-right p-2" }, "Valor Total"),
                          React.createElement('th', { className: "text-right p-2" }, "Capital Aportado"),
                          React.createElement('th', { className: "text-right p-2" }, "Intereses"),
                          React.createElement('th', { className: "text-right p-2" }, "Valor Real")
                        )
                      ),
                      React.createElement('tbody', null,
                        calculations.data.slice(0, 11).map((row, index) =>
                          React.createElement('tr', {
                            key: index,
                            className: `border-b hover:bg-gray-50 ${calculations.crossoverPoint && row.year === calculations.crossoverPoint.year ? 'bg-yellow-50' : ''}`
                          },
                            React.createElement('td', { className: "p-2 font-medium" }, row.year,
                              calculations.crossoverPoint && row.year === calculations.crossoverPoint.year && (
                                React.createElement('span', { className: "ml-2 text-xs bg-yellow-200 px-2 py-1 rounded" }, "Punto de equilibrio")
                              )
                            ),
                            React.createElement('td', { className: "p-2 text-right font-medium" }, formatCurrency(row.totalValue)),
                            React.createElement('td', { className: "p-2 text-right text-green-600" }, formatCurrency(row.totalContributed)),
                            React.createElement('td', { className: "p-2 text-right text-blue-600" }, formatCurrency(row.interestEarned)),
                            React.createElement('td', { className: "p-2 text-right text-orange-600" }, formatCurrency(row.realValue))
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        // Footer
        React.createElement('div', { className: "mt-8 bg-white rounded-xl shadow-lg p-6" },
          React.createElement('h3', { className: "text-lg font-semibold text-gray-800 mb-4" }, "💡 Consejos para Inversión en Fondos Indexados"),
          React.createElement('div', { className: "grid md:grid-cols-3 gap-4 text-sm" },
            React.createElement('div', { className: "p-3 bg-blue-50 rounded-lg" },
              React.createElement('h4', { className: "font-medium text-blue-800 mb-2" }, "🎯 Consistencia"),
              React.createElement('p', { className: "text-blue-700" }, "Mantén aportaciones regulares independientemente del mercado. El DCA (Dollar Cost Averaging) reduce el riesgo.")
            ),
            React.createElement('div', { className: "p-3 bg-green-50 rounded-lg" },
              React.createElement('h4', { className: "font-medium text-green-800 mb-2" }, "⏰ Tiempo"),
              React.createElement('p', { className: "text-green-700" }, "El interés compuesto necesita tiempo. Los últimos años de inversión generan más ganancia que los primeros.")
            ),
            React.createElement('div', { className: "p-3 bg-purple-50 rounded-lg" },
              React.createElement('h4', { className: "font-medium text-purple-800 mb-2" }, "🔄 Reinversión"),
              React.createElement('p', { className: "text-purple-700" }, "Reinvierte todos los dividendos automáticamente para maximizar el efecto del interés compuesto.")
            )
          )
        )
      )
    )
  );
}
