<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class LogActionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $actions = [
            // Invoice Credits Actions
            ['action' => 'create_credits_invoice_client', 'permission' => 'admin'],
            ['action' => 'create_credits_invoice_client_failed', 'permission' => 'admin'],
            ['action' => 'insert_credits_invoice', 'permission' => 'admin'],
            ['action' => 'insert_credits_invoice_failed', 'permission' => 'admin'],
            ['action' => 'get_invoices_credit_by_photographer', 'permission' => 'photographer'],
            ['action' => 'get_invoices_credit_by_photographer_failed', 'permission' => 'photographer'],
            
            // Invoice Payments Actions
            ['action' => 'create_turnover_payment_invoice', 'permission' => 'admin'],
            ['action' => 'create_turnover_payment_invoice_failed', 'permission' => 'admin'],
            ['action' => 'insert_turnover_invoice', 'permission' => 'admin'],
            ['action' => 'insert_turnover_invoice_failed', 'permission' => 'admin'],
            ['action' => 'get_invoices_payment_by_photographer', 'permission' => 'photographer'],
            ['action' => 'get_invoices_payment_by_photographer_failed', 'permission' => 'photographer'],
            
            // General Invoice Actions
            ['action' => 'list_invoices', 'permission' => 'photographer'],
            ['action' => 'list_invoices_by_client', 'permission' => 'photographer'],
            ['action' => 'get_invoice_by_id', 'permission' => 'photographer'],
            ['action' => 'get_invoice_by_id_not_found', 'permission' => 'photographer'],
            ['action' => 'get_product_from_invoice', 'permission' => 'photographer'],
            ['action' => 'get_product_from_invoice_not_found', 'permission' => 'photographer'],
            ['action' => 'download_invoice_proxy', 'permission' => 'photographer'],
            ['action' => 'download_invoice_proxy_missing_url', 'permission' => 'photographer'],
            
            // Photographer/Client Actions
            ['action' => 'lookup_client_id', 'permission' => 'photographer'],
            ['action' => 'lookup_client_id_not_found', 'permission' => 'photographer'],
            ['action' => 'list_photographers', 'permission' => 'admin'],
            ['action' => 'list_clients', 'permission' => 'photographer'],
            ['action' => 'get_photographers', 'permission' => 'admin'],
            ['action' => 'create_photographer', 'permission' => 'admin'],
            ['action' => 'create_photographer_failed', 'permission' => 'admin'],
            ['action' => 'update_photographer', 'permission' => 'admin'],
            ['action' => 'update_photographer_failed', 'permission' => 'admin'],
            ['action' => 'delete_photographer', 'permission' => 'admin'],
            ['action' => 'delete_photographer_failed', 'permission' => 'admin'],
            
            // Mail Actions
            ['action' => 'send_email', 'permission' => 'photographer'],
            ['action' => 'send_email_failed', 'permission' => 'photographer'],
            ['action' => 'get_mail_logs', 'permission' => 'photographer'],
            ['action' => 'get_mail_logs_failed', 'permission' => 'photographer'],
            
            // Authentication Actions
            ['action' => 'login', 'permission' => 'guest'],
            ['action' => 'login_failed', 'permission' => 'guest'],
            ['action' => 'logout', 'permission' => 'photographer'],
            ['action' => 'register', 'permission' => 'guest'],
            ['action' => 'register_failed', 'permission' => 'guest'],
            ['action' => 'password_reset_request', 'permission' => 'guest'],
            ['action' => 'password_reset_complete', 'permission' => 'guest'],
            
            // Data Export/Import Actions
            ['action' => 'export_invoices', 'permission' => 'photographer'],
            ['action' => 'export_invoices_failed', 'permission' => 'photographer'],
            ['action' => 'import_data', 'permission' => 'admin'],
            ['action' => 'import_data_failed', 'permission' => 'admin'],
        ];

        foreach ($actions as $action) {
            \App\Models\LogActions::updateOrCreate(
                ['action' => $action['action']],
                ['permission' => $action['permission']]
            );
        }
    }
}
