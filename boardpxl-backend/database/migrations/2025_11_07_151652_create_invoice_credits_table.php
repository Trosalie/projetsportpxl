<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoiceCreditsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoice_credits', function (Blueprint $table) {
            $table->id();
            $table->integer('number')->unique();
            $table->date('issue_date');
            $table->date('due_date');
            $table->string('description');
            $table->decimal('amount', 9, 2);
            $table->decimal('tax', 5, 2);
            $table->decimal('vat', 9, 2);
            $table->decimal('total_due', 10, 2);
            $table->integer('credits');
            $table->string('status');
            $table->string('link_pdf');
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
        Schema::dropIfExists('invoice_credits');
    }
}
