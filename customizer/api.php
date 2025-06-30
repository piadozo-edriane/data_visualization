<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'etl_processor.php';

$action = $_GET['action'] ?? '';

try {
    $etl = new ETLProcessor();
    
    switch($action) {
        case 'run_etl':
            $result = $etl->runETLProcess();
            echo json_encode($result);
            break;
            
        case 'sales_analytics':
            $query = "SELECT * FROM sales_analytics ORDER BY `year`, `month`";
            $data = $etl->extractData($query);
            echo json_encode($data);
            break;
            
        case 'product_performance':
            $query = "SELECT * FROM product_performance ORDER BY total_revenue DESC LIMIT 20";
            $data = $etl->extractData($query);
            echo json_encode($data);
            break;
            
        case 'customer_analytics':
            $query = "SELECT * FROM customer_analytics ORDER BY total_spent DESC LIMIT 15";
            $data = $etl->extractData($query);
            echo json_encode($data);
            break;
            
        case 'employee_performance':
            $query = "SELECT * FROM employee_performance ORDER BY total_sales DESC";
            $data = $etl->extractData($query);
            echo json_encode($data);
            break;
            
        case 'geographic_analytics':
            $query = "SELECT * FROM geographic_analytics ORDER BY total_revenue DESC";
            $data = $etl->extractData($query);
            echo json_encode($data);
            break;
            
        case 'dashboard_summary':
            // Get summary statistics for dashboard
            $summary = [];
            
            // Total sales
            $query = "SELECT SUM(total_sales) as total_sales FROM sales_analytics";
            $result = $etl->extractData($query);
            $summary['total_sales'] = $result[0]['total_sales'] ?? 0;
            
            // Total orders
            $query = "SELECT SUM(order_count) as total_orders FROM sales_analytics";
            $result = $etl->extractData($query);
            $summary['total_orders'] = $result[0]['total_orders'] ?? 0;
            
            // Total customers
            $query = "SELECT COUNT(customer_number) as total_customers FROM customer_analytics";
            $result = $etl->extractData($query);
            $summary['total_customers'] = $result[0]['total_customers'] ?? 0;
            
            // Average order value
            $query = "SELECT AVG(avg_order_value) as avg_order_value FROM sales_analytics";
            $result = $etl->extractData($query);
            $summary['avg_order_value'] = $result[0]['avg_order_value'] ?? 0;
            
            echo json_encode($summary);
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 