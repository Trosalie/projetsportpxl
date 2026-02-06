<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->date('issue_date');
            $table->date('due_date');
            $table->string('description');
            $table->decimal('tax', 9, 2);
            $table->decimal('vat', 5, 2);
            $table->string('link_pdf');
            $table->morphs('invoiceable');
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
        Schema::dropIfExists('invoices');
    }
}
