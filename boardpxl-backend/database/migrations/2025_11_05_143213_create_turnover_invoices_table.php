<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTurnoverInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('turnover_invoices', function (Blueprint $table) {
            $table->id();
            $table->decimal('turnover', 9, 2);
            $table->decimal('commission', 9, 2);
            $table->decimal('raw_value', 9, 2);
            $table->decimal('tax', 5, 2);
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
        Schema::dropIfExists('turnover_invoices');
    }
}
