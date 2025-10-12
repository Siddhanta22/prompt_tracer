/**
 * Simple Chart.js implementation for Prompt Tracer Analytics
 * Lightweight charting solution for extension popup
 */

class PromptTracerCharts {
  constructor() {
    this.colors = {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3',
      light: '#f8f9fa',
      dark: '#333'
    };
  }

  // Create a simple line chart for performance trends
  createTrendChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || data.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">No data available</div>';
      return;
    }

    // Simple SVG line chart
    const width = 300;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.background = '#f8f9fa';
    svg.style.borderRadius = '8px';

    // Calculate scales
    const xScale = (width - margin.left - margin.right) / (data.length - 1);
    const yScale = (height - margin.top - margin.bottom) / 100;

    // Create line path
    const points = data.map((d, i) => {
      const x = margin.left + i * xScale;
      const y = height - margin.bottom - d.score * yScale;
      return `${x},${y}`;
    }).join(' L');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points}`);
    path.setAttribute('stroke', this.colors.primary);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    // Create area under the line
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const areaPoints = `${margin.left},${height - margin.bottom} L ${points} L ${margin.left + (data.length - 1) * xScale},${height - margin.bottom} Z`;
    areaPath.setAttribute('d', areaPath);
    areaPath.setAttribute('fill', `url(#gradient)`);
    areaPath.setAttribute('opacity', '0.3');

    // Create gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', this.colors.primary);
    stop1.setAttribute('stop-opacity', '0.8');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', this.colors.primary);
    stop2.setAttribute('stop-opacity', '0.1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);

    // Add data points
    data.forEach((d, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', margin.left + i * xScale);
      circle.setAttribute('cy', height - margin.bottom - d.score * yScale);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', this.colors.primary);
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      
      // Add tooltip
      circle.setAttribute('title', `Score: ${d.score}%`);
      
      svg.appendChild(circle);
    });

    // Add axes
    this.addAxes(svg, width, height, margin, data);

    svg.appendChild(defs);
    svg.appendChild(areaPath);
    svg.appendChild(path);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Create a bar chart for platform usage
  createPlatformChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || Object.keys(data).length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">No platform data available</div>';
      return;
    }

    const platforms = Object.keys(data);
    const maxValue = Math.max(...Object.values(data));
    const width = 300;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const barWidth = (width - margin.left - margin.right) / platforms.length - 10;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.background = '#f8f9fa';
    svg.style.borderRadius = '8px';

    platforms.forEach((platform, i) => {
      const value = data[platform];
      const barHeight = (value / maxValue) * (height - margin.top - margin.bottom);
      const x = margin.left + i * (barWidth + 10);
      const y = height - margin.bottom - barHeight;

      // Create bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', this.getPlatformColor(platform));
      rect.setAttribute('rx', '4');
      rect.setAttribute('ry', '4');

      // Add value label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', y - 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      text.setAttribute('fill', '#333');
      text.textContent = value;

      // Add platform label
      const platformLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      platformLabel.setAttribute('x', x + barWidth / 2);
      platformLabel.setAttribute('y', height - margin.bottom + 15);
      platformLabel.setAttribute('text-anchor', 'middle');
      platformLabel.setAttribute('font-size', '10');
      platformLabel.setAttribute('fill', '#666');
      platformLabel.textContent = this.getPlatformIcon(platform);

      svg.appendChild(rect);
      svg.appendChild(text);
      svg.appendChild(platformLabel);
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Create a doughnut chart for score distribution
  createScoreDistributionChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || data.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">No score data available</div>';
      return;
    }

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;

    data.forEach((item, i) => {
      const sliceAngle = (item.count / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      // Create arc path
      const path = this.createArcPath(centerX, centerY, radius, startAngle, endAngle);
      
      const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      slice.setAttribute('d', path);
      slice.setAttribute('fill', this.getScoreColor(item.range));
      slice.setAttribute('stroke', 'white');
      slice.setAttribute('stroke-width', '2');

      // Add percentage label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      if (item.count > 0) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '12');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', 'white');
        label.textContent = `${Math.round((item.count / total) * 100)}%`;
        svg.appendChild(label);
      }

      svg.appendChild(slice);
      currentAngle = endAngle;
    });

    // Add center text
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', centerX);
    centerText.setAttribute('y', centerY - 5);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('font-size', '16');
    centerText.setAttribute('font-weight', '700');
    centerText.setAttribute('fill', this.colors.dark);
    centerText.textContent = total;
    
    const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerLabel.setAttribute('x', centerX);
    centerLabel.setAttribute('y', centerY + 10);
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('font-size', '10');
    centerLabel.setAttribute('fill', '#666');
    centerLabel.textContent = 'Prompts';

    svg.appendChild(centerText);
    svg.appendChild(centerLabel);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Helper methods
  createArcPath(centerX, centerY, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${centerX} ${centerY} Z`;
  }

  polarToCartesian(centerX, centerY, radius, angleInRadians) {
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  getPlatformColor(platform) {
    const colors = {
      'gpt': '#10a37f',
      'claude': '#d97706',
      'grok': '#1da1f2',
      'gemini': '#4285f4',
      'unknown': '#6b7280'
    };
    return colors[platform] || colors.unknown;
  }

  getPlatformIcon(platform) {
    const icons = {
      'gpt': '🤖',
      'claude': '🧠',
      'grok': '🚀',
      'gemini': '💎',
      'unknown': '❓'
    };
    return icons[platform] || icons.unknown;
  }

  getScoreColor(range) {
    const colors = {
      '0-20': '#f44336',
      '21-40': '#ff9800',
      '41-60': '#ffc107',
      '61-80': '#4caf50',
      '81-100': '#2196f3'
    };
    return colors[range] || '#6b7280';
  }

  addAxes(svg, width, height, margin, data) {
    // Y-axis (scores)
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', height - margin.bottom);
    yAxis.setAttribute('stroke', '#ddd');
    yAxis.setAttribute('stroke-width', '1');
    svg.appendChild(yAxis);

    // X-axis (time)
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', height - margin.bottom);
    xAxis.setAttribute('x2', width - margin.right);
    xAxis.setAttribute('y2', height - margin.bottom);
    xAxis.setAttribute('stroke', '#ddd');
    xAxis.setAttribute('stroke-width', '1');
    svg.appendChild(xAxis);

    // Y-axis labels
    for (let i = 0; i <= 100; i += 25) {
      const y = height - margin.bottom - (i / 100) * (height - margin.top - margin.bottom);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', margin.left - 10);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#666');
      label.textContent = i;
      svg.appendChild(label);
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptTracerCharts;
} else {
  window.PromptTracerCharts = PromptTracerCharts;
}
