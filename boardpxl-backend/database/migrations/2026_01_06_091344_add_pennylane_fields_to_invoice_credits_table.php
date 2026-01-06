<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPennylaneFieldsToInvoiceCreditsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invoice_credits', function (Blueprint $table) {
            $table->string('external_id')->unique()->after('id');
            $table->timestamp('updated_at_api')->nullable()->after('status');
            $table->string('pennylane_invoice_number')->nullable()->after('status');
            $table->string('customer_name')->nullable()->after('photographer_id');
            $table->decimal('total_amount', 9, 2)->default(0)->after('amount');
            $table->string('currency')->default('EUR')->after('total_amount');
            $table->timestamp('issued_at')->nullable()->after('due_date');
            $table->timestamp('due_at')->nullable()->after('issued_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('invoice_credits', function (Blueprint $table) {
            $table->dropColumn([
                'external_id',
                'updated_at_api',
                'pennylane_invoice_number',
                'customer_name',
                'total_amount',
                'currency',
                'issued_at',
                'due_at',
            ]);
        });
    }
}
