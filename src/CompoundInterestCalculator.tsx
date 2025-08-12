import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Target, Info, Calculator, Activity, BarChart3 } from 'lucide-react';

const CompoundInterestCalculator = () => {
  const [inputs, setInputs] = useState({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 20,
    inflationRate: 2.5
  });

  const [activeTab, setActiveTab] = useState('calculator');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  };

  const calculations = useMemo(() => {
    const monthlyRate = inputs.annualReturn / 100 / 12;
    const totalMonths = inputs.years * 12;
    const monthlyInflationRate = inputs.inflationRate / 100 / 12;
    
    let data = [];
    let currentValue = inputs.initialAmount;
    let totalContributed = inputs.initialAmount;
    let realValue = inputs.initialAmount;
    
    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        // Add monthly contribution
        currentValue += inputs.monthlyContribution;
        totalContributed += inputs.monthlyContribution;
        
        // Apply compound interest
        currentValue *= (1 + monthlyRate);
        
        // Calculate real value (adjusted for inflation)
        realValue = currentValue / Math.pow(1 + monthlyInflationRate, month);
      }
      
      const year = month / 12;
      const interestEarned = currentValue - totalContributed;
      
      // Only add data points for each year
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
    
    // Find when interest exceeds principal
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

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Calculadora de Interés Compuesto
          </h1>
          <p className="text-gray-600">
            Analiza el crecimiento de tus inversiones en fondos indexados
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-6 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'calculator', label: 'Calculadora', icon: Calculator },
            { id: 'chart', label: 'Gráficos', icon: TrendingUp },
            { id: 'scenarios', label: 'Escenarios', icon: BarChart3 },
            { id: 'analysis', label: 'Análisis', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Parámetros de Inversión
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capital Inicial (€)
                  </label>
                  <input
                    type="number"
                    value={inputs.initialAmount}
                    onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aportación Mensual (€)
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentabilidad Anual (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.annualReturn}
                    onChange={(e) => handleInputChange('annualReturn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fondos indexados S&P 500: ~7-10% histórico
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período (años)
                  </label>
                  <input
                    type="number"
                    value={inputs.years}
                    onChange={(e) => handleInputChange('years', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inflación Anual (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Para calcular el valor real
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-2">
            {activeTab === 'calculator' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Valor Final</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(calculations.finalValue)}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Aportado</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculations.totalContributed)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Intereses</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(calculations.totalInterest)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ROI Total</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {calculations.roi.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-500" />
                    Análisis Clave
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">💰 Punto de Equilibrio</h4>
                      {calculations.crossoverPoint ? (
                        <p className="text-gray-600">
                          En el año <span className="font-bold text-blue-600">{calculations.crossoverPoint.year}</span>, 
                          los intereses ({formatCurrency(calculations.crossoverPoint.interestEarned)}) 
                          superarán al capital aportado ({formatCurrency(calculations.crossoverPoint.totalContributed)}).
                        </p>
                      ) : (
                        <p className="text-gray-600">
                          Los intereses no superarán al capital en el período seleccionado.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">📈 Poder del Interés Compuesto</h4>
                      <p className="text-gray-600">
                        El <span className="font-bold text-purple-600">{((calculations.totalInterest / calculations.finalValue) * 100).toFixed(1)}%</span> 
                        de tu patrimonio final vendrá de intereses compuestos, no de tus aportaciones.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">💸 Valor Real (Ajustado por Inflación)</h4>
                      <p className="text-gray-600">
                        Considerando la inflación del {inputs.inflationRate}%, tu patrimonio tendrá 
                        un valor real de <span className="font-bold text-green-600">{formatCurrency(calculations.totalRealValue)}</span>.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">🎯 Estrategia Recomendada</h4>
                      <p className="text-gray-600">
                        Con aportaciones mensuales de {formatCurrency(inputs.monthlyContribution)}, 
                        invertirás {formatCurrency(inputs.monthlyContribution * 12)} al año 
                        de forma automática y disciplinada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="space-y-6">
                {/* Evolution Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Evolución de la Inversión
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculations.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name]}
                          labelFormatter={(label) => `Año ${label}`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="totalContributed" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          name="Capital Aportado"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="interestEarned" 
                          stackId="1"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          name="Intereses Generados"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="realValue" 
                          stroke="#f59e0b" 
                          strokeDasharray="5 5"
                          name="Valor Real (Ajustado por Inflación)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Evolution */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Crecimiento Anual Detallado
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calculations.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name]}
                          labelFormatter={(label) => `Año ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="totalValue" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Valor Total"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="totalContributed" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Capital Aportado"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interestEarned" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Intereses Acumulados"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Comparación de Escenarios de Rentabilidad
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarioData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name]}
                        />
                        <Legend />
                        <Bar dataKey="totalContributed" fill="#94a3b8" name="Capital Aportado" />
                        <Bar dataKey="interest" fill="#3b82f6" name="Intereses Generados" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {scenarioData.map((scenario, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">{scenario.name}</h4>
                        <span 
                          className="px-2 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: scenario.color }}
                        >
                          {scenario.return}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Final:</span>
                          <span className="font-bold">{formatCurrency(scenario.finalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intereses:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(scenario.interest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Multiplicador:</span>
                          <span className="font-bold text-green-600">
                            {(scenario.finalValue / scenario.totalContributed).toFixed(1)}x
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Composición Final de la Inversión
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">💡 Reflexión</h4>
                        <p className="text-gray-600">
                          De los <strong>{formatCurrency(calculations.finalValue)}</strong> finales, 
                          solo <strong>{formatCurrency(calculations.totalContributed)}</strong> son 
                          dinero que habrás aportado realmente.
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">🚀 El Poder del Tiempo</h4>
                        <p className="text-blue-600">
                          Los <strong>{formatCurrency(calculations.totalInterest)}</strong> de intereses 
                          representan el verdadero poder del interés compuesto trabajando a tu favor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Year by Year Breakdown */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Evolución Año por Año
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Año</th>
                          <th className="text-right p-2">Valor Total</th>
                          <th className="text-right p-2">Capital Aportado</th>
                          <th className="text-right p-2">Intereses</th>
                          <th className="text-right p-2">Valor Real</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculations.data.slice(0, 11).map((row, index) => (
                          <tr key={index} className={`border-b hover:bg-gray-50 ${
                            calculations.crossoverPoint && row.year === calculations.crossoverPoint.year 
                              ? 'bg-yellow-50' 
                              : ''
                          }`}>
                            <td className="p-2 font-medium">
                              {row.year}
                              {calculations.crossoverPoint && row.year === calculations.crossoverPoint.year && 
                                <span className="ml-2 text-xs bg-yellow-200 px-2 py-1 rounded">
                                  Punto de equilibrio
                                </span>
                              }
                            </td>
                            <td className="p-2 text-right font-medium">
                              {formatCurrency(row.totalValue)}
                            </td>
                            <td className="p-2 text-right text-green-600">
                              {formatCurrency(row.totalContributed)}
                            </td>
                            <td className="p-2 text-right text-blue-600">
                              {formatCurrency(row.interestEarned)}
                            </td>
                            <td className="p-2 text-right text-orange-600">
                              {formatCurrency(row.realValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with tips */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Consejos para Inversión en Fondos Indexados</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🎯 Consistencia</h4>
              <p className="text-blue-700">Mantén aportaciones regulares independientemente del mercado. El DCA (Dollar Cost Averaging) reduce el riesgo.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">⏰ Tiempo</h4>
              <p className="text-green-700">El interés compuesto necesita tiempo. Los últimos años de inversión generan más ganancia que los primeros.</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">🔄 Reinversión</h4>
              <p className="text-purple-700">Reinvierte todos los dividendos automáticamente para maximizar el efecto del interés compuesto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;