<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicePaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->date('issue_date');
            $table->date('due_date');
            $table->string('description');
            $table->decimal('turnover', 10, 2);
            $table->decimal('raw_value', 9, 2);
            $table->decimal('commission', 9, 2);
            $table->decimal('tax', 5, 2);
            $table->decimal('vat', 9, 2);
            $table->date('start_period');
            $table->date('end_period');
            $table->string('link_pdf');
            $table->string('pdf_invoice_subject')->nullable();
            $table->foreignId('photographer_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoice_payments');
    }
}
