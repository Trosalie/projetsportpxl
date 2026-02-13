<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSettlementReportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('settlement_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('photographer_id');
            $table->string('status')->default('pending'); // pending, validated, rejected
            $table->decimal('amount', 15, 2);
            $table->decimal('commission', 15, 2);
            $table->date('period_start_date');
            $table->date('period_end_date');
            $table->timestamps();

            // Foreign key
            $table->foreign('photographer_id')
                ->references('id')
                ->on('photographers')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('settlement_reports');
    }
}
