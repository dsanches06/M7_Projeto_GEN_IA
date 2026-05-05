import { StatisticsService } from "../../services/statisticService.js";

export type ChartType = "bar" | "pie" | "line" | "doughnut" | "area";

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      fill?: boolean;
    }[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    [key: string]: any;
  };
}

export interface ChartDataExport {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  users: number;
  timestamp: string;
}

const defaultColors = [
  "#007bff",
  "#dc3545",
  "#28a745",
  "#ffc107",
  "#17a2b8",
  "#6c757d",
  "#6610f2",
  "#fd7e14",
];

export class StatisticPageUI {
  private container: HTMLElement;
  private statisticsService: StatisticsService;
  private charts: Map<string, HTMLCanvasElement> = new Map();

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.statisticsService = new StatisticsService();
  }

  /**
   * Renderiza a página completa com todos os gráficos
   */
  public async render(): Promise<void> {
    this.charts.forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    });
    this.container.innerHTML = "";
    this.container.classList.add("statistics-page");
    this.charts.clear();

    // Cabeçalho
    const header = this.createHeader();
    this.container.appendChild(header);

    // Grid de gráficos
    const chartsGrid = this.createChartsGrid();
    this.container.appendChild(chartsGrid);

    // Renderizar cada gráfico utilizando a API de estatísticas
    await this.renderRankingMoreHoursChart(chartsGrid);
    await this.renderRankingIncreasedHoursChart(chartsGrid);
    await this.renderRankingAboveAverageChart(chartsGrid);
    await this.renderStatisticsSummaryChart(chartsGrid);
    await this.renderRankingChart(chartsGrid);
  }

  /**
   * Cria o cabeçalho da página
   */
  private createHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "statistics-header";
    header.innerHTML = `
      <h1>📊 Dashboard de Estatísticas</h1>
      <p>Visualize os dados e métricas do projeto</p>
    `;
    return header;
  }

  /**
   * Cria o grid para os gráficos
   */
  private createChartsGrid(): HTMLElement {
    const grid = document.createElement("div");
    grid.className = "charts-grid";
    return grid;
  }

  /**
   * Cria um contêiner para um gráfico
   */
  private createChartContainer(title: string): HTMLElement {
    const container = document.createElement("div");
    container.className = "chart-container";

    container.innerHTML = `
    <div class="chart-header">
      <span class="icon">📊</span>
      <h3>${title}</h3>
    </div>
    <div class="chart-body"></div>
  `;

    return container;
  }

  /**
   * Desenha gráfico de barra (Bar Chart)
   */
  private drawBarChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[] = [],
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barHeight = canvas.height / (labels.length + 1);
    const sanitizedData = data.map((value) => Number(value) || 0);
    const maxData = Math.max(...sanitizedData, 1);
    const barWidth = (canvas.width * 0.6) / maxData;

    labels.forEach((label, index) => {
      const y = (index + 1) * barHeight;
      const value = sanitizedData[index];
      const width = value * barWidth;
      const color =
        colors[index] || defaultColors[index % defaultColors.length];
      const labelText = label || "Sem nome";

      // Desenhar barra
      ctx.fillStyle = color;
      this.drawRoundedRect(
        ctx,
        100,
        y - barHeight / 2 + 10,
        width,
        barHeight - 20,
        6,
      );
      // Desenhar label à esquerda
      ctx.fillStyle = "#333";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "right";
      ctx.fillText(labelText, 90, y + 5);

      // Desenhar valor à direita
      ctx.fillStyle = "#333";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "left";
      ctx.fillText(String(value), width + 110, y + 5);
    });
  }

  /* Desenha gráfico de barras verticais */
  private drawVerticalBarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
  colors: string[] = []
): void {

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const padding = 50;

  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  const sanitizedData = data.map(v => Number(v) || 0);
  const maxValue = Math.max(...sanitizedData, 1);

  const barWidth = chartWidth / labels.length * 0.6;
  const spacing = chartWidth / labels.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  sanitizedData.forEach((value, index) => {

    const barHeight = (value / maxValue) * chartHeight;

    const x = padding + index * spacing + (spacing - barWidth) / 2;
    const y = canvas.height - padding - barHeight;

    const color =
      colors[index] || defaultColors[index % defaultColors.length];

    ctx.fillStyle = color;

    this.drawRoundedRect(
      ctx,
      x,
      y,
      barWidth,
      barHeight,
      6
    );

    // label em baixo
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 20);

    // valor acima da barra
    ctx.fillText(String(value), x + barWidth / 2, y - 5);
  });

}

  /**
   * Desenha gráfico de pizza (Pie Chart)
   */
  private drawPieChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[] = [],
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    const sanitizedData = data.map((value) => this.parseNumber(value));
    const total = sanitizedData.reduce((a, b) => a + b, 0);

    if (total === 0) return;

    let currentAngle = -Math.PI / 2;

    labels.forEach((label, index) => {
      const sliceAngle = (sanitizedData[index] / total) * 2 * Math.PI;
      const color =
        colors[index] || defaultColors[index % defaultColors.length];

      // Desenhar fatia
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle,
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenhar label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const percentage = ((sanitizedData[index] / total) * 100).toFixed(1);
      ctx.fillText(`${percentage}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Legenda
    this.drawLegend(ctx, labels, sanitizedData, colors, canvas.width - 150);
  }

  /**
   * Desenha gráfico de linha (Line Chart)
   */
  private drawLineChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[] = [],
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 60;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;

    const maxValue = Math.max(...data) * 1.1;
    const stepX = graphWidth / (labels.length - 1 || 1);
    const stepY = graphHeight / maxValue;

    const color = colors[0] || "#007bff";

    // Desenhar grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Desenhar linha
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = canvas.height - padding - value * stepY;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = padding + (index - 1) * stepX;
        const prevY = canvas.height - padding - data[index - 1] * stepY;

        const cpX = (prevX + x) / 2;

        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Desenhar pontos
    ctx.fillStyle = color;
    data.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = canvas.height - padding - value * stepY;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Desenhar eixos
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Labels do eixo X
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const x = padding + index * stepX;
      ctx.fillText(label, x, canvas.height - padding + 20);
    });

    // Labels do eixo Y
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      const value = (maxValue * (5 - i)) / 5;
      ctx.fillText(value.toFixed(0), padding - 10, y + 5);
    }
  }

  /**
   * Desenha gráfico de linha com múltiplas séries (um usuário por linha)
   */
  private drawMultiLineChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    datasets: Array<{ label: string; data: number[]; color?: string }>,
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 60;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;

    const allValues = datasets.flatMap((dataset) => dataset.data);
    const maxValue = Math.max(...allValues, 1) * 1.1;
    const stepX = graphWidth / (labels.length - 1 || 1);
    const stepY = graphHeight / maxValue;

    // Desenhar grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    datasets.forEach((dataset, datasetIndex) => {
      const color =
        dataset.color || defaultColors[datasetIndex % defaultColors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      dataset.data.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = canvas.height - padding - value * stepY;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.fillStyle = color;
      dataset.data.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = canvas.height - padding - value * stepY;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });

      const maxValue = Math.max(...dataset.data);
      if (Number.isFinite(maxValue) && maxValue > 0) {
        const maxIndex = dataset.data.indexOf(maxValue);
        const x = padding + maxIndex * stepX;
        const y = canvas.height - padding - maxValue * stepY;

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(maxValue), x, y - 14);
      }
    });

    // Desenhar eixos
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Labels do eixo X
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const x = padding + index * stepX;
      ctx.fillText(label, x, canvas.height - padding + 20);
    });

    // Labels do eixo Y
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      const value = (maxValue * (5 - i)) / 5;
      ctx.fillText(value.toFixed(0), padding - 10, y + 5);
    }

    // Legenda
    const legendX = canvas.width - padding - 150;
    let legendY = 30;
    datasets.forEach((dataset, datasetIndex) => {
      const color =
        dataset.color || defaultColors[datasetIndex % defaultColors.length];
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 12, 12);
      ctx.fillStyle = "#333";
      ctx.textAlign = "left";
      ctx.fillText(dataset.label, legendX + 18, legendY + 10);
      legendY += 24;
    });
  }

  /**
   * Desenha gráfico de rosca (Doughnut Chart)
   */
  private drawDoughnutChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[] = [],
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 50;
    const innerRadius = outerRadius * 0.6;
    const sanitizedData = data.map((value) => this.parseNumber(value));
    const total = sanitizedData.reduce((a, b) => a + b, 0);

    if (total === 0) return;

    let currentAngle = -Math.PI / 2;

    labels.forEach((label, index) => {
      const sliceAngle = (sanitizedData[index] / total) * 2 * Math.PI;
      const color =
        colors[index] || defaultColors[index % defaultColors.length];

      // Desenhar setor externo
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        outerRadius,
        currentAngle,
        currentAngle + sliceAngle,
      );
      ctx.lineTo(
        centerX + Math.cos(currentAngle + sliceAngle) * innerRadius,
        centerY + Math.sin(currentAngle + sliceAngle) * innerRadius,
      );
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        currentAngle + sliceAngle,
        currentAngle,
        true,
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Legenda
    this.drawLegend(ctx, labels, sanitizedData, colors, canvas.width - 150);
  }

  /**
   * Desenha legenda para gráficos
   */
  private drawLegend(
    ctx: CanvasRenderingContext2D,
    labels: string[],
    data: number[],
    colors: string[],
    startX: number,
  ): void {
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) return;

    let startY = 20;

    labels.forEach((label, index) => {
      const color =
        colors[index] || defaultColors[index % defaultColors.length];
      const percentage = ((data[index] / total) * 100).toFixed(1);

      // Quadrado de cor
      ctx.fillStyle = color;
      ctx.fillRect(startX, startY, 12, 12);

      // Label
      ctx.fillStyle = "#444";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`${label} (${percentage}%)`, startX + 18, startY + 10);

      startY += 25;
    });
  }

  private parseNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const normalized = String(value).replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private renderChartMessage(
    chartContainer: HTMLElement,
    message: string,
  ): void {
    const body = chartContainer.querySelector(".chart-body");
    if (!body) return;

    const info = document.createElement("div");
    info.className = "chart-empty";
    info.textContent = message;
    info.style.cssText =
      "padding: 1rem; color: #666; font-size: 0.95rem; text-align: center;";

    body.appendChild(info);
  }

  private async renderRankingMoreHoursChart(
    container: HTMLElement,
  ): Promise<void> {
    const chartContainer = this.createChartContainer(
      "📈 Top 3 Usuários por Horas Reais",
    );
    container.appendChild(chartContainer);

    const canvas = this.createCanvas();

    try {
      const ranking = await this.statisticsService.getRankingMoreHours();
      if (!ranking.length) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum resultado encontrado para ranking de horas.",
        );
        return;
      }

      const labels = ranking.map((entry) => entry.utilizador);
      const data = ranking.map((entry) => Number(entry.total_horas_reais) || 0);

      this.drawBarChart(canvas, labels, data, [
        "#007bff",
        "#28a745",
        "#ffc107",
      ]);
      chartContainer.querySelector(".chart-body")?.appendChild(canvas);
      this.charts.set("overview", canvas);
    } catch (error) {
      console.error("Erro ao carregar ranking de horas:", error);
      this.renderChartMessage(
        chartContainer,
        "Erro ao carregar ranking de horas.",
      );
    }
  }

  private async renderRankingIncreasedHoursChart(
    container: HTMLElement,
  ): Promise<void> {
    const chartContainer = this.createChartContainer(
      "📈 Maior Hora do Dia por Usuário",
    );
    container.appendChild(chartContainer);

    const canvas = this.createCanvas();

    try {
      const ranking = await this.statisticsService.getRankingIncreasedHours();
      if (!ranking.length) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum resultado encontrado para aumento de horas.",
        );
        return;
      }

      const selectedEntries = ranking.slice(0, 12);
      const rawDates = Array.from(
        new Set(selectedEntries.map((entry) => entry.data_dia)),
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      const formattedDates = rawDates.map((dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
          return dateString;
        }
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear());
        return `${day}/${month}/${year}`;
      });

      const userTotalsMap = new Map<string, number>();
      selectedEntries.forEach((entry) => {
        const horas = Number(entry.horas_dia) || 0;
        userTotalsMap.set(
          entry.utilizador,
          (userTotalsMap.get(entry.utilizador) ?? 0) + horas,
        );
      });

      const topUsers = Array.from(userTotalsMap.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([utilizador]) => utilizador);

      const datasets = topUsers.map((utilizador) => ({
        label: utilizador,
        data: rawDates.map((rawDate) => {
          const entry = selectedEntries.find(
            (item) =>
              item.utilizador === utilizador && item.data_dia === rawDate,
          );
          return entry ? Number(entry.horas_dia) || 0 : 0;
        }),
      }));

      this.drawMultiLineChart(canvas, formattedDates, datasets);
      chartContainer.querySelector(".chart-body")?.appendChild(canvas);
      this.charts.set("status", canvas);
    } catch (error) {
      console.error("Erro ao carregar ranking de aumento de horas:", error);
      this.renderChartMessage(
        chartContainer,
        "Erro ao carregar ranking de aumento de horas.",
      );
    }
  }

  /**
   * Renderiza o gráfico de ranking de projetos acima da média
   */
  private async renderRankingAboveAverageChart(
    container: HTMLElement,
  ): Promise<void> {
    const chartContainer = this.createChartContainer(
      "📊 Projetos Acima da Média de Horas",
    );
    container.appendChild(chartContainer);

    const canvas = this.createCanvas();

    try {
      const ranking = await this.statisticsService.getRankingAboveAverage();
      if (!ranking.length) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum resultado encontrado para projetos acima da média.",
        );
        return;
      }

      const labels = ranking.map((entry) => entry.projeto);
      const data = ranking.map((entry) => this.parseNumber(entry.total_horas_projeto));
      const total = data.reduce((sum, value) => sum + value, 0);

      if (total === 0) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum valor válido para exibir o gráfico de projetos acima da média.",
        );
        return;
      }

      this.drawPieChart(canvas, labels, data, [
        "#007bff",
        "#28a745",
        "#ffc107",
        "#17a2b8",
        "#6c757d",
      ]);
      chartContainer.querySelector(".chart-body")?.appendChild(canvas);
      this.charts.set("completion", canvas);
    } catch (error) {
      console.error("Erro ao carregar projects acima da média:", error);
      this.renderChartMessage(
        chartContainer,
        "Erro ao carregar projetos acima da média.",
      );
    }
  }

  /* Renderiza o gráfico de ranking de projetos acima da média */
    private async renderRankingChart(
    container: HTMLElement,
  ): Promise<void> {
    const chartContainer = this.createChartContainer(
      "📊 Projetos Acima da Média de Horas",
    );
    container.appendChild(chartContainer);

    const canvas = this.createCanvas();

    try {
      const ranking = await this.statisticsService.getRankingAboveAverage();
      if (!ranking.length) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum resultado encontrado para projetos acima da média.",
        );
        return;
      }

      const labels = ranking.map((entry) => entry.projeto);
      const data = ranking.map((entry) => this.parseNumber(entry.total_horas_projeto));
      const total = data.reduce((sum, value) => sum + value, 0);

      if (total === 0) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum valor válido para exibir o gráfico de projetos acima da média.",
        );
        return;
      }

      this.drawVerticalBarChart(canvas, labels, data, [
        "#007bff",
        "#28a745",
        "#ffc107",
        "#17a2b8",
        "#6c757d",
      ]);
      chartContainer.querySelector(".chart-body")?.appendChild(canvas);
      this.charts.set("completion", canvas);
    } catch (error) {
      console.error("Erro ao carregar projects acima da média:", error);
      this.renderChartMessage(
        chartContainer,
        "Erro ao carregar projetos acima da média.",
      );
    }
  }

  /* Renderiza o gráfico de resumo das estatísticas */
  private async renderStatisticsSummaryChart(
    container: HTMLElement,
  ): Promise<void> {
    const chartContainer = this.createChartContainer(
      "📉 Resumo do Dashboard de Estatísticas",
    );
    container.appendChild(chartContainer);

    const canvas = this.createCanvas();

    try {
      const moreHours = await this.statisticsService.getRankingMoreHours();
      const increasedHours =
        await this.statisticsService.getRankingIncreasedHours();
      const aboveAverage =
        await this.statisticsService.getRankingAboveAverage();

      const data = [
        moreHours.length,
        increasedHours.length,
        aboveAverage.length,
      ];
      if (data.every((value) => value === 0)) {
        this.renderChartMessage(
          chartContainer,
          "Nenhum dado de estatísticas disponível para exibir resumo.",
        );
        return;
      }

      this.drawDoughnutChart(
        canvas,
        ["Top Usuários", "Aumentos de Horas", "Projetos Acima da Média"],
        data,
        ["#007bff", "#28a745", "#ffc107"],
      );

      chartContainer.querySelector(".chart-body")?.appendChild(canvas);
      this.charts.set("comparison", canvas);
    } catch (error) {
      console.error("Erro ao carregar resumo de estatísticas:", error);
      this.renderChartMessage(
        chartContainer,
        "Erro ao carregar resumo de estatísticas.",
      );
    }
  }

  /**
   * Atualiza um gráfico específico
   */
  public async updateChart(chartName?: string): Promise<void> {
    await this.render();
  }

  /**
   * Atualiza todos os gráficos
   */
  public async updateAllCharts(): Promise<void> {
    await this.render();
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 300;

    // Responsivo
    canvas
    canvas

    return canvas;
  }
}
