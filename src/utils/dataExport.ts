/**
 * Data export utilities for health data and conversations
 */

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'html';
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface HealthDataExport {
  metrics: any[];
  insights: any[];
  conversations: any[];
  metadata: {
    exportedAt: string;
    userId: string;
    totalRecords: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

/**
 * Export health data in various formats
 */
export const exportHealthData = async (
  data: HealthDataExport,
  options: ExportOptions
): Promise<Blob> => {
  switch (options.format) {
    case 'json':
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    case 'csv':
      return new Blob([convertToCSV(data)], { type: 'text/csv' });
    
    case 'txt':
      return new Blob([convertToText(data, options)], { type: 'text/plain' });
    
    case 'html':
      return new Blob([convertToHTML(data, options)], { type: 'text/html' });
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

/**
 * Convert health data to CSV format
 */
const convertToCSV = (data: HealthDataExport): string => {
  let csv = '';
  
  // Export metrics
  if (data.metrics.length > 0) {
    csv += 'Health Metrics\n';
    csv += 'Type,Value,Unit,Timestamp,Source\n';
    
    data.metrics.forEach(metric => {
      csv += `${metric.metric_type},${metric.value},${metric.unit},${metric.timestamp},${metric.source}\n`;
    });
    
    csv += '\n';
  }
  
  // Export insights
  if (data.insights.length > 0) {
    csv += 'Health Insights\n';
    csv += 'Type,Title,Description,Priority,Created At\n';
    
    data.insights.forEach(insight => {
      const description = insight.description.replace(/,/g, ';').replace(/\n/g, ' ');
      csv += `${insight.type},${insight.title},"${description}",${insight.priority},${insight.created_at}\n`;
    });
  }
  
  return csv;
};

/**
 * Convert health data to plain text format
 */
const convertToText = (data: HealthDataExport, options: ExportOptions): string => {
  let text = 'HEALTH DATA EXPORT\n';
  text += '='.repeat(50) + '\n\n';
  
  // Metadata
  text += `Exported on: ${data.metadata.exportedAt}\n`;
  text += `User ID: ${data.metadata.userId}\n`;
  text += `Total records: ${data.metadata.totalRecords}\n`;
  
  if (data.metadata.dateRange) {
    text += `Date range: ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}\n`;
  }
  
  text += '\n' + '='.repeat(50) + '\n\n';
  
  // Health Metrics
  if (data.metrics.length > 0) {
    text += 'HEALTH METRICS\n';
    text += '-'.repeat(20) + '\n\n';
    
    data.metrics.forEach((metric, index) => {
      text += `${index + 1}. ${metric.metric_type.toUpperCase()}\n`;
      text += `   Value: ${metric.value} ${metric.unit}\n`;
      text += `   Source: ${metric.source}\n`;
      
      if (options.includeTimestamps) {
        text += `   Timestamp: ${new Date(metric.timestamp).toLocaleString()}\n`;
      }
      
      text += '\n';
    });
  }
  
  // Health Insights
  if (data.insights.length > 0) {
    text += 'HEALTH INSIGHTS\n';
    text += '-'.repeat(20) + '\n\n';
    
    data.insights.forEach((insight, index) => {
      text += `${index + 1}. ${insight.title}\n`;
      text += `   Type: ${insight.type}\n`;
      text += `   Priority: ${insight.priority}\n`;
      text += `   Description: ${insight.description}\n`;
      
      if (options.includeTimestamps) {
        text += `   Created: ${new Date(insight.created_at).toLocaleString()}\n`;
      }
      
      text += '\n';
    });
  }
  
  // Conversations
  if (data.conversations.length > 0) {
    text += 'CONVERSATIONS\n';
    text += '-'.repeat(20) + '\n\n';
    
    data.conversations.forEach((conversation, index) => {
      text += `Conversation ${index + 1}\n`;
      text += `Role: ${conversation.role.toUpperCase()}\n`;
      text += `Content: ${conversation.content}\n`;
      
      if (options.includeTimestamps && conversation.timestamp) {
        text += `Timestamp: ${new Date(conversation.timestamp).toLocaleString()}\n`;
      }
      
      text += '\n';
    });
  }
  
  return text;
};

/**
 * Convert health data to HTML format
 */
const convertToHTML = (data: HealthDataExport, options: ExportOptions): string => {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Data Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .metric, .insight, .conversation { background: #f9fafb; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .metric-value { font-size: 1.2em; font-weight: bold; color: #059669; }
        .timestamp { font-size: 0.9em; color: #6b7280; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f3f4f6; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Health Data Export</h1>
        <p><strong>Exported on:</strong> ${data.metadata.exportedAt}</p>
        <p><strong>User ID:</strong> ${data.metadata.userId}</p>
        <p><strong>Total records:</strong> ${data.metadata.totalRecords}</p>`;

  if (data.metadata.dateRange) {
    html += `<p><strong>Date range:</strong> ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}</p>`;
  }

  html += `</div>`;

  // Health Metrics Section
  if (data.metrics.length > 0) {
    html += `
    <div class="section">
        <h2>Health Metrics</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Source</th>`;
    
    if (options.includeTimestamps) {
      html += `<th>Timestamp</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    data.metrics.forEach(metric => {
      html += `
                <tr>
                    <td>${metric.metric_type}</td>
                    <td class="metric-value">${metric.value}</td>
                    <td>${metric.unit}</td>
                    <td>${metric.source}</td>`;
      
      if (options.includeTimestamps) {
        html += `<td class="timestamp">${new Date(metric.timestamp).toLocaleString()}</td>`;
      }
      
      html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;
  }

  // Health Insights Section
  if (data.insights.length > 0) {
    html += `<div class="section"><h2>Health Insights</h2>`;
    
    data.insights.forEach(insight => {
      html += `
        <div class="insight priority-${insight.priority}">
            <h3>${insight.title}</h3>
            <p><strong>Type:</strong> ${insight.type} | <strong>Priority:</strong> ${insight.priority}</p>
            <p>${insight.description}</p>`;
      
      if (options.includeTimestamps) {
        html += `<p class="timestamp">Created: ${new Date(insight.created_at).toLocaleString()}</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }

  // Conversations Section
  if (data.conversations.length > 0) {
    html += `<div class="section"><h2>Conversations</h2>`;
    
    data.conversations.forEach(conversation => {
      html += `
        <div class="conversation">
            <p><strong>${conversation.role.toUpperCase()}:</strong></p>
            <p>${conversation.content}</p>`;
      
      if (options.includeTimestamps && conversation.timestamp) {
        html += `<p class="timestamp">${new Date(conversation.timestamp).toLocaleString()}</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }

  html += `</body></html>`;
  
  return html;
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (
  type: string,
  format: string,
  userId?: string
): string => {
  const date = new Date().toISOString().split('T')[0];
  const userPart = userId ? `-${userId.substring(0, 8)}` : '';
  return `${type}-export${userPart}-${date}.${format}`;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};