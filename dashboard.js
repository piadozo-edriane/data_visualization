class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
    }

    setupEventListeners() {
        document.getElementById('runETL').addEventListener('click', () => {
            this.runETLProcess();
        });

        // Add toggle chart/table event listeners
        document.querySelectorAll('.toggle-chart').forEach(button => {
            button.addEventListener('click', (e) => {
                const chartId = e.target.getAttribute('data-chart');
                const container = e.target.closest('.chart-container, .table-container');
                const isTable = chartId.includes('Table');
                
                if (container.classList.contains('hidden')) {
                    container.classList.remove('hidden');
                    e.target.textContent = `Hide ${isTable ? 'Table' : 'Chart'}`;
                    
                    // For charts, trigger resize after showing
                    if (!isTable && this.charts[chartId]) {
                        setTimeout(() => {
                            this.charts[chartId].resize();
                        }, 10);
                    }
                } else {
                    container.classList.add('hidden');
                    e.target.textContent = `Show ${isTable ? 'Table' : 'Chart'}`;
                }
            });
        });
    }

    async runETLProcess() {
        const button = document.getElementById('runETL');
        const originalText = button.textContent;
        const loadingDiv = document.getElementById('loading');
        
        try {
            button.textContent = 'Processing...';
            button.disabled = true;
            loadingDiv.style.display = 'flex';
            
            const response = await fetch('api.php?action=run_etl');
            const result = await response.json();
            
            if (result.status === 'success') {
                this.showMessage(`ETL process completed successfully in ${result.execution_time} seconds!`, 'success');
                this.loadDashboardData();
            } else {
                this.showMessage('ETL process failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showMessage('Error running ETL process: ' + error.message, 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
            loadingDiv.style.display = 'none';
        }
    }

    async loadDashboardData() {
        try {
            await this.loadSummaryData();
            
            await this.loadSalesChart();
            await this.loadProductChart();
            await this.loadCustomerChart();
            await this.loadGeographicChart();
            await this.loadEmployeeChart();
            
            await this.loadProductTable();
            await this.loadCustomerTable();
            
        } catch (error) {
            this.showMessage('Error loading dashboard data: ' + error.message, 'error');
        }
    }

    async loadSummaryData() {
        const response = await fetch('api.php?action=dashboard_summary');
        const data = await response.json();
        
        document.getElementById('totalSales').textContent = this.formatCurrency(data.total_sales);
        document.getElementById('totalOrders').textContent = this.formatNumber(data.total_orders);
        document.getElementById('totalCustomers').textContent = this.formatNumber(data.total_customers);
        document.getElementById('avgOrderValue').textContent = this.formatCurrency(data.avg_order_value);
    }

    async loadSalesChart() {
        const response = await fetch('api.php?action=sales_analytics');
        const data = await response.json();
        
        const labels = data.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`);
        const salesData = data.map(item => parseFloat(item.total_sales));
        const orderData = data.map(item => parseInt(item.order_count));
        
        this.createChart('salesChart', {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales ($)',
                    data: salesData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Order Count',
                    data: orderData,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Sales ($)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Orders'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    async loadProductChart() {
        const response = await fetch('api.php?action=product_performance');
        const data = await response.json();
        
        const labels = data.slice(0, 10).map(item => item.product_name.substring(0, 20) + '...');
        const revenueData = data.slice(0, 10).map(item => parseFloat(item.total_revenue));
        
        this.createChart('productChart', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenueData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    }
                }
            }
        });
    }

    async loadCustomerChart() {
        const response = await fetch('api.php?action=customer_analytics');
        const data = await response.json();
        
        const labels = data.slice(0, 10).map(item => item.customer_name.substring(0, 15) + '...');
        const spendingData = data.slice(0, 10).map(item => parseFloat(item.total_spent));
        
        this.createChart('customerChart', {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: spendingData,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                        '#fa709a', '#fee140'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async loadGeographicChart() {
        const response = await fetch('api.php?action=geographic_analytics');
        const data = await response.json();
        
        const labels = data.map(item => item.country);
        const revenueData = data.map(item => parseFloat(item.total_revenue));
        
        this.createChart('geographicChart', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenueData,
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: '#764ba2',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    }
                }
            }
        });
    }

    async loadEmployeeChart() {
        const response = await fetch('api.php?action=employee_performance');
        const data = await response.json();
        
        const labels = data.map(item => item.employee_name);
        const salesData = data.map(item => parseFloat(item.total_sales || 0));
        
        this.createChart('employeeChart', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales ($)',
                    data: salesData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales ($)'
                        }
                    }
                }
            }
        });
    }

    async loadProductTable() {
        const response = await fetch('api.php?action=product_performance');
        const data = await response.json();
        
        const tableHTML = this.createTableHTML(data.slice(0, 10), [
            { key: 'product_name', label: 'Product Name' },
            { key: 'product_line', label: 'Product Line' },
            { key: 'total_quantity_sold', label: 'Quantity Sold' },
            { key: 'total_revenue', label: 'Revenue ($)', formatter: this.formatCurrency },
            { key: 'avg_price', label: 'Avg Price ($)', formatter: this.formatCurrency }
        ]);
        
        document.getElementById('productTable').innerHTML = tableHTML;
    }

    async loadCustomerTable() {
        const response = await fetch('api.php?action=customer_analytics');
        const data = await response.json();
        
        const tableHTML = this.createTableHTML(data.slice(0, 10), [
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'country', label: 'Country' },
            { key: 'total_orders', label: 'Total Orders' },
            { key: 'total_spent', label: 'Total Spent ($)', formatter: this.formatCurrency },
            { key: 'avg_order_value', label: 'Avg Order Value ($)', formatter: this.formatCurrency }
        ]);
        
        document.getElementById('customerTable').innerHTML = tableHTML;
    }

    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(canvas, config);
    }

    createTableHTML(data, columns) {
        if (!data || data.length === 0) {
            return '<div class="loading">No data available</div>';
        }

        let html = '<table class="data-table"><thead><tr>';
        
        columns.forEach(column => {
            html += `<th>${column.label}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(column => {
                let value = row[column.key];
                if (column.formatter) {
                    value = column.formatter(value);
                }
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value || 0);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value || 0);
    }

    showMessage(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Remove any existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        // Add the new alert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => alertDiv.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
}); 