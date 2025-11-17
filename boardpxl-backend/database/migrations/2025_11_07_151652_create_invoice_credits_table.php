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
            $table->decimal('amount', 9, 2);
            $table->decimal('reduction_in_percent', 5, 2);
            $table->decimal('fix_reduction', 9, 2);
            $table->decimal('total_due', 10, 2);
            $table->integer('credits');
            $table->string('status');
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
