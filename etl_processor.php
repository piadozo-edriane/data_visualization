<?php
// ETL Processor for ClassicModels Database

class ETLProcessor {
    private $pdo;
    
    public function __construct() {
        $this->pdo = $this->getDBConnection();
    }
    
    // Get database connection
    private function getDBConnection() {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=destination_db", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    // Extract data from source tables
    public function extractData($query) {
        try {
            $stmt = $this->pdo->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Transform and load sales analytics data
    public function processSalesAnalytics() {
        $query = "
            SELECT 
                YEAR(o.orderDate) as year,
                MONTH(o.orderDate) as month,
                SUM(od.quantityOrdered * od.priceEach) as total_sales,
                COUNT(DISTINCT o.orderNumber) as order_count,
                COUNT(DISTINCT o.customerNumber) as customer_count,
                AVG(od.quantityOrdered * od.priceEach) as avg_order_value
            FROM classicmodels.orders o
            JOIN classicmodels.orderdetails od ON o.orderNumber = od.orderNumber
            WHERE o.orderDate IS NOT NULL
            GROUP BY YEAR(o.orderDate), MONTH(o.orderDate)
            ORDER BY year, month
        ";
        
        $data = $this->extractData($query);
        
        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("
                INSERT INTO sales_analytics (`year`, `month`, total_sales, order_count, customer_count, avg_order_value)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $row['year'],
                $row['month'],
                $row['total_sales'],
                $row['order_count'],
                $row['customer_count'],
                $row['avg_order_value']
            ]);
        }
        
        return count($data);
    }
    
    // Transform and load product performance data
    public function processProductPerformance() {
        $query = "
            SELECT 
                p.productCode,
                p.productName,
                p.productLine,
                SUM(od.quantityOrdered) as total_quantity_sold,
                SUM(od.quantityOrdered * od.priceEach) as total_revenue,
                AVG(od.priceEach) as avg_price,
                COUNT(DISTINCT o.orderNumber) as order_count
            FROM classicmodels.products p
            JOIN classicmodels.orderdetails od ON p.productCode = od.productCode
            JOIN classicmodels.orders o ON od.orderNumber = o.orderNumber
            GROUP BY p.productCode, p.productName, p.productLine
            ORDER BY total_revenue DESC
        ";
        
        $data = $this->extractData($query);
        
        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("
                INSERT INTO product_performance (product_code, product_name, product_line, total_quantity_sold, total_revenue, avg_price, order_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $row['productCode'],
                $row['productName'],
                $row['productLine'],
                $row['total_quantity_sold'],
                $row['total_revenue'],
                $row['avg_price'],
                $row['order_count']
            ]);
        }
        
        return count($data);
    }
    
    // Transform and load customer analytics data
    public function processCustomerAnalytics() {
        $query = "
            SELECT 
                c.customerNumber,
                c.customerName,
                c.country,
                c.city,
                COUNT(DISTINCT o.orderNumber) as total_orders,
                SUM(od.quantityOrdered * od.priceEach) as total_spent,
                AVG(od.quantityOrdered * od.priceEach) as avg_order_value,
                MIN(o.orderDate) as first_order_date,
                MAX(o.orderDate) as last_order_date
            FROM classicmodels.customers c
            JOIN classicmodels.orders o ON c.customerNumber = o.customerNumber
            JOIN classicmodels.orderdetails od ON o.orderNumber = od.orderNumber
            GROUP BY c.customerNumber, c.customerName, c.country, c.city
            ORDER BY total_spent DESC
        ";
        
        $data = $this->extractData($query);
        
        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("
                INSERT INTO customer_analytics (customer_number, customer_name, country, city, total_orders, total_spent, avg_order_value, first_order_date, last_order_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $row['customerNumber'],
                $row['customerName'],
                $row['country'],
                $row['city'],
                $row['total_orders'],
                $row['total_spent'],
                $row['avg_order_value'],
                $row['first_order_date'],
                $row['last_order_date']
            ]);
        }
        
        return count($data);
    }
    
    // Transform and load employee performance data
    public function processEmployeePerformance() {
        $query = "
            SELECT 
                e.employeeNumber,
                CONCAT(e.firstName, ' ', e.lastName) as employee_name,
                e.jobTitle,
                off.city as office_city,
                COUNT(DISTINCT c.customerNumber) as customers_managed,
                SUM(od.quantityOrdered * od.priceEach) as total_sales,
                AVG(od.quantityOrdered * od.priceEach) as avg_sales_per_customer
            FROM classicmodels.employees e
            LEFT JOIN classicmodels.customers c ON e.employeeNumber = c.salesRepEmployeeNumber
            LEFT JOIN classicmodels.orders o ON c.customerNumber = o.customerNumber
            LEFT JOIN classicmodels.orderdetails od ON o.orderNumber = od.orderNumber
            LEFT JOIN classicmodels.offices off ON e.officeCode = off.officeCode
            WHERE e.jobTitle LIKE '%Sales%'
            GROUP BY e.employeeNumber, e.firstName, e.lastName, e.jobTitle, off.city
            ORDER BY total_sales DESC
        ";
        
        $data = $this->extractData($query);
        
        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("
                INSERT INTO employee_performance (employee_number, employee_name, job_title, office_city, customers_managed, total_sales, avg_sales_per_customer)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $row['employeeNumber'],
                $row['employee_name'],
                $row['jobTitle'],
                $row['office_city'],
                $row['customers_managed'],
                $row['total_sales'],
                $row['avg_sales_per_customer']
            ]);
        }
        
        return count($data);
    }
    
    // Transform and load geographic analytics data
    public function processGeographicAnalytics() {
        $query = "
            SELECT 
                c.country,
                COUNT(DISTINCT c.customerNumber) as customer_count,
                SUM(od.quantityOrdered * od.priceEach) as total_revenue,
                AVG(od.quantityOrdered * od.priceEach) as avg_revenue_per_customer,
                COUNT(DISTINCT o.orderNumber) as order_count
            FROM classicmodels.customers c
            JOIN classicmodels.orders o ON c.customerNumber = o.customerNumber
            JOIN classicmodels.orderdetails od ON o.orderNumber = od.orderNumber
            GROUP BY c.country
            ORDER BY total_revenue DESC
        ";
        
        $data = $this->extractData($query);
        
        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("
                INSERT INTO geographic_analytics (country, customer_count, total_revenue, avg_revenue_per_customer, order_count)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $row['country'],
                $row['customer_count'],
                $row['total_revenue'],
                $row['avg_revenue_per_customer'],
                $row['order_count']
            ]);
        }
        
        return count($data);
    }
    
    // Run complete ETL process
    public function runETLProcess() {
        $results = [];
        
        try {
            $results['sales_analytics'] = $this->processSalesAnalytics();
            $results['product_performance'] = $this->processProductPerformance();
            $results['customer_analytics'] = $this->processCustomerAnalytics();
            $results['employee_performance'] = $this->processEmployeePerformance();
            $results['geographic_analytics'] = $this->processGeographicAnalytics();
            
            $results['status'] = 'success';
            $results['message'] = 'ETL process completed successfully';
        } catch (Exception $e) {
            $results['status'] = 'error';
            $results['message'] = 'ETL process failed: ' . $e->getMessage();
        }
        
        return $results;
    }
}
?> 